from fastapi import APIRouter
from seed import seed_demo_data

router = APIRouter(prefix="/api", tags=["seed"])


@router.post("/seed")
async def run_seed():
    await seed_demo_data()
    return {"status": "ok", "message": "Demo data seeded"}
