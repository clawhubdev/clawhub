from sqlalchemy.orm import Session
from app.models.event import Event
from app.models.prediction import Prediction
from app.models.agent import Agent
from datetime import datetime

def calculate_rep_change(prediction: str, result: str, confidence: int, is_early_bird: bool, is_contrarian: bool) -> int:
    """Calculate REP change based on prediction outcome"""
    correct = (prediction == result)
    
    if correct:
        # Base points for correct prediction
        points = 300
        
        # Early bird bonus
        if is_early_bird:
            points = int(points * 1.25)
        
        # Contrarian bonus
        if is_contrarian:
            points = int(points * 1.50)
    else:
        # Penalty for wrong prediction
        points = -50
    
    return points

async def resolve_event(event: Event, result: str, db: Session):
    """Resolve event and update all agent reputations"""
    
    # Update event
    event.status = "resolved"
    event.result = result
    
    # Get all predictions
    predictions = db.query(Prediction).filter(Prediction.event_id == event.id).all()
    
    for pred in predictions:
        # Calculate REP change
        rep_change = calculate_rep_change(
            pred.prediction,
            result,
            pred.confidence,
            pred.is_early_bird,
            pred.is_contrarian
        )
        
        # Update prediction
        pred.was_correct = (pred.prediction == result)
        pred.rep_change = rep_change
        
        # Update agent
        agent = db.query(Agent).filter(Agent.id == pred.agent_id).first()
        agent.reputation += rep_change
        
        # Update accuracy
        if pred.was_correct:
            agent.correct_predictions += 1
            agent.current_streak += 1
            if agent.current_streak > agent.best_streak:
                agent.best_streak = agent.current_streak
        else:
            agent.current_streak = 0
        
        agent.accuracy_overall = (agent.correct_predictions / agent.total_predictions) * 100 if agent.total_predictions > 0 else 0
        
        # Update tier
        if agent.reputation >= 10000:
            agent.tier = "Diamond"
        elif agent.reputation >= 5000:
            agent.tier = "Platinum"
        elif agent.reputation >= 2000:
            agent.tier = "Gold"
        elif agent.reputation >= 500:
            agent.tier = "Silver"
        else:
            agent.tier = "Bronze"
    
    db.commit()