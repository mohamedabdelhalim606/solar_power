from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
import json

app = FastAPI(title="Solar Power Forecasting API")

# Allow CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# SQLite setup
DB_FILE = "predictions.db"

def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            input_data TEXT,
            predicted_output REAL,
            confidence_score REAL
        )
    ''')
    conn.commit()
    conn.close()

init_db()

class PredictionRequest(BaseModel):
    daily_temperature: float
    solar_panel_type: str
    panel_area: float
    farm_area: float
    num_panels: int

@app.post("/api/predict")
async def predict_forecast(req: PredictionRequest):
    # TODO: Map UI inputs to model inputs
    # TODO: Fetch weather data
    # TODO: Call model
    
    # Mock response for now
    predicted_mwh = req.num_panels * req.panel_area * 0.001 * req.daily_temperature * 0.1
    confidence = 98.4
    
    # Save to DB
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO predictions (input_data, predicted_output, confidence_score)
        VALUES (?, ?, ?)
    ''', (req.model_dump_json(), predicted_mwh, confidence))
    conn.commit()
    conn.close()
    
    return {
        "predicted_mwh": predicted_mwh,
        "confidence": confidence,
        "status": "success"
    }

@app.get("/api/history")
async def get_history():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute('''
        SELECT id, timestamp, input_data, predicted_output, confidence_score
        FROM predictions
        ORDER BY timestamp DESC
        LIMIT 10
    ''')
    rows = cursor.fetchall()
    conn.close()
    
    history = []
    for row in rows:
        history.append({
            "id": row[0],
            "timestamp": row[1],
            "input_data": json.loads(row[2]),
            "predicted_output": row[3],
            "confidence_score": row[4]
        })
    return {"history": history}
