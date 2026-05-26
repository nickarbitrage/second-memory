"""
Seed script — populates database with realistic demo meetings.
Run: python seed.py [email] [name]
"""
import asyncio
import random
from datetime import datetime, timedelta, timezone
from app.database import init_db, async_session
from app.models.user import User
from app.models.meeting import Meeting, Task
from app.utils.auth import hash_password

DEMO_MEETINGS = [
    {
        "title": "Nova Labs — API Planning Kickoff",
        "category": "planning",
        "duration": 2100,
        "days_ago": 28,
        "speakers": ["Alex Chen", "Sarah Kim", "Daniel Ross"],
        "summary": "Nova Labs aligned on the public API v2 surface. Alex Chen proposed versioning and auth middleware order; Sarah Kim flagged OAuth scope creep; Daniel Ross estimated a four-week build for core endpoints. The team agreed to document breaking changes before architecture review.",
        "transcript": """Alex Chen: Welcome to Nova Labs API planning. We need a clear v2 contract before engineering splits work.

Sarah Kim: Auth should be the first discussion — middleware order affects every endpoint.

Daniel Ross: I can staff two engineers on core routes if we freeze the schema by Friday.

Alex Chen: Let's target architecture review next week with a written RFC.

Sarah Kim: I'll draft OAuth scopes and share by Wednesday.

Daniel Ross: I'll prototype rate limiting assumptions for the scaling conversation later.""",
        "key_decisions": ["Freeze API schema by Friday", "RFC before architecture review", "Auth middleware design first"],
        "action_items": ["Sarah: OAuth scope draft", "Daniel: rate limit prototype", "Alex: RFC outline"],
        "insights": ["API auth concerns will likely recur across reviews"],
        "tasks": [
            {"title": "Draft OAuth scope document", "assigned_to": "Sarah Kim"},
            {"title": "Prototype rate limiting", "assigned_to": "Daniel Ross"},
            {"title": "Publish API v2 RFC outline", "assigned_to": "Alex Chen"},
        ],
    },
    {
        "title": "Nova Labs — Architecture Review",
        "category": "review",
        "duration": 2400,
        "days_ago": 21,
        "speakers": ["Alex Chen", "Mia Patel", "Sarah Kim"],
        "summary": "Architecture review for Nova Labs API v2. Mia Patel walked through service boundaries and database sharding options. Sarah Kim reiterated authentication concerns first raised during API planning. Alex Chen connected this review to the upcoming scaling discussion.",
        "transcript": """Mia Patel: Here's the service map for API v2 — read path separated from write path.

Sarah Kim: Authentication middleware must land before we split services — same concern as planning.

Alex Chen: This discussion evolved from last week's API planning — we're carrying auth forward.

Mia Patel: Sharding is premature until we see QPS from beta.

Alex Chen: Agreed. Launch readiness depends on a stable auth layer.""",
        "key_decisions": ["Defer sharding until beta QPS", "Auth layer blocks service split", "Link scaling review to launch"],
        "action_items": ["Mia: update architecture diagram", "Sarah: auth middleware spike"],
        "insights": ["Architecture and auth topics link across Nova Labs meetings"],
        "tasks": [
            {"title": "Update architecture diagram", "assigned_to": "Mia Patel"},
            {"title": "Auth middleware spike", "assigned_to": "Sarah Kim"},
        ],
    },
    {
        "title": "Nova Labs — Scaling Concerns Sync",
        "category": "planning",
        "duration": 1950,
        "days_ago": 14,
        "speakers": ["Daniel Ross", "Emma Carter", "Mia Patel"],
        "summary": "Daniel Ross raised database connection limits under projected launch traffic. Emma Carter proposed caching strategy for hot read endpoints. Mia Patel connected scaling decisions to the architecture review. Team uncertainty remained on exact launch date.",
        "transcript": """Daniel Ross: We're seeing connection pool risk at 3x current beta traffic.

Emma Carter: We could cache read-heavy routes — I'll model hit rates.

Mia Patel: This follows architecture review — we deferred sharding but need a plan B.

Daniel Ross: I'm uncertain we can hit launch without another week on infra.

Emma Carter: Let's flag launch readiness as a follow-up with Alex.""",
        "key_decisions": ["Model read cache before launch", "Escalate launch date risk", "Plan B if sharding delayed"],
        "action_items": ["Emma: cache model", "Daniel: connection pool tuning"],
        "insights": ["Scaling and launch topics are tightly coupled in Nova Labs memory"],
        "tasks": [
            {"title": "Build cache hit-rate model", "assigned_to": "Emma Carter"},
            {"title": "Tune connection pools", "assigned_to": "Daniel Ross"},
        ],
    },
    {
        "title": "Nova Labs — Launch Readiness",
        "category": "review",
        "duration": 1800,
        "days_ago": 7,
        "speakers": ["Alex Chen", "Emma Carter", "Sarah Kim", "Daniel Ross"],
        "summary": "Launch readiness review for Nova Labs API v2. Alex Chen summarized open auth and scaling items. Emma Carter reported cache improvements; Sarah Kim confirmed auth middleware in staging. Daniel Ross still flagged deadline risk — team confidence was mixed.",
        "transcript": """Alex Chen: Launch readiness — what's blocking go-live?

Sarah Kim: Auth middleware is in staging — addresses concerns from planning and architecture.

Emma Carter: Cache layer cut p95 latency by 22% in staging.

Daniel Ross: I'm still concerned about connection limits under marketing spike.

Alex Chen: We need a firm launch date decision by tomorrow.""",
        "key_decisions": ["Auth in staging approved", "Launch date decision tomorrow", "Monitor marketing traffic spike"],
        "action_items": ["Alex: launch go/no-go", "Daniel: load test script"],
        "insights": ["Launch readiness ties back to API and scaling threads"],
        "tasks": [
            {"title": "Run launch load tests", "assigned_to": "Daniel Ross"},
            {"title": "Publish go/no-go memo", "assigned_to": "Alex Chen"},
        ],
    },
    {
        "title": "Nova Labs — Post-Launch Analytics",
        "category": "review",
        "duration": 1650,
        "days_ago": 2,
        "speakers": ["Emma Carter", "Mia Patel", "Alex Chen"],
        "summary": "Post-launch analytics review for Nova Labs. Emma Carter presented API usage dashboards; Mia Patel noted stable architecture under real traffic. Alex Chen linked metrics to pre-launch scaling concerns — authentication error rate dropped after middleware fix.",
        "transcript": """Emma Carter: Week one analytics — API traffic up 40%, error rate down.

Mia Patel: Architecture held — no sharding needed yet.

Alex Chen: Authentication concerns from four weeks ago are resolved in production data.

Emma Carter: Most referenced decision: cache layer before launch — that paid off.

Mia Patel: Memory graph would show this evolved across four meetings — planning to launch.""",
        "key_decisions": ["Keep current architecture", "Document launch retrospective", "Schedule Q2 API roadmap"],
        "action_items": ["Emma: share dashboards", "Alex: retrospective doc"],
        "insights": ["Nova Labs narrative connects planning → architecture → scaling → launch → analytics"],
        "tasks": [
            {"title": "Share launch dashboards", "assigned_to": "Emma Carter"},
            {"title": "Write launch retrospective", "assigned_to": "Alex Chen"},
        ],
    },

    {
        "title": "Nova Labs — Auth Middleware Deep Dive",
        "category": "review",
        "duration": 1740,
        "days_ago": 18,
        "speakers": ["Sarah Kim", "Daniel Ross", "Alex Chen"],
        "summary": "Sarah Kim walked through OAuth scope boundaries and middleware ordering for API v2. Daniel Ross confirmed staging tests for token refresh. Alex Chen noted this deep dive connects API planning concerns to architecture review decisions.",
        "transcript": """Sarah Kim: Middleware order is non-negotiable — auth before routing.

Daniel Ross: Staging shows token refresh stable at 99.2% success.

Alex Chen: This carries forward from API planning — same auth thread.

Sarah Kim: I'll ship the scope document before launch readiness.""",
        "key_decisions": ["Lock middleware order in RFC", "Ship OAuth scope doc before launch review"],
        "action_items": ["Sarah: finalize scope document", "Daniel: token refresh load test"],
        "insights": ["Auth is the thread linking planning, architecture, and launch"],
        "tasks": [
            {"title": "Finalize OAuth scope document", "assigned_to": "Sarah Kim"},
            {"title": "Run token refresh load test", "assigned_to": "Daniel Ross"},
        ],
    },
    {
        "title": "Nova Labs — Weekly Product Sync",
        "category": "standup",
        "duration": 1500,
        "days_ago": 4,
        "speakers": ["Alex Chen", "Emma Carter", "Mia Patel"],
        "summary": "Weekly sync for Nova Labs product team. Emma Carter shared launch metrics preview; Mia Patel confirmed architecture stability. Alex Chen aligned the group on Q2 API roadmap after post-launch analytics.",
        "transcript": """Emma Carter: Traffic holding above launch projections.

Mia Patel: No sharding needed — architecture review decision still holds.

Alex Chen: Let's use post-launch analytics to frame Q2 API investments.

Emma Carter: I'll pair dashboards with the retrospective doc.""",
        "key_decisions": ["Defer sharding through Q1", "Frame Q2 roadmap from launch data"],
        "action_items": ["Emma: attach dashboards to retrospective", "Alex: Q2 roadmap draft"],
        "insights": ["Product sync ties launch metrics to forward planning"],
        "tasks": [
            {"title": "Attach dashboards to retrospective", "assigned_to": "Emma Carter"},
            {"title": "Draft Q2 API roadmap", "assigned_to": "Alex Chen"},
        ],
    },

]


async def _cleanup_legacy_demo_meetings(db, user_id: str) -> int:
    """Remove non–Nova Labs meetings from the demo workspace."""
    from sqlalchemy import select

    result = await db.execute(select(Meeting).where(Meeting.user_id == user_id))
    removed = 0
    for meeting in result.scalars().all():
        title = meeting.title or ""
        if not title.startswith("Nova Labs —"):
            await db.delete(meeting)
            removed += 1
    if removed:
        await db.commit()
        print(f"  Removed {removed} legacy meeting(s) from demo workspace")
    return removed


def _generate_sentiment_and_next_steps(m_data: dict) -> tuple[dict, list[str]]:
    category = m_data.get("category", "general")
    title_lower = m_data.get("title", "").lower()

    if category == "planning":
        sentiment = {
            "overall": "positive" if "launch" in title_lower else "neutral",
            "confidence": random.randint(70, 88),
            "intensity": "high",
            "collaboration": random.randint(72, 90),
        }
        next_steps = [
            "Schedule follow-up to review progress on open items",
            "Share RFC draft with stakeholders before next meeting",
            "Assign owners for each planning action item",
            "Set calendar reminders for key milestone dates",
        ]
    elif category == "review":
        sentiment = {
            "overall": "neutral" if "risk" in title_lower else "positive",
            "confidence": random.randint(65, 85),
            "intensity": "medium" if "deep dive" in title_lower else "low",
            "collaboration": random.randint(68, 85),
        }
        next_steps = [
            "Document review outcomes and distribute to team",
            "Flag any blockers identified during review",
            "Update project timeline based on review feedback",
            "Prepare for next review cycle with updated metrics",
        ]
    elif category == "standup":
        sentiment = {
            "overall": "positive",
            "confidence": random.randint(75, 92),
            "intensity": "low",
            "collaboration": random.randint(70, 85),
        }
        next_steps = [
            "Continue sprint work per agreed priorities",
            "Follow up on cross-team dependencies mentioned in sync",
            "Update task board with latest status changes",
            "Prepare standup notes for absent team members",
        ]
    else:
        sentiment = {
            "overall": "positive",
            "confidence": random.randint(70, 90),
            "intensity": "medium",
            "collaboration": random.randint(70, 88),
        }
        next_steps = [
            "Follow up on key discussion points",
            "Share meeting summary with all participants",
            "Schedule next meeting to track progress",
        ]

    return sentiment, next_steps


async def seed_demo_data():
    print("=" * 50)
    print("  Second Memory — Seeding Demo Data")
    print("=" * 50)

    await init_db()

    async with async_session() as db:
        # Check if user already exists
        from sqlalchemy import select
        result = await db.execute(select(User).where(User.email == "demo@meetmind.ai"))
        user = result.scalar_one_or_none()

        if not user:
            user = User(
                id="00000000-0000-0000-0000-000000000001",
                email="demo@meetmind.ai",
                name="Alex Chen",
                password_hash=hash_password("demo1234"),
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
            print(f"Created demo user: {user.email}")
        else:
            print(f"Demo user already exists: {user.email}")
            if not user.name or user.name == "Demo User":
                user.name = "Alex Chen"
                await db.commit()

        await _cleanup_legacy_demo_meetings(db, user.id)

        # Create meetings
        for m_data in DEMO_MEETINGS:
            existing = await db.execute(
                select(Meeting).where(
                    Meeting.user_id == user.id,
                    Meeting.title == m_data["title"],
                )
            )
            if existing.scalar_one_or_none():
                print(f"  Skipping: {m_data['title']} (exists)")
                continue

            created_at = datetime.now(timezone.utc) - timedelta(days=m_data["days_ago"])
            created_at = created_at.replace(hour=random.randint(9, 16), minute=random.randint(0, 59))

            sentiment, next_steps = _generate_sentiment_and_next_steps(m_data)

            meeting = Meeting(
                user_id=user.id,
                title=m_data["title"],
                summary=m_data["summary"],
                transcript=m_data["transcript"],
                duration=m_data["duration"],
                category=m_data["category"],
                speakers=m_data["speakers"],
                key_decisions=m_data["key_decisions"],
                action_items=m_data["action_items"],
                insights=m_data["insights"],
                sentiment=sentiment,
                next_steps=next_steps,
                is_processed=True,
                created_at=created_at,
            )
            db.add(meeting)
            await db.commit()
            await db.refresh(meeting)

            # Create tasks — varied statuses for a lively demo dashboard
            statuses = ["pending", "in_progress", "pending", "done", "in_progress"]
            for i, t_data in enumerate(m_data["tasks"]):
                status = statuses[i % len(statuses)]
                task = Task(
                    meeting_id=meeting.id,
                    title=t_data["title"],
                    assigned_to=t_data["assigned_to"],
                    status=status,
                )
                if task.status == "done":
                    task.completed_at = created_at + timedelta(hours=random.randint(1, 48))
                db.add(task)

            await db.commit()
            print(f"  Created: {meeting.title}")

    print("=" * 50)
    print(f"  Done! {len(DEMO_MEETINGS)} meetings seeded")
    print("  Login: demo@meetmind.ai / demo1234")
    print("=" * 50)


if __name__ == "__main__":
    asyncio.run(seed_demo_data())
