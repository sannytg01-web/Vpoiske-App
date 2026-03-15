import uuid
from typing import Any
import structlog
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db, get_redis
from app.models.models import User, InterviewSession, PsychologicalProfile
from app.core.deps import get_current_user
from app.services.ai_agent import ai_agent

logger = structlog.get_logger(__name__)
router = APIRouter(prefix="/interview", tags=["interview"])

class AnswerRequest(BaseModel):
    session_id: str
    message: str

class StartResponse(BaseModel):
    session_id: str
    message: str

@router.post("/start", response_model=StartResponse)
async def start_interview(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    redis: Any = Depends(get_redis)
):
    # Retrieve existing active session or create new
    stmt = select(InterviewSession).where(
        InterviewSession.user_id == user.id,
        InterviewSession.status == "active"
    )
    result = await db.execute(stmt)
    session = result.scalar_one_or_none()
    
    if not session:
        session = InterviewSession(user_id=user.id, status="active", current_question_index=0)
        db.add(session)
        await db.commit()
        await db.refresh(session)

    # Trigger agent's first message
    reply = await ai_agent.get_next_message(
        session_id=str(session.id), 
        user_message=None, 
        question_index=session.current_question_index, 
        redis=redis
    )
    
    return StartResponse(session_id=str(session.id), message=reply["message"])

@router.post("/answer")
async def answer_interview(
    body: AnswerRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    redis: Any = Depends(get_redis)
):
    stmt = select(InterviewSession).where(
        InterviewSession.id == uuid.UUID(body.session_id),
        InterviewSession.user_id == user.id,
        InterviewSession.status == "active"
    )
    result = await db.execute(stmt)
    session = result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(status_code=404, detail="Active session not found")

    reply = await ai_agent.get_next_message(
        session_id=str(session.id), 
        user_message=body.message, 
        question_index=session.current_question_index, 
        redis=redis
    )

    session.current_question_index = reply["question_index"]

    if reply["is_complete"]:
        session.status = "completed"
        # Save profile_json
        profile_data = reply.get("profile_json")
        if profile_data:
            profile = PsychologicalProfile(
                user_id=user.id,
                openness=profile_data.get("openness"),
                conscientiousness=profile_data.get("conscientiousness"),
                extraversion=profile_data.get("extraversion"),
                agreeableness=profile_data.get("agreeableness"),
                neuroticism=profile_data.get("neuroticism"),
                attachment_style=profile_data.get("attachment_style"),
                energy_type=profile_data.get("energy_type"),
                conflict_style=profile_data.get("conflict_style"),
                top_values=profile_data.get("top_values"),
                shadow_patterns=profile_data.get("shadow_patterns"),
                refused_questions=profile_data.get("refused_questions"),
                confidence_score=profile_data.get("confidence_score"),
                profile_notes=profile_data.get("profile_notes")
            )
            db.add(profile)
            # Celery task for embedding matching would trigger here

    await db.commit()

    return {
        "message": reply["message"],
        "is_complete": reply["is_complete"],
        "question_index": session.current_question_index
    }

@router.get("/session/{session_id}")
async def get_session(
    session_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(InterviewSession).where(
        InterviewSession.id == uuid.UUID(session_id),
        InterviewSession.user_id == user.id
    )
    result = await db.execute(stmt)
    session = result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    return {
        "id": session.id,
        "status": session.status,
        "current_question_index": session.current_question_index
    }
