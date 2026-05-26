from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.user import User
from app.models.meeting import Meeting
from app.utils.auth import get_current_user
from app.services.report_service import generate_meeting_report

router = APIRouter(prefix="/api/reports", tags=["Reports"])


@router.get("/{meeting_id}")
async def export_meeting_pdf(
    meeting_id: UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Meeting).where(Meeting.id == meeting_id, Meeting.user_id == user.id)
    )
    meeting = result.scalar_one_or_none()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    filepath = await generate_meeting_report(
        meeting_id=meeting.id,
        title=meeting.title or "Untitled",
        summary=meeting.summary or "",
        transcript=meeting.transcript or "",
        speakers=meeting.speakers or [],
        key_decisions=meeting.key_decisions or [],
        action_items=meeting.action_items or [],
        insights=meeting.insights or [],
        duration=meeting.duration,
        created_at=meeting.created_at,
    )

    return FileResponse(
        filepath,
        media_type="application/pdf",
        filename=f"meeting_{meeting_id}.pdf",
    )
