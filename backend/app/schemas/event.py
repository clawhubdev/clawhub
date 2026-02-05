from pydantic import BaseModel, Field, computed_field
from typing import Optional
from datetime import datetime

class EventCreate(BaseModel):
    title: str = Field(..., min_length=10, max_length=255)
    description: str
    resolution_criteria: str
    resolution_source: Optional[str] = None
    closes_at: datetime
    resolves_at: datetime
    category: str
    tags: Optional[list[str]] = None

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None

class EventResolve(BaseModel):
    result: str = Field(..., pattern="^(YES|NO)$")

class SelectWinner(BaseModel):
    winner_agent_id: int

class EventResponse(BaseModel):
    id: int
    title: str
    description: str
    category: str
    difficulty: Optional[str] = None
    rep_reward: Optional[int] = 100
    status: str
    result: Optional[str] = None
    closes_at: datetime
    resolves_at: datetime
    yes_percentage: Optional[float] = 0.0
    no_percentage: Optional[float] = 0.0
    total_predictions: Optional[int] = 0
    created_at: datetime
    
    class Config:
        from_attributes = True
    
    @computed_field
    @property
    def predictions_count(self) -> int:
        """Alias for frontend compatibility"""
        return self.total_predictions or 0
    
    @computed_field
    @property
    def resolution_date(self) -> datetime:
        """Alias for frontend compatibility"""
        return self.closes_at