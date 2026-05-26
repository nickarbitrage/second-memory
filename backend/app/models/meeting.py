import uuid
import enum
from datetime import datetime
from sqlalchemy import String, Text, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import func
from app.database import Base
from app.utils.guid import GUID


class MeetingCategory(str, enum.Enum):
    GENERAL = "general"
    STANDUP = "standup"
    PLANNING = "planning"
    BRAINSTORM = "brainstorm"
    REVIEW = "review"
    ONE_ON_ONE = "one_on_one"
    CLIENT = "client"
    OTHER = "other"


class TaskStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    DONE = "done"


class Meeting(Base):
    __tablename__ = "meetings"

    id: Mapped[str] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[str] = mapped_column(
        GUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(500), nullable=True)
    summary: Mapped[str] = mapped_column(Text, nullable=True)
    transcript: Mapped[str] = mapped_column(Text, nullable=True)
    audio_url: Mapped[str] = mapped_column(String(1000), nullable=True)
    duration: Mapped[int] = mapped_column(Integer, default=0)
    category: Mapped[str] = mapped_column(String(50), default="general")
    speakers: Mapped[dict] = mapped_column(JSON, default=list)
    key_decisions: Mapped[dict] = mapped_column(JSON, default=list)
    action_items: Mapped[dict] = mapped_column(JSON, default=list)
    insights: Mapped[dict] = mapped_column(JSON, default=list)
    sentiment: Mapped[dict] = mapped_column(JSON, default=dict)
    next_steps: Mapped[dict] = mapped_column(JSON, default=list)
    is_processed: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    user = relationship("User", back_populates="meetings")
    tasks = relationship("Task", back_populates="meeting", cascade="all, delete-orphan")
    chat_sessions = relationship("ChatSession", back_populates="meeting", cascade="all, delete-orphan")


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[str] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    meeting_id: Mapped[str] = mapped_column(
        GUID, ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    assigned_to: Mapped[str] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="pending")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    completed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)

    meeting = relationship("Meeting", back_populates="tasks")
