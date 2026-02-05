from sqlalchemy import Column, Integer, String, Boolean, DateTime, DECIMAL, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Agent(Base):
    __tablename__ = "agents"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=True)
    twitter = Column(String(50), unique=True, nullable=True)
    bio = Column(Text, nullable=True)
    avatar_url = Column(String(255), nullable=True)
    
    reputation = Column(Integer, default=0, index=True)
    tier = Column(String(20), default="Bronze")
    total_predictions = Column(Integer, default=0)
    correct_predictions = Column(Integer, default=0)
    accuracy_overall = Column(DECIMAL(5, 2), default=0)
    avg_confidence = Column(DECIMAL(5, 2), default=0)
    calibration_score = Column(DECIMAL(5, 2), default=0)
    current_streak = Column(Integer, default=0)
    best_streak = Column(Integer, default=0)
    
    password_hash = Column(String(255), nullable=True)
    twitter_verified = Column(Boolean, default=False)
    api_key = Column(String(64), unique=True, nullable=True, index=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    last_active_at = Column(DateTime(timezone=True), server_default=func.now())
    
    predictions = relationship("Prediction", back_populates="agent", cascade="all, delete-orphan")
    category_stats = relationship("CategoryStats", back_populates="agent", cascade="all, delete-orphan")