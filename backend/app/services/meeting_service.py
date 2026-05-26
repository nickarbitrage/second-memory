import os
import logging
from uuid import UUID
from typing import Optional
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func, or_
from sqlalchemy.orm import selectinload
from fastapi import UploadFile, HTTPException, BackgroundTasks

from app.database import async_session
from app.models.meeting import Meeting, Task, MeetingCategory, TaskStatus
from app.schemas.meeting import MeetingResponse, MeetingListResponse, TaskResponse
from app.utils.file_handler import validate_audio_file, save_upload
from app.services.ai_service import AIService
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class MeetingService:
    def __init__(self, db: AsyncSession, user_id: UUID):
        self.db = db
        self.user_id = user_id
        self.ai = AIService()

    async def upload_meeting(
        self, file: UploadFile, background_tasks: BackgroundTasks
    ) -> MeetingResponse:
        try:
            validate_audio_file(file)
        except Exception as e:
            logger.error(f"Upload validate failed: {e}")
            raise

        try:
            file_path = await save_upload(file, settings.upload_dir)
        except Exception as e:
            logger.error(f"Upload save failed: {e}")
            raise

        meeting = Meeting(
            user_id=self.user_id,
            audio_url=file_path,
            title=f"Meeting from {datetime.now(timezone.utc).strftime('%b %d, %Y')}",
        )
        try:
            self.db.add(meeting)
            await self.db.commit()
            await self.db.refresh(meeting)
        except Exception as e:
            logger.error(f"Upload db failed: {e}")
            raise

        meeting_id = meeting.id
        background_tasks.add_task(self.process_meeting, meeting_id)

        from sqlalchemy.orm import selectinload
        from sqlalchemy import select
        result = await self.db.execute(
            select(Meeting)
            .options(selectinload(Meeting.tasks))
            .where(Meeting.id == meeting_id)
        )
        loaded = result.scalar_one()
        return MeetingResponse.model_validate(loaded)

    async def process_meeting(self, meeting_id: UUID) -> None:
        async with async_session() as db:
            meeting = None
            try:
                result = await db.execute(
                    select(Meeting).where(Meeting.id == meeting_id)
                )
                meeting = result.scalar_one_or_none()
                if not meeting or not meeting.audio_url:
                    return

                logger.info(f"Processing meeting {meeting_id}")

                ai = AIService()
                transcript = await ai.transcribe_audio(meeting.audio_url)
                analysis = await ai.analyze_transcript(transcript)

                meeting.transcript = transcript
                meeting.summary = analysis.get("summary", "")
                meeting.title = analysis.get("title", meeting.title)
                meeting.category = analysis.get("category", MeetingCategory.GENERAL.value)
                meeting.speakers = analysis.get("speakers", [])
                meeting.key_decisions = analysis.get("key_decisions", [])
                meeting.action_items = analysis.get("action_items", [])
                meeting.insights = analysis.get("insights", [])
                meeting.sentiment = analysis.get("sentiment", {})
                meeting.next_steps = analysis.get("next_steps", [])
                meeting.is_processed = True

                tasks_data = analysis.get("tasks", [])
                for task_data in tasks_data:
                    task = Task(
                        meeting_id=meeting.id,
                        title=task_data.get("title", "Untitled task"),
                        assigned_to=task_data.get("assigned_to", ""),
                    )
                    db.add(task)

                await db.commit()
                logger.info(f"Meeting {meeting_id} processed successfully")
            except Exception as e:
                logger.error(f"Failed to process meeting {meeting_id}: {e}")
                await db.rollback()
                if meeting:
                    try:
                        async with async_session() as retry_db:
                            m = await retry_db.get(Meeting, meeting_id)
                            if m and not m.is_processed:
                                m.is_processed = True
                                await retry_db.commit()
                                logger.info(f"Meeting {meeting_id} marked as processed (fallback)")
                    except Exception as e2:
                        logger.error(f"Failed to mark meeting {meeting_id} as processed: {e2}")

            if meeting and meeting.audio_url and os.path.exists(meeting.audio_url):
                try:
                    os.remove(meeting.audio_url)
                except Exception:
                    pass

    async def get_meetings(
        self, limit: int = 20, offset: int = 0
    ) -> list[MeetingListResponse]:
        result = await self.db.execute(
            select(Meeting)
            .where(Meeting.user_id == self.user_id)
            .order_by(desc(Meeting.created_at))
            .offset(offset)
            .limit(limit)
        )
        meetings = result.scalars().all()
        return [MeetingListResponse.model_validate(m) for m in meetings]

    async def get_meeting(self, meeting_id: UUID) -> Optional[MeetingResponse]:
        result = await self.db.execute(
            select(Meeting)
            .options(selectinload(Meeting.tasks))
            .where(Meeting.id == meeting_id, Meeting.user_id == self.user_id)
        )
        meeting = result.scalar_one_or_none()
        if not meeting:
            raise HTTPException(status_code=404, detail="Meeting not found")
        return MeetingResponse.model_validate(meeting)

    async def delete_meeting(self, meeting_id: UUID) -> None:
        result = await self.db.execute(
            select(Meeting).where(Meeting.id == meeting_id, Meeting.user_id == self.user_id)
        )
        meeting = result.scalar_one_or_none()
        if not meeting:
            raise HTTPException(status_code=404, detail="Meeting not found")

        if meeting.audio_url and os.path.exists(meeting.audio_url):
            os.remove(meeting.audio_url)

        await self.db.delete(meeting)
        await self.db.commit()

    async def search_meetings(self, query: str) -> list[MeetingListResponse]:
        search_filter = or_(
            Meeting.title.ilike(f"%{query}%"),
            Meeting.transcript.ilike(f"%{query}%"),
            Meeting.summary.ilike(f"%{query}%"),
        )
        result = await self.db.execute(
            select(Meeting)
            .where(Meeting.user_id == self.user_id, search_filter)
            .order_by(desc(Meeting.created_at))
            .limit(20)
        )
        meetings = result.scalars().all()
        return [MeetingListResponse.model_validate(m) for m in meetings]

    async def update_task_status(self, task_id: UUID, status: TaskStatus) -> TaskResponse:
        result = await self.db.execute(
            select(Task)
            .join(Meeting)
            .where(Task.id == task_id, Meeting.user_id == self.user_id)
        )
        task = result.scalar_one_or_none()
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        task.status = status.value
        if status == TaskStatus.DONE:
            task.completed_at = datetime.now(timezone.utc)
        await self.db.commit()
        await self.db.refresh(task)
        return TaskResponse.model_validate(task)

    async def get_related_meetings(
        self, meeting_id: UUID, limit: int = 5
    ) -> list[MeetingListResponse]:
        result = await self.db.execute(
            select(Meeting).where(
                Meeting.id == meeting_id, Meeting.user_id == self.user_id
            )
        )
        source = result.scalar_one_or_none()
        if not source:
            raise HTTPException(status_code=404, detail="Meeting not found")

        all_result = await self.db.execute(
            select(Meeting)
            .where(Meeting.user_id == self.user_id, Meeting.id != meeting_id)
            .order_by(desc(Meeting.created_at))
            .limit(50)
        )
        others = all_result.scalars().all()

        source_words = set(
            (source.title or "").lower().split()
            + (source.summary or "").lower().split()[:30]
        )
        source_speakers = set(source.speakers or [])

        scored: list[tuple[float, Meeting]] = []
        for m in others:
            score = 0.0
            if m.category == source.category:
                score += 0.35
            overlap = source_speakers & set(m.speakers or [])
            score += min(len(overlap) * 0.15, 0.3)
            title_words = set((m.title or "").lower().split())
            word_overlap = len(source_words & title_words)
            score += min(word_overlap * 0.05, 0.25)
            if source.summary and m.summary:
                for term in ["api", "onboarding", "sprint", "q1", "q2", "roadmap", "deadline"]:
                    if term in source.summary.lower() and term in m.summary.lower():
                        score += 0.2
                        break
            if score > 0.2:
                scored.append((score, m))

        scored.sort(key=lambda x: x[0], reverse=True)
        return [MeetingListResponse.model_validate(m) for _, m in scored[:limit]]

    async def get_tasks(self) -> list[TaskResponse]:
        result = await self.db.execute(
            select(Task)
            .join(Meeting)
            .where(Meeting.user_id == self.user_id)
            .order_by(desc(Task.created_at))
        )
        tasks = result.scalars().all()
        return [TaskResponse.model_validate(t) for t in tasks]
