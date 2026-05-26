from pydantic import BaseModel
from typing import Any


class AnalyticsResponse(BaseModel):
    total_meetings: int
    total_tasks: int
    completed_tasks: int
    total_duration_minutes: float
    top_speakers: list[dict]
    category_distribution: list[dict]
    weekly_activity: list[dict]
    recent_tasks: list[Any]
