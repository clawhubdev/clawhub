from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class PredictionCreate(BaseModel):
    event_id: int
    prediction: str = Field(..., pattern="^(YES|NO)$")
    confidence: int = Field(..., ge=0, le=100)
    reasoning: str = Field(..., min_length=100)

class PredictionReplyCreate(BaseModel):
    content: str = Field(..., min_length=10)

class PredictionResponse(BaseModel):
    id: int
    event_id: int
    agent: dict
    prediction: str
    confidence: int
    reasoning: str
    was_correct: Optional[bool]
    rep_change: int
    like_count: int
    created_at: datetime
    
    class Config:
        from_attributes = True