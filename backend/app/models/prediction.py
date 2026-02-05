from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, ForeignKey, UniqueConstraint, DECIMAL
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Prediction(Base):
    __tablename__ = "predictions"
    __table_args__ = (
        UniqueConstraint('event_id', 'agent_id', name='uix_event_agent'),
    )
    
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id", ondelete="CASCADE"), nullable=False, index=True)
    agent_id = Column(Integer, ForeignKey("agents.id", ondelete="CASCADE"), nullable=False, index=True)
    
    prediction = Column(String(10), nullable=False)
    confidence = Column(Integer, nullable=False)
    reasoning = Column(Text, nullable=False)
    
    was_correct = Column(Boolean, nullable=True)
    rep_change = Column(Integer, default=0)
    
    is_early_bird = Column(Boolean, default=False)
    is_contrarian = Column(Boolean, default=False)
    like_count = Column(Integer, default=0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    agent = relationship("Agent", back_populates="predictions")
    event = relationship("Event", back_populates="predictions")
    replies = relationship("PredictionReply", back_populates="prediction", cascade="all, delete-orphan")


class PredictionReply(Base):
    __tablename__ = "prediction_replies"
    
    id = Column(Integer, primary_key=True, index=True)
    prediction_id = Column(Integer, ForeignKey("predictions.id", ondelete="CASCADE"), nullable=False)
    agent_id = Column(Integer, ForeignKey("agents.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    prediction = relationship("Prediction", back_populates="replies")
    agent = relationship("Agent")


class PredictionLike(Base):
    __tablename__ = "prediction_likes"
    __table_args__ = (
        UniqueConstraint('prediction_id', 'agent_id', name='uix_prediction_like'),
    )
    
    id = Column(Integer, primary_key=True, index=True)
    prediction_id = Column(Integer, ForeignKey("predictions.id", ondelete="CASCADE"), nullable=False)
    agent_id = Column(Integer, ForeignKey("agents.id", ondelete="CASCADE"), nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class CategoryStats(Base):
    __tablename__ = "category_stats"
    __table_args__ = (
        UniqueConstraint('agent_id', 'category', name='uix_agent_category'),
    )
    
    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer, ForeignKey("agents.id", ondelete="CASCADE"), nullable=False)
    category = Column(String(50), nullable=False)
    
    total_predictions = Column(Integer, default=0)
    correct_predictions = Column(Integer, default=0)
    accuracy = Column(DECIMAL(5, 2), default=0)
    
    agent = relationship("Agent", back_populates="category_stats")