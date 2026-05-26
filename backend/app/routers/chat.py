from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.user import User
from app.utils.auth import get_current_user
from app.services.chat_service import ChatService
from app.schemas.chat import ChatRequest, ChatResponse

router = APIRouter(prefix="/api/chat", tags=["Chat"])


@router.post("", response_model=ChatResponse)
async def send_message(
    payload: ChatRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    service = ChatService(db, user.id)
    result = await service.send_message(
        meeting_id=payload.meeting_id,
        message=payload.message,
        session_id=payload.session_id,
    )
    return ChatResponse(session_id=result["session_id"], reply=result["reply"])


@router.get("/session")
async def get_chat_session(
    meeting_id: UUID = Query(...),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    service = ChatService(db, user.id)
    session = await service.get_session(meeting_id)
    if not session:
        return {"session": None}
    return {"session": session}
