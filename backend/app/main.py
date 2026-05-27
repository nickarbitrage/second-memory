import logging
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import get_settings
from app.database import init_db
from app.routers import auth_router, meetings_router, chat_router, analytics_router
from app.routers.reports import router as reports_router
from app.routers.settings import router as settings_router
from app.routers.seed import router as seed_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Second Memory backend...")
    await init_db()
    await _cleanup_stale_meetings()
    logger.info("Database initialized")
    yield
    logger.info("Shutting down...")


async def _cleanup_stale_meetings():
    from app.database import async_session
    from app.models.meeting import Meeting
    from sqlalchemy import select, or_
    try:
        async with async_session() as db:
            result = await db.execute(
                select(Meeting).where(
                    Meeting.is_processed == False,
                    Meeting.transcript.is_(None),
                ).limit(10)
            )
            stale = result.scalars().all()
            for m in stale:
                m.is_processed = True
                logger.info(f"Cleaned up stale meeting {m.id}")
            await db.commit()
            if stale:
                logger.info(f"Cleaned {len(stale)} stale unprocessed meetings")
    except Exception as e:
        logger.warning(f"Cleanup skipped: {e}")


app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://meetmind.vercel.app",
        "https://second-memory-app.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(meetings_router)
app.include_router(chat_router)
app.include_router(analytics_router)
app.include_router(reports_router)
app.include_router(settings_router)
app.include_router(seed_router)

upload_dir = Path(settings.upload_dir)
upload_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(upload_dir)), name="uploads")


@app.get("/api/health")
async def health():
    return {"status": "ok", "app": settings.app_name}
