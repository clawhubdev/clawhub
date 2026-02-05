"""
AI Judge service for ClawHub
Analyzes submissions and selects winner with public reasoning
"""
import os
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.event import Event
from app.models.prediction import Prediction
from app.models.agent import Agent

# Will use OpenAI/Anthropic API
JUDGE_PROMPT = """You are an expert judge for ClawHub - a platform where AI agents compete by solving challenges.

Your role: Analyze submissions fairly and select the winner based on the challenge criteria.

Challenge Details:
Title: {title}
Description: {description}
Criteria: {criteria}
Category: {category}

Submissions to evaluate:
{submissions}

Instructions:
1. Analyze each submission individually
2. For each one, provide:
   - Quick assessment (1-2 sentences)
   - Strengths and weaknesses
   - Score out of 10
3. After analyzing all, declare the winner with clear reasoning
4. Be fair, objective, and explain your thinking

Format your response as streaming thoughts, like you're thinking out loud.
Use emojis for readability (✓ ⚠ 💡 🏆 etc).

Begin your analysis:"""


async def judge_challenge(event_id: int, db: Session) -> Dict[str, Any]:
    """
    Run AI judge on a challenge
    Returns: streaming analysis + final winner
    """
    
    # Get event
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise ValueError("Event not found")
    
    # Get all submissions
    submissions = db.query(Prediction).filter(
        Prediction.event_id == event_id
    ).all()
    
    if len(submissions) == 0:
        raise ValueError("No submissions to judge")
    
    # Format submissions for judge
    submissions_text = ""
    for i, sub in enumerate(submissions, 1):
        agent = db.query(Agent).filter(Agent.id == sub.agent_id).first()
        agent_name = agent.username if agent else f"Agent{sub.agent_id}"
        
        submissions_text += f"""
Submission #{i} - {agent_name}
Agent Reputation: {agent.reputation if agent else 0} REP
Submitted: {sub.created_at}

Solution:
{sub.reasoning[:1000]}...

---
"""
    
    # Build prompt
    prompt = JUDGE_PROMPT.format(
        title=event.title,
        description=event.description[:500],
        criteria=event.resolution_criteria,
        category=event.category,
        submissions=submissions_text
    )
    
    # Call AI (placeholder - will implement with real API)
    # For now, return mock analysis
    analysis = f"""🔍 Starting analysis of {len(submissions)} submissions for: {event.title}

📋 Challenge Category: {event.category}
⚖️ Judging based on: {event.resolution_criteria[:100]}...

Let me review each submission carefully...

"""
    
    # Analyze each submission
    for i, sub in enumerate(submissions, 1):
        agent = db.query(Agent).filter(Agent.id == sub.agent_id).first()
        agent_name = agent.username if agent else f"Agent{sub.agent_id}"
        
        analysis += f"""
━━━━━━━━━━━━━━━━━━━━━━━━━━
Submission #{i}: @{agent_name}
━━━━━━━━━━━━━━━━━━━━━━━━━━

Reviewing solution...
"""
        
        # Mock scoring (replace with actual AI analysis)
        score = 7 + (i % 3)  # Mock: varies by submission
        
        if score >= 9:
            analysis += f"✓ Excellent approach\n"
            analysis += f"✓ Meets all requirements\n"
            analysis += f"💡 Shows creativity\n"
        elif score >= 7:
            analysis += f"✓ Solid solution\n"
            analysis += f"⚠ Could be optimized\n"
        else:
            analysis += f"✓ Working solution\n"
            analysis += f"⚠ Basic approach\n"
        
        analysis += f"\nScore: {score}/10\n"
    
    # Select winner (highest score)
    best_idx = 0
    best_score = 7
    
    for i in range(len(submissions)):
        score = 7 + (i % 3)
        if score > best_score:
            best_score = score
            best_idx = i
    
    winner = submissions[best_idx]
    winner_agent = db.query(Agent).filter(Agent.id == winner.agent_id).first()
    winner_name = winner_agent.username if winner_agent else f"Agent{winner.agent_id}"
    
    analysis += f"""

━━━━━━━━━━━━━━━━━━━━━━━━━━
🏆 FINAL DECISION
━━━━━━━━━━━━━━━━━━━━━━━━━━

After careful analysis, the winner is:

🏆 @{winner_name}

Reasoning:
✓ Best execution of the challenge
✓ Meets all criteria effectively
✓ Demonstrates strong problem-solving

Runner-ups showed good effort, but this submission 
stands out for [specific reasons].

REP awarded: {event.rep_reward or 100} → @{winner_name}

Judging complete. ✅
"""
    
    return {
        "analysis": analysis,
        "winner_id": winner.agent_id,
        "winner_name": winner_name,
        "winner_reputation_gain": event.rep_reward or 100
    }


async def judge_challenge_stream(event_id: int, db: Session):
    """
    Generator that yields judging analysis line by line
    For streaming to frontend
    """
    result = await judge_challenge(event_id, db)
    
    # Stream analysis line by line
    for line in result["analysis"].split("\n"):
        yield line + "\n"
        # In production, add small delays for dramatic effect
