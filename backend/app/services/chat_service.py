import logging
from uuid import UUID
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from fastapi import HTTPException

from app.models.chat import ChatSession, ChatMessage
from app.models.meeting import Meeting
from app.services.ai_service import AIService

logger = logging.getLogger(__name__)


class ChatService:
    def __init__(self, db: AsyncSession, user_id: UUID):
        self.db = db
        self.user_id = user_id
        self.ai = AIService()

    async def send_message(
        self, meeting_id: UUID, message: str, session_id: Optional[UUID] = None
    ) -> dict:
        meeting = await self.db.execute(
            select(Meeting).where(Meeting.id == meeting_id, Meeting.user_id == self.user_id)
        )
        meeting = meeting.scalar_one_or_none()
        if not meeting:
            raise HTTPException(status_code=404, detail="Meeting not found")

        if session_id:
            result = await self.db.execute(
                select(ChatSession)
                .options(selectinload(ChatSession.messages))
                .where(ChatSession.id == session_id, ChatSession.user_id == self.user_id)
            )
            session = result.scalar_one_or_none()
            if not session:
                raise HTTPException(status_code=404, detail="Chat session not found")
        else:
            session = ChatSession(user_id=self.user_id, meeting_id=meeting_id)
            self.db.add(session)
            await self.db.commit()
            await self.db.refresh(session)

        user_msg = ChatMessage(session_id=session.id, role="user", content=message)
        self.db.add(user_msg)

        meeting_context = f"Title: {meeting.title}\n\nSummary: {meeting.summary}\n\nTranscript:\n{meeting.transcript}\n\nKey Decisions: {meeting.key_decisions}\n\nAction Items: {meeting.action_items}"  # noqa: E501

        messages = [
            {"role": m.role, "content": m.content}
            for m in session.messages[-10:]
        ]

        reply = await self.ai.generate_chat_response(meeting_context, messages, message)

        bot_msg = ChatMessage(session_id=session.id, role="assistant", content=reply)
        self.db.add(bot_msg)
        await self.db.commit()

        return {"session_id": session.id, "reply": reply}

    async def get_session(self, meeting_id: UUID) -> Optional[dict]:
        result = await self.db.execute(
            select(ChatSession)
            .options(selectinload(ChatSession.messages))
            .where(ChatSession.meeting_id == meeting_id, ChatSession.user_id == self.user_id)
            .order_by(desc(ChatSession.created_at))
            .limit(1)
        )
        session = result.scalar_one_or_none()
        if not session:
            return None

        return {
            "id": session.id,
            "meeting_id": session.meeting_id,
            "messages": [
                {"id": m.id, "role": m.role, "content": m.content, "created_at": m.created_at.isoformat()}
                for m in session.messages
            ],
            "created_at": session.created_at.isoformat(),
        }
