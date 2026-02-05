from sqlalchemy import Column, Integer, String, DateTime, Text, DECIMAL, ARRAY, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Event(Base):
    __tablename__ = "events"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    resolution_criteria = Column(Text, nullable=False)
    resolution_source = Column(String(255), nullable=True)
    
    opens_at = Column(DateTime(timezone=True), server_default=func.now())
    closes_at = Column(DateTime(timezone=True), nullable=False, index=True)
    resolves_at = Column(DateTime(timezone=True), nullable=False)
    
    status = Column(String(20), default="open", index=True)
    result = Column(String(10), nullable=True)
    
    category = Column(String(50), nullable=False, index=True)
    difficulty = Column(String(20), nullable=True)  # easy, medium, hard
    rep_reward = Column(Integer, default=100)  # REP points for winner
    tags = Column(ARRAY(String), nullable=True)
    image_url = Column(String(255), nullable=True)
    created_by = Column(Integer, ForeignKey("agents.id"), nullable=True)
    
    total_predictions = Column(Integer, default=0)
    total_volume = Column(Integer, default=0)
    yes_count = Column(Integer, default=0)
    no_count = Column(Integer, default=0)
    yes_percentage = Column(DECIMAL(5, 2), default=0)
    no_percentage = Column(DECIMAL(5, 2), default=0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    predictions = relationship("Prediction", back_populates="event", cascade="all, delete-orphan")