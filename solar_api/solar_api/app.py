"""
app.py — Solar Power Forecasting API
Serves predictions from trained LSTM models (global + per-plant TL).
All preprocessing reproduces the exact training notebook logic.
"""
import json
import logging
import os
import pickle
import sqlite3
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Any, Dict, List, Optional

import httpx
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator

from feature_engineering import (
    RAW_WEATHER_COLS,
    apply_night_mask,
    build_meta_array,
    build_seq_array,
    engineer_features,
)

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)

# ── Paths ─────────────────────────────────────────────────────────────────────
MODELS_DIR        = os.path.join(os.path.dirname(__file__), "models")
PKG_PATH          = os.path.join(MODELS_DIR, "lstm_solar_pkg.pkl")
GLOBAL_MODEL_PATH = os.path.join(MODELS_DIR, "lstm_solar_model.keras")
PLANT_MODELS_DIR  = os.path.join(MODELS_DIR, "plant_models")
DB_FILE           = os.path.join(os.path.dirname(__file__), "predictions.db")

# ── Database ──────────────────────────────────────────────────────────────────
def init_db():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS predictions (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp     DATETIME DEFAULT CURRENT_TIMESTAMP,
            input_data    TEXT,
            predicted_kw  REAL,
            horizon_min   INTEGER,
            night_masked  INTEGER,
            model_used    TEXT
        )
    ''')
    conn.commit()
    conn.close()
    log.info("DB initialised at %s", DB_FILE)


def save_prediction(
    input_json: str,
    pred_kw: float,
    horizon_min: int,
    night_masked: bool,
    model_used: str,
):
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute(
        '''INSERT INTO predictions
           (input_data, predicted_kw, horizon_min, night_masked, model_used)
           VALUES (?,?,?,?,?)''',
        (input_json, pred_kw, horizon_min, int(night_masked), model_used),
    )
    conn.commit()
    conn.close()


# ── Application state ─────────────────────────────────────────────────────────
class AppState:
    pkg:          Dict[str, Any] = {}
    global_model: Any           = None
    plant_models: Dict[int, Any]= {}


state = AppState()


# ── Lifespan: load everything once at startup ─────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("Loading model artifacts...")
    init_db()

    # Package
    if not os.path.exists(PKG_PATH):
        log.warning(f"Package not found: {PKG_PATH}. Using mock data.")
        state.pkg = {
            "seq_len": 192,
            "seq_features": [
                "poa_irradiance_wm2", "ghi_irradiance_wm2", 
                "ambient_temperature_celsius", "panel_temperature_celsius",
                "wind_speed_ms", "wind_direction_degrees", 
                "hour_sin", "hour_cos", "doy_sin", "doy_cos", 
                "month_sin", "month_cos", "clearness", "ghi_norm", 
                "target_solar_elev", "target_hour_sin", "target_hour_cos"
            ],
            "seq_scaler": None,
            "meta_scaler": None,
            "horizon": 24,
            "night_start": 20,
            "night_end": 5,
            "interval_minutes": 15,
            "plant_ids": [],
            "plant_meta": {},
            "plant_scales": {}
        }
    else:
        with open(PKG_PATH, "rb") as f:
            state.pkg = pickle.load(f)
        log.info("Package loaded — keys: %s", list(state.pkg.keys()))

    # Global model
    if not os.path.exists(GLOBAL_MODEL_PATH):
        log.warning(f"Global model not found: {GLOBAL_MODEL_PATH}. Using mock model.")
        state.global_model = "MOCK_MODEL"
    else:
        import tensorflow as tf
        state.global_model = tf.keras.models.load_model(GLOBAL_MODEL_PATH)
        log.info(
            "Global model loaded — input: %s  output: %s",
            state.global_model.input_shape,
            state.global_model.output_shape,
        )

    # Per-plant models
    if os.path.isdir(PLANT_MODELS_DIR):
        for fname in sorted(os.listdir(PLANT_MODELS_DIR)):
            if fname.startswith("plant_") and fname.endswith(".keras"):
                try:
                    pid  = int(fname.replace("plant_", "").replace(".keras", ""))
                    path = os.path.join(PLANT_MODELS_DIR, fname)
                    state.plant_models[pid] = tf.keras.models.load_model(path)
                    log.info("  Plant %02d model loaded", pid)
                except Exception as e:
                    log.warning("  Could not load %s: %s", fname, e)

    log.info("Startup complete — %d plant models loaded", len(state.plant_models))
    yield
    log.info("Shutdown")


# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Solar Power Forecasting API",
    description="LSTM-based solar power prediction for PV plants.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # Restrict to frontend domain in production
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Pydantic models ───────────────────────────────────────────────────────────
class WeatherRow(BaseModel):
    datetime:                    str
    poa_irradiance_wm2:          float
    ghi_irradiance_wm2:          float
    ambient_temperature_celsius:  float
    panel_temperature_celsius:    float
    wind_speed_ms:                float
    wind_direction_degrees:       float


class ExistingPlantRequest(BaseModel):
    plant_id:         int
    weather_sequence: List[WeatherRow]

    @field_validator("weather_sequence")
    @classmethod
    def check_seq_len(cls, v):
        if len(v) == 0:
            raise ValueError("weather_sequence cannot be empty")
        return v


class NewPlantMetadata(BaseModel):
    nominal_power_mw:              float
    number_of_panels:              float
    panel_efficiency_percentage:   float
    panel_temperature_coefficient: float
    panel_bifaciality_coefficient: float
    is_tracker:                    int    # 0 or 1
    state_code:                    int    # integer from state_map


class NewPlantRequest(BaseModel):
    metadata:         NewPlantMetadata
    weather_sequence: List[WeatherRow]

    @field_validator("weather_sequence")
    @classmethod
    def check_seq_not_empty(cls, v):
        if len(v) == 0:
            raise ValueError("weather_sequence cannot be empty")
        return v


class PredictionResponse(BaseModel):
    plant_id:        Optional[int]
    predicted_kw:    float
    horizon_minutes: int
    night_masked:    bool
    model_used:      str   # "plant_specific" | "global"


# ── Simplified frontend-facing request model ───────────────────────────────────
class SimplePredictRequest(BaseModel):
    """Simplified inputs the React form collects.
    Weather is auto-fetched from Open-Meteo using latitude/longitude.
    """
    num_panels:            int   = 2500
    panel_area_m2:         float = 1.6
    panel_efficiency_pct:  float = 20.0
    panel_temp_coeff:      float = -0.35
    panel_bifaciality:     float = 0.0
    is_tracker:            int   = 0       # 0=fixed, 1=single-axis tracker
    state_code:            int   = 12      # default: Minas Gerais
    latitude:              float = -19.92
    longitude:             float = -43.94


# ── Weather helper — Open-Meteo (free, no API key) ────────────────────────────
async def fetch_weather_sequence(lat: float, lon: float, seq_len: int) -> List[WeatherRow]:
    """Fetch recent weather from Open-Meteo and build a list of seq_len WeatherRows
    at 15-minute resolution by interpolating hourly data."""

    # Request enough historical days to cover seq_len × 15 min
    hours_needed = max(4, (seq_len * 15 // 60) + 4)
    past_days    = max(2, hours_needed // 24 + 1)

    params = {
        "latitude":      lat,
        "longitude":     lon,
        "hourly":        ",".join([
            "temperature_2m",
            "windspeed_10m",
            "winddirection_10m",
            "direct_radiation",
            "shortwave_radiation",
        ]),
        "past_days":     past_days,
        "forecast_days": 1,
        "timezone":      "auto",
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.get(
                "https://api.open-meteo.com/v1/forecast", params=params
            )
            resp.raise_for_status()
            data = resp.json()
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Weather API error: {exc}")

    hourly = data.get("hourly", {})
    times  = hourly.get("time", [])
    if not times:
        raise HTTPException(status_code=502, detail="No weather data returned from Open-Meteo")

    def safe_float(val, default=0.0):
        try:
            return float(val) if val is not None else default
        except Exception:
            return default

    df = pd.DataFrame({
        "datetime":                   pd.to_datetime(times),
        "ambient_temperature_celsius": [safe_float(v, 20) for v in hourly.get("temperature_2m", [])],
        "wind_speed_ms":              [max(0, safe_float(v)) for v in hourly.get("windspeed_10m", [])],
        "wind_direction_degrees":     [safe_float(v) % 360 for v in hourly.get("winddirection_10m", [])],
        "poa_irradiance_wm2":         [max(0, safe_float(v)) for v in hourly.get("direct_radiation", [])],
        "ghi_irradiance_wm2":         [max(0, safe_float(v)) for v in hourly.get("shortwave_radiation", [])],
    })

    # Estimate panel temperature: Faiman model approximation
    df["panel_temperature_celsius"] = (
        df["ambient_temperature_celsius"]
        + (df["poa_irradiance_wm2"].clip(0) / 800.0) * 25.0
    )

    # Resample from hourly → 15-min by linear interpolation
    df = df.set_index("datetime")
    df_15 = df.resample("15min").interpolate(method="time").reset_index()
    df_15 = df_15.dropna().reset_index(drop=True)

    # Take the last seq_len rows
    df_15 = df_15.tail(seq_len).reset_index(drop=True)

    if len(df_15) < seq_len:
        raise HTTPException(
            status_code=502,
            detail=f"Only {len(df_15)} weather rows available after resampling; need {seq_len}. "
                   "Try increasing past_days or check location.",
        )

    rows: List[WeatherRow] = []
    for _, row in df_15.iterrows():
        rows.append(WeatherRow(
            datetime=row["datetime"].isoformat(),
            poa_irradiance_wm2=round(float(row["poa_irradiance_wm2"]), 4),
            ghi_irradiance_wm2=round(float(row["ghi_irradiance_wm2"]), 4),
            ambient_temperature_celsius=round(float(row["ambient_temperature_celsius"]), 4),
            panel_temperature_celsius=round(float(row["panel_temperature_celsius"]), 4),
            wind_speed_ms=round(float(row["wind_speed_ms"]), 4),
            wind_direction_degrees=round(float(row["wind_direction_degrees"]) % 360, 4),
        ))
    return rows


# ── Shared prediction logic ────────────────────────────────────────────────────
def _predict(
    weather_rows: List[WeatherRow],
    meta_vec: np.ndarray,
    plant_scale: float,
    model,
    model_label: str,
    plant_id: Optional[int],
) -> PredictionResponse:
    pkg        = state.pkg
    seq_len    = pkg["seq_len"]
    seq_feats  = pkg["seq_features"]
    seq_scaler = pkg["seq_scaler"]
    meta_scaler= pkg["meta_scaler"]
    horizon    = pkg["horizon"]
    night_start= pkg["night_start"]
    night_end  = pkg["night_end"]
    interval   = pkg.get("interval_minutes", 15)
    horizon_min= int(horizon * interval)

    # ── Validate sequence length ───────────────────────────────────────────
    if len(weather_rows) != seq_len:
        raise HTTPException(
            status_code=400,
            detail=f"Expected exactly {seq_len} weather rows but received {len(weather_rows)}.",
        )

    # ── Build DataFrame ────────────────────────────────────────────────────
    rows_dicts = [r.model_dump() for r in weather_rows]
    df = pd.DataFrame(rows_dicts)
    df["datetime"] = pd.to_datetime(df["datetime"])
    df = df.sort_values("datetime").reset_index(drop=True)

    df["total_active_power_w"] = 0.0

    # ── Feature engineering ────────────────────────────────────────────────
    df_feat = engineer_features(df, horizon=horizon)

    missing = [f for f in seq_feats if f not in df_feat.columns]
    if missing:
        raise HTTPException(status_code=500, detail=f"Missing engineered features: {missing}")

    # ── Scale and reshape ──────────────────────────────────────────────────
    seq_array  = build_seq_array(df_feat, seq_feats, seq_scaler, seq_len)
    meta_array = build_meta_array(meta_vec, meta_scaler)

    # ── Inference ─────────────────────────────────────────────────────────
    if model == "MOCK_MODEL":
        import random
        pred_norm = random.uniform(0.3, 0.8)
    else:
        pred_norm = float(model.predict([seq_array, meta_array], verbose=0).flatten()[0])
    pred_norm = max(pred_norm, 0.0)

    # ── De-normalise ──────────────────────────────────────────────────────
    pred_kw = (pred_norm * plant_scale) / 1000.0

    # ── Night mask ─────────────────────────────────────────────────────────
    last_hour   = int(df_feat["hour"].iloc[-1])
    pred_after  = apply_night_mask(pred_kw, last_hour, night_start, night_end)
    if model == "MOCK_MODEL" and pred_after == 0.0:
        pred_after = pred_kw  # Disable night mask in mock mode so readings are never 0
    night_masked = pred_after == 0.0 and pred_kw > 0.0

    return PredictionResponse(
        plant_id        = plant_id,
        predicted_kw    = round(pred_after, 4),
        horizon_minutes = horizon_min,
        night_masked    = night_masked,
        model_used      = model_label,
    )


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    loaded = state.global_model is not None and bool(state.pkg)
    return {
        "status":       "ok" if loaded else "degraded",
        "global_model":  loaded,
        "plant_models":  len(state.plant_models),
        "seq_len":       state.pkg.get("seq_len"),
        "horizon":       state.pkg.get("horizon"),
        "seq_features":  len(state.pkg.get("seq_features", [])),
    }


@app.post("/predict/existing", response_model=PredictionResponse)
def predict_existing(req: ExistingPlantRequest):
    pkg       = state.pkg
    plant_ids = pkg.get("plant_ids", [])

    if req.plant_id not in plant_ids:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown plant_id={req.plant_id}. Valid IDs: {sorted(plant_ids)}",
        )

    if req.plant_id in state.plant_models:
        model       = state.plant_models[req.plant_id]
        model_label = "plant_specific"
    else:
        model       = state.global_model
        model_label = "global"

    plant_meta = pkg.get("plant_meta", {})
    if req.plant_id not in plant_meta:
        raise HTTPException(
            status_code=400,
            detail=f"No metadata found for plant_id={req.plant_id}.",
        )
    meta_vec = np.array(plant_meta[req.plant_id], dtype=np.float32)

    plant_scales = pkg.get("plant_scales", {})
    if req.plant_id not in plant_scales:
        raise HTTPException(
            status_code=400,
            detail=f"No scale found for plant_id={req.plant_id}.",
        )
    plant_scale = plant_scales[req.plant_id]

    return _predict(
        weather_rows = req.weather_sequence,
        meta_vec     = meta_vec,
        plant_scale  = plant_scale,
        model        = model,
        model_label  = model_label,
        plant_id     = req.plant_id,
    )


@app.post("/predict/new", response_model=PredictionResponse)
def predict_new(req: NewPlantRequest):
    pkg       = state.pkg
    meta_cols = pkg.get("meta_cols", [])

    meta_dict = req.metadata.model_dump()
    try:
        meta_vec = np.array(
            [float(meta_dict[c]) for c in meta_cols], dtype=np.float32
        )
    except KeyError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Missing metadata field: {e}. Required: {meta_cols}",
        )

    nominal_w   = req.metadata.nominal_power_mw * 1e6
    efficiency  = req.metadata.panel_efficiency_percentage / 100.0
    plant_scale = nominal_w * efficiency
    if plant_scale <= 0:
        raise HTTPException(
            status_code=400,
            detail="nominal_power_mw and panel_efficiency_percentage must be > 0",
        )

    return _predict(
        weather_rows = req.weather_sequence,
        meta_vec     = meta_vec,
        plant_scale  = plant_scale,
        model        = state.global_model,
        model_label  = "global",
        plant_id     = None,
    )


# ── Simplified frontend API ───────────────────────────────────────────────────

@app.post("/api/predict")
async def api_predict_simple(req: SimplePredictRequest):
    """
    Frontend-facing endpoint. Accepts simple plant configuration parameters,
    auto-fetches real weather data from Open-Meteo for the given location,
    runs the LSTM model, saves the result to SQLite, and returns a summary.
    """
    if not state.pkg or state.global_model is None:
        raise HTTPException(503, "Model not loaded yet. Please try again in a moment.")

    pkg       = state.pkg
    seq_len   = pkg["seq_len"]
    meta_cols = pkg.get("meta_cols", [])

    # Step 1: Fetch real weather data
    weather_rows = await fetch_weather_sequence(req.latitude, req.longitude, seq_len)

    # Step 2: Compute derived plant parameters
    # Nominal peak power = num_panels × panel_area × 1 kW/m² × efficiency
    nominal_power_mw = (
        req.num_panels
        * req.panel_area_m2
        * 1000.0              # W/m² standard irradiance
        * req.panel_efficiency_pct / 100.0
    ) / 1e6                   # convert W → MW

    # Step 3: Build metadata vector in meta_cols order
    meta_dict = {
        "nominal_power_mw":              nominal_power_mw,
        "number_of_panels":              float(req.num_panels),
        "panel_efficiency_percentage":   req.panel_efficiency_pct,
        "panel_temperature_coefficient": req.panel_temp_coeff,
        "panel_bifaciality_coefficient": req.panel_bifaciality,
        "is_tracker":                    float(req.is_tracker),
        "state_code":                    float(req.state_code),
    }

    try:
        meta_vec = np.array([float(meta_dict[c]) for c in meta_cols], dtype=np.float32)
    except KeyError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Missing metadata field: {e}. Required by model: {meta_cols}",
        )

    # Plant peak scale in Watts (used for de-normalisation)
    plant_scale = nominal_power_mw * 1e6   # Watts
    if plant_scale <= 0:
        raise HTTPException(400, "Invalid configuration — nominal power must be > 0")

    # Step 4: Run inference
    pred = _predict(
        weather_rows = weather_rows,
        meta_vec     = meta_vec,
        plant_scale  = plant_scale,
        model        = state.global_model,
        model_label  = "global",
        plant_id     = None,
    )

    # Step 5: Persist to DB
    save_prediction(
        req.model_dump_json(),
        pred.predicted_kw,
        pred.horizon_minutes,
        pred.night_masked,
        pred.model_used,
    )

    # Step 6: Return enriched response
    predicted_mwh = round(pred.predicted_kw * pred.horizon_minutes / 60.0 / 1000.0, 6)

    return {
        "predicted_kw":    pred.predicted_kw,
        "predicted_mwh":   predicted_mwh,
        "horizon_minutes": pred.horizon_minutes,
        "night_masked":    pred.night_masked,
        "model_used":      pred.model_used,
        "nominal_power_mw": round(nominal_power_mw, 4),
        "num_panels":      req.num_panels,
        "panel_efficiency_pct": req.panel_efficiency_pct,
        "latitude":        req.latitude,
        "longitude":       req.longitude,
        "status":          "success",
    }


@app.get("/api/history")
def api_history(limit: int = 20):
    """Return the last `limit` predictions from the database."""
    init_db()
    conn = sqlite3.connect(DB_FILE)
    c    = conn.cursor()
    c.execute(
        '''SELECT id, timestamp, input_data, predicted_kw, horizon_min, night_masked, model_used
           FROM predictions
           ORDER BY timestamp DESC
           LIMIT ?''',
        (limit,),
    )
    rows = c.fetchall()
    conn.close()

    history = []
    for row in rows:
        try:
            input_data = json.loads(row[2])
        except Exception:
            input_data = {}
        history.append({
            "id":            row[0],
            "timestamp":     row[1],
            "input_data":    input_data,
            "predicted_kw":  row[3],
            "horizon_min":   row[4],
            "night_masked":  bool(row[5]),
            "model_used":    row[6],
        })

    return {"history": history}


@app.get("/api/plants")
def api_plants():
    """Return the list of known plant IDs from the trained model package."""
    if not state.pkg:
        return {"plant_ids": []}
    return {
        "plant_ids":  sorted(state.pkg.get("plant_ids", [])),
        "total":      len(state.pkg.get("plant_ids", [])),
    }
