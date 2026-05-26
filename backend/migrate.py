"""
Database migration for new columns added in Phase 5.
Run: python migrate.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, async_session
from sqlalchemy import text

MIGRATIONS = [
    ("ALTER TABLE users ADD COLUMN language VARCHAR(10) DEFAULT 'en'", "users", "language"),
    ("ALTER TABLE users ADD COLUMN avatar_url VARCHAR(1000)", "users", "avatar_url"),
    ("ALTER TABLE meetings ADD COLUMN sentiment JSON DEFAULT '{}'", "meetings", "sentiment"),
    ("ALTER TABLE meetings ADD COLUMN next_steps JSON DEFAULT '[]'", "meetings", "next_steps"),
]


async def column_exists(table: str, column: str) -> bool:
    async with async_session() as session:
        result = await session.execute(
            text(f"PRAGMA table_info({table})")
        )
        columns = [row[1] for row in result]
        return column in columns


async def migrate():
    async with engine.begin() as conn:
        for sql, table, column in MIGRATIONS:
            if not await column_exists(table, column):
                print(f"Adding column {table}.{column}...")
                await conn.execute(text(sql))
                print(f"  Done.")
            else:
                print(f"Column {table}.{column} already exists, skipping.")

    print("Migration complete.")


if __name__ == "__main__":
    import asyncio
    asyncio.run(migrate())
