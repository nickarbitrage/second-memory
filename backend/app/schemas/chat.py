from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional


class ChatRequest(BaseModel):
    meeting_id: UUID
    message: str
    session_id: Optional[UUID] = None


class ChatResponse(BaseModel):
    session_id: UUID
    reply: str


class ChatMessageResponse(BaseModel):
    id: UUID
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class ChatSessionResponse(BaseModel):
    id: UUID
    meeting_id: UUID
    messages: list[ChatMessageResponse] = []
    created_at: datetime

    class Config:
        from_attributes = True
