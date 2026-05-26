from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.utils.auth import get_current_user
from app.models.user import User
from seed import seed_demo_data

router = APIRouter(prefix="/api", tags=["seed"])


@router.post("/seed")
async def run_seed(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.email != "demo@meetmind.ai":
        raise HTTPException(status_code=403, detail="Only demo user can seed")

    await seed_demo_data()
    return {"status": "ok", "message": "Demo data seeded"}
