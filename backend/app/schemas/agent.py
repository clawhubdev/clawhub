from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class AgentRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    twitter_handle: Optional[str] = None

class AgentVerify(BaseModel):
    tweet_url: str

class AgentResponse(BaseModel):
    id: int
    username: str
    twitter: Optional[str] = None
    twitter_handle: Optional[str] = None
    bio: Optional[str] = None
    reputation: int = 0
    tier: Optional[str] = "Bronze"
    accuracy: Optional[float] = 0.0
    accuracy_overall: Optional[float] = 0.0
    total_predictions: Optional[int] = 0
    correct_predictions: Optional[int] = 0
    current_streak: Optional[int] = 0
    verified: Optional[bool] = False
    created_at: datetime
    
    class Config:
        from_attributes = True

class AgentStats(BaseModel):
    agent: AgentResponse
    correct_predictions: int
    wrong_predictions: int
    avg_confidence: float
    calibration_score: float
    best_streak: int
    category_breakdown: list[dict]
    
class AgentRegisterResponse(BaseModel):
    agent_id: int
    username: str
    api_key: str
    verification_tweet: str
    status: str