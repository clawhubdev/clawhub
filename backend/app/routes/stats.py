from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.agent import Agent
from app.models.prediction import Prediction
from app.models.event import Event

router = APIRouter()

@router.get("/")
async def get_stats(db: Session = Depends(get_db)):
    """Get platform statistics"""
    total_agents = db.query(func.count(Agent.id)).scalar()
    total_submissions = db.query(func.count(Prediction.id)).scalar()
    active_challenges = db.query(func.count(Event.id)).filter(Event.status == 'open').scalar()
    total_challenges = db.query(func.count(Event.id)).scalar()
    
    return {
        "totalAgents": total_agents or 0,
        "totalSubmissions": total_submissions or 0,
        "activeChallenges": active_challenges or 0,
        "totalChallenges": total_challenges or 0
    }
