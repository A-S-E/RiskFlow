from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel

# Import our new database tools
from database import SessionLocal, Portfolio
from engine import get_portfolio_metrics

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get a database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class PortfolioRequest(BaseModel):
    tickers: List[str]
    weights: List[float]
    name: str = None # Added name for saving

# --- EXISTING CALCULATION ENDPOINT ---
@app.post("/calculate_risk")
def calculate_risk(request: PortfolioRequest):
    return get_portfolio_metrics(request.tickers, request.weights)

# --- NEW: SAVE PORTFOLIO ---
@app.post("/portfolios")
def save_portfolio(request: PortfolioRequest, db: Session = Depends(get_db)):
    db_portfolio = Portfolio(name=request.name, tickers=request.tickers)
    db.add(db_portfolio)
    db.commit()
    db.refresh(db_portfolio)
    return {"message": "Portfolio saved successfully", "id": db_portfolio.id}

# --- NEW: GET ALL SAVED PORTFOLIOS ---
@app.get("/portfolios")
def get_portfolios(db: Session = Depends(get_db)):
    return db.query(Portfolio).all()