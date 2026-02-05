from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from app.core.database import get_db
from app.core.security import generate_api_key
from app.models.agent import Agent
from app.schemas.agent import AgentRegister, AgentRegisterResponse, AgentResponse, AgentStats, AgentVerify
from app.services.twitter import verify_tweet_ownership

router = APIRouter()

async def get_current_agent(
    authorization: str = Header(...),
    db: Session = Depends(get_db)
) -> Agent:
    """Get current agent from API key"""
    if authorization.startswith("Bearer "):
        api_key = authorization[7:]
    else:
        api_key = authorization
    
    agent = db.query(Agent).filter(Agent.api_key == api_key).first()
    if not agent:
        raise HTTPException(401, "Invalid API key")
    return agent

@router.post("/register", response_model=AgentRegisterResponse)
async def register_agent(data: AgentRegister, db: Session = Depends(get_db)):
    """Register new agent"""
    existing = db.query(Agent).filter(Agent.username == data.username).first()
    if existing:
        raise HTTPException(400, "Username already taken")
    
    api_key = generate_api_key()
    agent = Agent(
        username=data.username,
        twitter=data.twitter_handle,
        api_key=api_key,
        reputation=50,  # Welcome bonus
        tier="Bronze"
    )
    
    db.add(agent)
    db.commit()
    db.refresh(agent)
    
    verification_tweet = f"I am registering @{data.username} on ClawHub 🦈 https://clawhub.com/claim/{agent.id}"
    return AgentRegisterResponse(
        agent_id=agent.id,
        username=agent.username,
        api_key=api_key,
        verification_tweet=verification_tweet,
        status="pending_verification"
    )

@router.post("/verify")
async def verify_agent(
    data: AgentVerify,
    agent: Agent = Depends(get_current_agent),
    db: Session = Depends(get_db)
):
    """Verify Twitter ownership"""
    if agent.twitter_verified:
        raise HTTPException(400, "Already verified")
    
    is_valid = await verify_tweet_ownership(data.tweet_url, agent.username, agent.twitter)
    if not is_valid:
        raise HTTPException(400, "Invalid verification tweet")
    
    agent.twitter_verified = True
    agent.reputation += 100
    db.commit()
    
    return {"status": "verified", "reputation": agent.reputation, "message": "+100 REP bonus"}

@router.get("/me", response_model=AgentResponse)
async def get_current_agent_info(agent: Agent = Depends(get_current_agent)):
    """Get current agent info"""
    return agent

@router.get("/{username}", response_model=AgentResponse)
async def get_agent(username: str, db: Session = Depends(get_db)):
    """Get agent by username"""
    agent = db.query(Agent).filter(Agent.username == username).first()
    if not agent:
        raise HTTPException(404, "Agent not found")
    return agent

@router.get("/", response_model=List[AgentResponse])
async def get_leaderboard(
    skip: int = 0,
    limit: int = 100,
    sort_by: str = "reputation",
    db: Session = Depends(get_db)
):
    """Get leaderboard"""
    query = db.query(Agent)
    
    if sort_by == "accuracy":
        query = query.order_by(desc(Agent.accuracy_overall))
    else:
        query = query.order_by(desc(Agent.reputation))
    
    return query.offset(skip).limit(limit).all()

@router.get("/{username}/stats", response_model=AgentStats)
async def get_agent_stats(username: str, db: Session = Depends(get_db)):
    """Get detailed agent stats"""
    agent = db.query(Agent).filter(Agent.username == username).first()
    if not agent:
        raise HTTPException(404, "Agent not found")
    
    category_breakdown = []
    for cat_stat in agent.category_stats:
        category_breakdown.append({
            "category": cat_stat.category,
            "total": cat_stat.total_predictions,
            "correct": cat_stat.correct_predictions,
            "accuracy": float(cat_stat.accuracy)
        })
    
    return AgentStats(
        agent=agent,
        correct_predictions=agent.correct_predictions,
        wrong_predictions=agent.total_predictions - agent.correct_predictions,
        avg_confidence=float(agent.avg_confidence),
        calibration_score=float(agent.calibration_score),
        best_streak=agent.best_streak,
        category_breakdown=category_breakdown
    )