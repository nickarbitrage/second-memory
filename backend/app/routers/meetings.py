from uuid import UUID
from fastapi import APIRouter, Depends, UploadFile, File, BackgroundTasks, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.user import User
from app.utils.auth import get_current_user
from app.services.meeting_service import MeetingService
from app.services.search_service import SearchService
from app.schemas.meeting import (
    MeetingResponse, MeetingListResponse, TaskResponse, TaskUpdate,
)
from app.models.meeting import TaskStatus

router = APIRouter(prefix="/api/meetings", tags=["Meetings"])


@router.post("/upload", response_model=MeetingResponse)
async def upload_meeting(
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    service = MeetingService(db, user.id)
    return await service.upload_meeting(file, background_tasks)


@router.get("", response_model=list[MeetingListResponse])
async def list_meetings(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    service = MeetingService(db, user.id)
    return await service.get_meetings(limit, offset)


@router.get("/search", response_model=list[MeetingListResponse])
async def search_meetings(
    q: str = Query(..., min_length=1),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    service = MeetingService(db, user.id)
    return await service.search_meetings(q)


@router.get("/ai-search/results")
async def ai_search_meetings(
    q: str = Query(..., min_length=1, description="Natural language search query"),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    AI-powered semantic search across meetings using natural language understanding.
    
    Returns:
    - query: original search query
    - summary: AI-generated summary of findings
    - results: list of relevant meetings with relevance scores and context snippets
    """
    service = SearchService(db, user.id)
    return await service.search_meetings(q)


@router.get("/ai-analyst")
async def ai_analyst_query(
    q: str = Query(..., min_length=1),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    service = SearchService(db, user.id)
    return await service.analyst_query(q)


@router.get("/{meeting_id}/related", response_model=list[MeetingListResponse])
async def get_related_meetings(
    meeting_id: UUID,
    limit: int = Query(5, ge=1, le=10),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    service = MeetingService(db, user.id)
    return await service.get_related_meetings(meeting_id, limit)


@router.get("/tasks", response_model=list[TaskResponse])
async def list_tasks(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    service = MeetingService(db, user.id)
    return await service.get_tasks()


@router.patch("/tasks/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: UUID,
    payload: TaskUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    service = MeetingService(db, user.id)
    return await service.update_task_status(task_id, payload.status)


@router.get("/{meeting_id}", response_model=MeetingResponse)
async def get_meeting(
    meeting_id: UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    service = MeetingService(db, user.id)
    return await service.get_meeting(meeting_id)


@router.delete("/{meeting_id}", status_code=204)
async def delete_meeting(
    meeting_id: UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    service = MeetingService(db, user.id)
    await service.delete_meeting(meeting_id)
