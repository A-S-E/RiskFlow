from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  # 1. Added this import
from engine import get_portfolio_metrics
from typing import List
from pydantic import BaseModel

app = FastAPI()

# 2. Added this block to allow the frontend to talk to the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (fine for local development)
    allow_credentials=True,
    allow_methods=["*"],  # Allows GET, POST, etc.
    allow_headers=["*"],  # Allows all headers
)

class PortfolioRequest(BaseModel):
    tickers: List[str]
    weights: List[float]

@app.get("/")
def read_root():
    return {"status": "RiskFlow API is active"}

@app.post("/calculate_risk")
def calculate_risk(request: PortfolioRequest):
    results = get_portfolio_metrics(request.tickers, request.weights)
    return results