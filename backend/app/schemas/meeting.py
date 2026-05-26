from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional, Any
from app.models.meeting import MeetingCategory, TaskStatus


class MeetingCreate(BaseModel):
    title: Optional[str] = None
    duration: int = 0


class MeetingResponse(BaseModel):
    id: UUID
    user_id: UUID
    title: Optional[str]
    summary: Optional[str]
    transcript: Optional[str]
    audio_url: Optional[str]
    duration: int
    category: str
    speakers: list[Any]
    key_decisions: list[Any]
    action_items: list[Any]
    insights: list[Any]
    sentiment: dict[str, Any] = {}
    next_steps: list[Any] = []
    is_processed: bool
    created_at: datetime
    updated_at: datetime
    tasks: list["TaskResponse"] = []

    class Config:
        from_attributes = True


class MeetingListResponse(BaseModel):
    id: UUID
    title: Optional[str]
    duration: int
    category: str
    is_processed: bool
    sentiment: dict[str, Any] = {}
    created_at: datetime
    speakers: list[Any]
    summary: Optional[str]

    class Config:
        from_attributes = True


class TaskCreate(BaseModel):
    title: str
    assigned_to: Optional[str] = None


class TaskUpdate(BaseModel):
    status: TaskStatus


class TaskResponse(BaseModel):
    id: UUID
    meeting_id: UUID
    title: str
    assigned_to: Optional[str]
    status: str
    created_at: datetime
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True
