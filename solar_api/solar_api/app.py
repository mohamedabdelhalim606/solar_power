"""
app.py — Solar Power Forecasting API
Serves predictions from trained LSTM models (global + per-plant TL).
All preprocessing reproduces the exact training notebook logic.
"""
import logging
import os
import pickle
from contextlib import asynccontextmanager
from typing import Any, Dict, List, Optional

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

    # Package
    if not os.path.exists(PKG_PATH):
        raise RuntimeError(f"Package not found: {PKG_PATH}")
    with open(PKG_PATH, "rb") as f:
        state.pkg = pickle.load(f)
    log.info("Package loaded — keys: %s", list(state.pkg.keys()))

    # Global model
    if not os.path.exists(GLOBAL_MODEL_PATH):
        raise RuntimeError(f"Global model not found: {GLOBAL_MODEL_PATH}")

    import tensorflow as tf
    state.global_model = tf.keras.models.load_model(GLOBAL_MODEL_PATH)
    log.info("Global model loaded — input: %s  output: %s",
             state.global_model.input_shape, state.global_model.output_shape)

    # Per-plant models
    if os.path.isdir(PLANT_MODELS_DIR):
        for fname in sorted(os.listdir(PLANT_MODELS_DIR)):
            if fname.startswith("plant_") and fname.endswith(".keras"):
                try:
                    pid = int(fname.replace("plant_", "").replace(".keras", ""))
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
    description="LSTM-based 24h-ahead solar power prediction for 51 Brazilian PV plants.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # restrict to frontend domain in production
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
        # length validated against SEQ_LEN after pkg is loaded (done in endpoint)
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
            detail=f"Expected exactly {seq_len} weather rows but received {len(weather_rows)}."
        )

    # ── Build DataFrame ────────────────────────────────────────────────────
    rows_dicts = [r.model_dump() for r in weather_rows]
    df = pd.DataFrame(rows_dicts)
    df["datetime"] = pd.to_datetime(df["datetime"])
    df = df.sort_values("datetime").reset_index(drop=True)

    # total_active_power_w for feature engineering — set to 0 for inference
    # (we don't have actual power during real-time inference; the model
    # will use irradiance + temporal features as the primary signal)
    df["total_active_power_w"] = 0.0

    # ── Feature engineering (exact training logic) ─────────────────────────
    df_feat = engineer_features(df, horizon=horizon)

    # Verify all required features are present
    missing = [f for f in seq_feats if f not in df_feat.columns]
    if missing:
        raise HTTPException(status_code=500,
                            detail=f"Missing engineered features: {missing}")

    # ── Scale and reshape ──────────────────────────────────────────────────
    seq_array  = build_seq_array(df_feat, seq_feats, seq_scaler, seq_len)
    meta_array = build_meta_array(meta_vec, meta_scaler)

    # ── Inference ─────────────────────────────────────────────────────────
    pred_norm = float(model.predict(
        [seq_array, meta_array], verbose=0
    ).flatten()[0])
    pred_norm = max(pred_norm, 0.0)   # clip negative (matches np.clip in notebook)

    # ── De-normalise (exact: pred_norm * plant_peak_watts / 1000) ─────────
    pred_kw = (pred_norm * plant_scale) / 1000.0

    # ── Night mask (exact training logic) ─────────────────────────────────
    last_hour  = int(df_feat["hour"].iloc[-1])
    pred_after = apply_night_mask(pred_kw, last_hour, night_start, night_end)
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
        "status":        "ok" if loaded else "degraded",
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

    # ── Validate plant_id ──────────────────────────────────────────────────
    if req.plant_id not in plant_ids:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown plant_id={req.plant_id}. "
                   f"Valid IDs: {sorted(plant_ids)}"
        )

    # ── Select model ───────────────────────────────────────────────────────
    if req.plant_id in state.plant_models:
        model       = state.plant_models[req.plant_id]
        model_label = "plant_specific"
    else:
        model       = state.global_model
        model_label = "global"

    # ── Get plant metadata (raw, unscaled — from saved plant_meta dict) ────
    plant_meta = pkg.get("plant_meta", {})
    if req.plant_id not in plant_meta:
        raise HTTPException(
            status_code=400,
            detail=f"No metadata found for plant_id={req.plant_id}."
        )
    meta_vec = np.array(plant_meta[req.plant_id], dtype=np.float32)

    # ── Get plant scale (99th-pct peak in Watts) ───────────────────────────
    plant_scales = pkg.get("plant_scales", {})
    if req.plant_id not in plant_scales:
        raise HTTPException(
            status_code=400,
            detail=f"No scale found for plant_id={req.plant_id}."
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
    pkg      = state.pkg
    meta_cols= pkg.get("meta_cols", [])

    # ── Build metadata vector in META_COLS order ───────────────────────────
    meta_dict = req.metadata.model_dump()
    try:
        meta_vec = np.array(
            [float(meta_dict[c]) for c in meta_cols],
            dtype=np.float32,
        )
    except KeyError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Missing metadata field: {e}. Required: {meta_cols}"
        )

    # ── Plant scale for new plant ──────────────────────────────────────────
    # New plant has no stored peak. Use nominal_power_mw × 1e6 × efficiency
    # as a proxy (same unit as training: Watts).
    # This is a reasonable approximation — actual peak would need real data.
    nominal_w   = req.metadata.nominal_power_mw * 1e6
    efficiency  = req.metadata.panel_efficiency_percentage / 100.0
    plant_scale = nominal_w * efficiency   # Watts (rough proxy)
    if plant_scale <= 0:
        raise HTTPException(
            status_code=400,
            detail="nominal_power_mw and panel_efficiency_percentage must be > 0"
        )

    return _predict(
        weather_rows = req.weather_sequence,
        meta_vec     = meta_vec,
        plant_scale  = plant_scale,
        model        = state.global_model,
        model_label  = "global",
        plant_id     = None,
    )
