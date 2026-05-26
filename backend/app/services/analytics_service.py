import logging
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timedelta, timezone

from app.models.meeting import Meeting, Task, TaskStatus
from app.schemas.analytics import AnalyticsResponse

logger = logging.getLogger(__name__)


class AnalyticsService:
    def __init__(self, db: AsyncSession, user_id: UUID):
        self.db = db
        self.user_id = user_id

    async def get_analytics(self) -> AnalyticsResponse:
        meetings_result = await self.db.execute(
            select(Meeting).where(Meeting.user_id == self.user_id)
        )
        meetings = meetings_result.scalars().all()
        total_meetings = len(meetings)

        tasks_result = await self.db.execute(
            select(Task)
            .join(Meeting)
            .where(Meeting.user_id == self.user_id)
        )
        tasks = tasks_result.scalars().all()
        total_tasks = len(tasks)
        completed_tasks = sum(1 for t in tasks if t.status == TaskStatus.DONE.value)

        total_duration = sum(m.duration for m in meetings) / 60.0

        speaker_count = {}
        for m in meetings:
            for speaker in (m.speakers or []):
                speaker_count[speaker] = speaker_count.get(speaker, 0) + 1
        top_speakers = [
            {"name": k, "count": v}
            for k, v in sorted(speaker_count.items(), key=lambda x: x[1], reverse=True)[:5]
        ]

        category_count = {}
        for m in meetings:
            cat = m.category or "general"
            category_count[cat] = category_count.get(cat, 0) + 1
        category_distribution = [
            {"category": k, "count": v}
            for k, v in sorted(category_count.items(), key=lambda x: x[1], reverse=True)
        ]

        now = datetime.now(timezone.utc)
        weekly_data = []
        for i in range(7):
            day = now - timedelta(days=i)
            day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = day_start + timedelta(days=1)
            day_count = sum(
                1 for m in meetings
                if day_start <= m.created_at.replace(tzinfo=timezone.utc) < day_end
            )
            weekly_data.append({"date": day_start.strftime("%Y-%m-%d"), "count": day_count})
        weekly_data.reverse()

        recent_tasks = [
            {"title": t.title, "status": t.status, "meeting_id": str(t.meeting_id)}
            for t in sorted(tasks, key=lambda x: x.created_at, reverse=True)[:5]
        ]

        return AnalyticsResponse(
            total_meetings=total_meetings,
            total_tasks=total_tasks,
            completed_tasks=completed_tasks,
            total_duration_minutes=round(total_duration, 1),
            top_speakers=top_speakers,
            category_distribution=category_distribution,
            weekly_activity=weekly_data,
            recent_tasks=recent_tasks,
        )
