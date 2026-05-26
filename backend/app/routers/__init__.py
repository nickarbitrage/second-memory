from app.routers.auth import router as auth_router
from app.routers.meetings import router as meetings_router
from app.routers.chat import router as chat_router
from app.routers.analytics import router as analytics_router

__all__ = ["auth_router", "meetings_router", "chat_router", "analytics_router"]
