from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, timedelta
import random

app = FastAPI(title="Cyclone Prediction API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CyclonePrediction(BaseModel):
    name: str
    location: str
    intensity: str
    windSpeed: str
    path: str
    landfall: str
    status: str
    coordinates: dict

# Sample data - replace with your actual prediction logic
def generate_sample_predictions(lat=None, lng=None):
    categories = ["Tropical Depression", "Tropical Storm", "Category 1", 
                 "Category 2", "Category 3", "Category 4", "Category 5"]
    statuses = ["Forming", "Intensifying", "Weakening", "Dissipating"]
    
    # Use provided coordinates or generate random ones
    if lat is None or lng is None:
        lat = random.uniform(5, 25)  # Between 5°N and 25°N
        lng = random.uniform(60, 100)  # Between 60°E and 100°E
    
    now = datetime.utcnow()
    
    predictions = []
    # Generate predictions for the next 7 days
    for days_ahead in range(1, 8):
        prediction_time = now + timedelta(days=days_ahead)
        
        # Add some randomness to the location
        pred_lat = lat + random.uniform(-2, 2)
        pred_lng = lng + random.uniform(-2, 2)
        
        predictions.append({
            "name": f"Cyclone {chr(65 + days_ahead - 1)}",  # A, B, C, etc.
            "location": f"{pred_lat:.2f}°N, {pred_lng:.2f}°E",
            "intensity": random.choice(categories),
            "windSpeed": f"{random.randint(40, 200)} km/h",
            "path": f"Moving {random.choice(['North', 'Northeast', 'East', 'Southeast', 'South', 'Southwest', 'West', 'Northwest'])} at {random.randint(5, 25)} km/h",
            "predictedTime": prediction_time.isoformat() + "Z",
            "status": random.choice(statuses),
            "coordinates": {
                "lat": pred_lat,
                "lng": pred_lng
            },
            "confidence": random.uniform(0.7, 0.95)  # Confidence score
        })
    
    return predictions
@app.get("/api/predictions")
async def get_predictions(lat: float = None, lng: float = None):
    try:
        predictions = generate_sample_predictions(lat, lng)
        return {"status": "success", "data": predictions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))