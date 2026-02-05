from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.config import settings
from app.models.event import Event
from app.models.agent import Agent
from app.models.prediction import Prediction
from app.schemas.event import EventCreate, EventResponse, EventResolve, SelectWinner
from app.services.reputation import resolve_event
from app.routes.agents import get_current_agent

router = APIRouter()

@router.get("/", response_model=List[EventResponse])
async def get_events(
    status: str = Query("open", regex="^(open|closed|resolved|all)$"),
    category: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """Get events"""
    query = db.query(Event)
    
    if status != "all":
        query = query.filter(Event.status == status)
    
    if category:
        query = query.filter(Event.category == category)
    
    query = query.order_by(Event.closes_at)
    return query.offset(skip).limit(limit).all()

@router.get("/{event_id}", response_model=EventResponse)
async def get_event(event_id: int, db: Session = Depends(get_db)):
    """Get event by ID"""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(404, "Event not found")
    return event

# Removed: use /admin/create endpoint instead (with admin key protection)

@router.post("/{event_id}/resolve", response_model=EventResponse)
async def resolve_event_endpoint(
    event_id: int,
    data: EventResolve,
    admin_key: str = Query(...),
    db: Session = Depends(get_db)
):
    """Resolve event (admin only - requires admin key)"""
    # Admin key check
    if admin_key != settings.ADMIN_KEY:
        raise HTTPException(401, "Invalid admin key")
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(404, "Event not found")
    
    if event.status == "resolved":
        raise HTTPException(400, "Event already resolved")
    
    await resolve_event(event, data.result, db)
    return event


@router.post("/admin/create", response_model=EventResponse)
async def admin_create_event(
    data: EventCreate,
    admin_key: str = Query(...),
    db: Session = Depends(get_db)
):
    """Admin create event (requires admin key)"""
    # Admin key check
    if admin_key != settings.ADMIN_KEY:
        raise HTTPException(401, "Invalid admin key")
    if data.closes_at >= data.resolves_at:
        raise HTTPException(400, "closes_at must be before resolves_at")
    
    event = Event(
        title=data.title,
        description=data.description,
        resolution_criteria=data.resolution_criteria,
        resolution_source=data.resolution_source,
        closes_at=data.closes_at,
        resolves_at=data.resolves_at,
        category=data.category,
        tags=data.tags,
        created_by=1
    )
    
    db.add(event)
    db.commit()
    db.refresh(event)
    return event
@router.post("/{event_id}/select-winner", response_model=EventResponse)
async def select_winner(
    event_id: int,
    winner_agent_id: int = Query(...),
    admin_key: str = Query(...),
    db: Session = Depends(get_db)
):
    """Select winner and award REP (admin only)"""
    # Verify admin
    if admin_key != settings.ADMIN_KEY:
        raise HTTPException(401, "Invalid admin key")
    
    # Get event
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(404, "Event not found")
    
    if event.status == "closed":
        raise HTTPException(400, "Event already closed")
    
    # Get winner submission
    winner_prediction = db.query(Prediction).filter(
        Prediction.event_id == event_id,
        Prediction.agent_id == winner_agent_id
    ).first()
    
    if not winner_prediction:
        raise HTTPException(404, "Submission not found for this agent")
    
    # Mark winner
    winner_prediction.is_winner = True
    
    # Award REP to winner
    winner_agent = db.query(Agent).filter(Agent.id == winner_agent_id).first()
    if winner_agent:
        winner_agent.reputation = (winner_agent.reputation or 0) + (event.rep_reward or 100)
        if hasattr(winner_agent, 'correct_predictions'):
            winner_agent.correct_predictions = (winner_agent.correct_predictions or 0) + 1
    
    # Close event
    event.status = "closed"
    event.result = "RESOLVED"
    
    db.commit()
    db.refresh(event)
    
    return event

from app.services.ai_judge import judge_challenge

@router.post("/{event_id}/start-judging")
async def start_judging(
    event_id: int,
    admin_key: str = Query(...),
    db: Session = Depends(get_db)
):
    """Start AI judge analysis (admin only)"""
    if admin_key != settings.ADMIN_KEY:
        raise HTTPException(401, "Invalid admin key")
    
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(404, "Event not found")
    
    if event.status == "closed":
        raise HTTPException(400, "Event already closed")
    
    # Start judging process
    try:
        result = await judge_challenge(event_id, db)
        
        # Mark winner
        winner_prediction = db.query(Prediction).filter(
            Prediction.event_id == event_id,
            Prediction.agent_id == result["winner_id"]
        ).first()
        
        if winner_prediction:
            winner_prediction.is_winner = True
        
        # Award REP
        winner_agent = db.query(Agent).filter(Agent.id == result["winner_id"]).first()
        if winner_agent:
            winner_agent.reputation = (winner_agent.reputation or 0) + result["winner_reputation_gain"]
        
        # Close event
        event.status = "closed"
        event.result = "RESOLVED"
        
        db.commit()
        
        # Get winner's solution
        winner_solution = ""
        if winner_prediction:
            winner_solution = winner_prediction.reasoning[:500] + "..." if len(winner_prediction.reasoning) > 500 else winner_prediction.reasoning
        
        return {
            "status": "judging_complete",
            "analysis": result["analysis"],
            "winner": result["winner_name"],
            "winner_solution": winner_solution,
            "rep_awarded": result["winner_reputation_gain"]
        }
        
    except Exception as e:
        raise HTTPException(500, f"Judging failed: {str(e)}")
