"""Seed demo data. Runs only when the users table is empty (T-002).

All dates are relative to now and stored in UTC, never hardcoded.
Seed user is Demo User / demo@example.com (grill Q7, id=1).
"""

from datetime import datetime, timedelta, timezone

from sqlalchemy import func, select

from app.database import Base, SessionLocal, engine
from app.models import Meeting, Participant, User  # noqa: F401 (register tables)

# Fixed demo meeting codes: 10 digits, first non-zero, unique.
UPCOMING_CODES = ["1000000001", "1000000002", "1000000003"]
ENDED_CODES = ["2000000001", "2000000002", "2000000003", "2000000004"]


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def is_empty() -> bool:
    """True when no users exist yet (fresh boot or ephemeral disk)."""
    with SessionLocal() as db:
        count = db.scalar(select(func.count()).select_from(User))
        return count == 0


def seed_if_empty() -> bool:
    """Create tables + demo rows if the DB is empty. Returns True if seeded."""
    Base.metadata.create_all(bind=engine)
    if not is_empty():
        return False

    now = _utcnow()
    with SessionLocal() as db:
        user = User(name="Demo User", email="demo@example.com", created_at=now)
        db.add(user)
        db.flush()  # assigns user.id for host_id / host participant rows

        # 3 upcoming scheduled meetings: tomorrow, +3 days, +7 days.
        upcoming = [
            ("Team Standup", "Daily sync with the team.", now + timedelta(days=1), 30),
            ("Design Review", "Walk through the new homepage mockups.", now + timedelta(days=3), 60),
            ("Sprint Planning", "Plan next sprint capacity and tickets.", now + timedelta(days=7), 40),
        ]
        for code, (title, desc, start, duration) in zip(UPCOMING_CODES, upcoming):
            db.add(
                Meeting(
                    meeting_code=code,
                    title=title,
                    description=desc,
                    host_id=user.id,
                    type="scheduled",
                    status="scheduled",
                    scheduled_start=start,
                    duration_minutes=duration,
                    started_at=None,
                    ended_at=None,
                    created_at=now,
                )
            )

        # 4 ended meetings from the past week, each with a few participants
        # so Recent is populated on first boot.
        ended = [
            ("Kickoff Call", "Project kickoff and introductions.", 1, 45, ["Alice", "Bob"]),
            ("Demo Review", "Reviewed the prototype with stakeholders.", 2, 30, ["Carol"]),
            ("Retro", "Sprint retrospective notes and action items.", 4, 60, ["Dave", "Erin", "Frank"]),
            ("1:1 Check-in", "Quick weekly check-in.", 6, 20, ["Grace"]),
        ]
        for code, (title, desc, days_ago, duration, guests) in zip(ENDED_CODES, ended):
            start = now - timedelta(days=days_ago)
            end = start + timedelta(minutes=duration)
            meeting = Meeting(
                meeting_code=code,
                title=title,
                description=desc,
                host_id=user.id,
                type="scheduled",
                status="ended",
                scheduled_start=start,
                duration_minutes=duration,
                started_at=start,
                ended_at=end,
                created_at=start,
            )
            db.add(meeting)
            db.flush()  # assigns meeting.id for participant rows
            db.add(
                Participant(
                    meeting_id=meeting.id,
                    user_id=user.id,
                    display_name=user.name,
                    role="host",
                    is_muted=False,
                    is_removed=False,
                    joined_at=start,
                    left_at=end,
                )
            )
            for i, name in enumerate(guests):
                joined = start + timedelta(minutes=i + 1)
                db.add(
                    Participant(
                        meeting_id=meeting.id,
                        user_id=None,
                        display_name=name,
                        role="participant",
                        is_muted=False,
                        is_removed=False,
                        joined_at=joined,
                        left_at=end,
                    )
                )

        db.commit()
        return True
