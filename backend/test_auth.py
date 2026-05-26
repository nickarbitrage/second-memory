"""Quick auth test — run with: python test_auth.py"""
import asyncio
from app.database import init_db, async_session
from app.models.user import User
from app.utils.auth import hash_password, verify_password, create_access_token

async def test():
    await init_db()
    async with async_session() as db:
        user = User(
            email="test@example.com",
            name="Test",
            password_hash=hash_password("mypassword"),
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        print(f"User ID: {user.id}")
        print(f"Verify OK: {verify_password('mypassword', user.password_hash)}")
        token = create_access_token(user.id)
        print(f"Token: {token[:50]}...")
        print("ALL TESTS PASSED")

asyncio.run(test())
