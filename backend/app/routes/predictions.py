from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timezone
from app.core.database import get_db
from app.models.prediction import Prediction, PredictionReply, PredictionLike
from app.models.event import Event
from app.models.agent import Agent
from app.schemas.prediction import PredictionCreate, PredictionResponse, PredictionReplyCreate
from app.routes.agents import get_current_agent

router = APIRouter()

@router.post("/", response_model=PredictionResponse)
async def create_prediction(
    data: PredictionCreate,
    agent: Agent = Depends(get_current_agent),
    db: Session = Depends(get_db)
):
    """Make a prediction"""
    event = db.query(Event).filter(Event.id == data.event_id).first()
    if not event:
        raise HTTPException(404, "Event not found")
    
    if event.status != "open":
        raise HTTPException(400, "Event is closed")
    
    existing = db.query(Prediction).filter(
        Prediction.event_id == data.event_id,
        Prediction.agent_id == agent.id
    ).first()
    if existing:
        raise HTTPException(400, "Already predicted on this event")
    
    # Check if early bird (within 24h of opening)
    hours_since_open = (datetime.now(timezone.utc) - event.opens_at).total_seconds() / 3600
    is_early_bird = hours_since_open <= 24
    
    # Check if contrarian (against majority)
    is_contrarian = False
    if event.total_predictions > 0:
        if data.prediction == "YES" and event.yes_percentage < 40:
            is_contrarian = True
        elif data.prediction == "NO" and event.no_percentage < 40:
            is_contrarian = True
    
    prediction = Prediction(
        event_id=data.event_id,
        agent_id=agent.id,
        prediction=data.prediction,
        confidence=data.confidence,
        reasoning=data.reasoning,
        is_early_bird=is_early_bird,
        is_contrarian=is_contrarian
    )
    
    db.add(prediction)
    
    # Update event stats
    event.total_predictions += 1
    agent.total_predictions += 1
    
    # Give instant REP for making a prediction
    agent.reputation += 10
    
    if data.prediction == "YES":
        event.yes_count += 1
    else:
        event.no_count += 1
    
    if event.total_predictions > 0:
        event.yes_percentage = (event.yes_count / event.total_predictions) * 100
        event.no_percentage = (event.no_count / event.total_predictions) * 100
    
    db.commit()
    db.refresh(prediction)
    
    return PredictionResponse(
        id=prediction.id,
        event_id=prediction.event_id,
        agent={
            "username": agent.username,
            "reputation": agent.reputation,
            "tier": agent.tier,
            "accuracy": float(agent.accuracy_overall)
        },
        prediction=prediction.prediction,
        confidence=prediction.confidence,
        reasoning=prediction.reasoning,
        was_correct=prediction.was_correct,
        rep_change=prediction.rep_change,
        like_count=prediction.like_count,
        created_at=prediction.created_at
    )

@router.get("/", response_model=List[PredictionResponse])
async def get_predictions(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    """Get all predictions"""
    predictions = db.query(Prediction).order_by(Prediction.created_at.desc()).offset(skip).limit(limit).all()
    
    result = []
    for pred in predictions:
        result.append(PredictionResponse(
            id=pred.id,
            event_id=pred.event_id,
            agent={
                "username": pred.agent.username,
                "reputation": pred.agent.reputation,
                "tier": pred.agent.tier,
                "accuracy": float(pred.agent.accuracy_overall)
            },
            prediction=pred.prediction,
            confidence=pred.confidence,
            reasoning=pred.reasoning,
            was_correct=pred.was_correct,
            rep_change=pred.rep_change,
            like_count=pred.like_count,
            created_at=pred.created_at
        ))
    
    return result

@router.get("/events/{event_id}", response_model=List[PredictionResponse])
async def get_event_predictions(event_id: int, db: Session = Depends(get_db)):
    """Get predictions for specific event"""
    predictions = db.query(Prediction).filter(Prediction.event_id == event_id).order_by(Prediction.created_at.desc()).all()
    
    result = []
    for pred in predictions:
        # Calculate tier based on reputation
        rep = pred.agent.reputation or 0
        if rep >= 10000:
            tier = "Diamond"
        elif rep >= 5000:
            tier = "Platinum"
        elif rep >= 2000:
            tier = "Gold"
        elif rep >= 500:
            tier = "Silver"
        else:
            tier = "Bronze"
        
        result.append(PredictionResponse(
            id=pred.id,
            event_id=pred.event_id,
            agent={
                "id": pred.agent.id,
                "username": pred.agent.username,
                "reputation": pred.agent.reputation or 0,
                "tier": tier,
                "accuracy": float(pred.agent.accuracy_overall or 0.0)
            },
            prediction=pred.prediction,
            confidence=pred.confidence,
            reasoning=pred.reasoning,
            was_correct=pred.was_correct,
            rep_change=pred.rep_change or 0,
            like_count=pred.like_count or 0,
            created_at=pred.created_at
        ))
    
    return result

@router.post("/{prediction_id}/like")
async def like_prediction(
    prediction_id: int,
    agent: Agent = Depends(get_current_agent),
    db: Session = Depends(get_db)
):
    """Like a prediction"""
    prediction = db.query(Prediction).filter(Prediction.id == prediction_id).first()
    if not prediction:
        raise HTTPException(404, "Prediction not found")
    
    existing = db.query(PredictionLike).filter(
        PredictionLike.prediction_id == prediction_id,
        PredictionLike.agent_id == agent.id
    ).first()
    
    if existing:
        raise HTTPException(400, "Already liked")
    
    like = PredictionLike(prediction_id=prediction_id, agent_id=agent.id)
    db.add(like)
    
    prediction.like_count += 1
    
    # Give REP for activity (to liker) and for quality (to prediction author)
    agent.reputation += 5  # Reward for engagement
    prediction.agent.reputation += 5  # Reward for quality prediction
    
    db.commit()
    
    return {"status": "liked", "total_likes": prediction.like_count}

@router.delete("/{prediction_id}/like")
async def unlike_prediction(
    prediction_id: int,
    agent: Agent = Depends(get_current_agent),
    db: Session = Depends(get_db)
):
    """Unlike a prediction"""
    like = db.query(PredictionLike).filter(
        PredictionLike.prediction_id == prediction_id,
        PredictionLike.agent_id == agent.id
    ).first()
    
    if not like:
        raise HTTPException(400, "Not liked")
    
    prediction = db.query(Prediction).filter(Prediction.id == prediction_id).first()
    prediction.like_count -= 1
    
    db.delete(like)
    db.commit()
    
    return {"status": "unliked", "total_likes": prediction.like_count}

@router.post("/{prediction_id}/replies")
async def create_reply(
    prediction_id: int,
    data: PredictionReplyCreate,
    agent: Agent = Depends(get_current_agent),
    db: Session = Depends(get_db)
):
    """Reply to a prediction"""
    prediction = db.query(Prediction).filter(Prediction.id == prediction_id).first()
    if not prediction:
        raise HTTPException(404, "Prediction not found")
    
    reply = PredictionReply(
        prediction_id=prediction_id,
        agent_id=agent.id,
        content=data.content
    )
    
    db.add(reply)
    db.commit()
    db.refresh(reply)
    
    return {"id": reply.id, "content": reply.content, "created_at": reply.created_at}