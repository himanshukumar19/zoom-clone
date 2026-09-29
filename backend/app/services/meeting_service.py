"""Meeting rules: the Default User's instant Meetings today (T-003).

Lifecycle lives here, not in the routers: instant starts `live`, the first
join to a scheduled Meeting flips it `live` (T-005), the last participant to
leave flips it `ended` (T-006).
"""

from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models import Meeting, Participant, User
from app.schemas.meeting import (
    MeetingOut,
    MeetingWithParticipantOut,
    ParticipantOut,
)
from app.utils.meeting_code import generate_meeting_code

# The seeded Default User stands in for a logged-in account: there is no auth.
DEFAULT_USER_ID = 1


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def get_default_user(db: Session) -> User:
    """The seeded Default User (id=1). Raises 404 if the DB was never seeded."""
    user = db.get(User, DEFAULT_USER_ID)
    if user is None:
        raise HTTPException(
            status_code=404, detail="Default user not found. Is the database seeded?"
        )
    return user


def create_instant_meeting(db: Session) -> MeetingWithParticipantOut:
    """Create a live instant Meeting for the Default User and seat them as Host.

    Instant Meetings have no scheduled start or duration -- they are live the
    moment they exist, and the only participant is the Host (plan section 7).
    """
    host = get_default_user(db)
    now = _utcnow()

    meeting = Meeting(
        meeting_code=generate_meeting_code(db),
        title=f"{host.name}'s Meeting",
        description=None,
        host_id=host.id,
        type="instant",
        status="live",
        scheduled_start=None,
        duration_minutes=None,
        started_at=now,
        ended_at=None,
        created_at=now,
    )
    db.add(meeting)
    db.flush()  # assigns meeting.id for the participant row

    participant = Participant(
        meeting_id=meeting.id,
        user_id=host.id,  # host rows link the user; guests leave this NULL
        display_name=host.name,
        role="host",
        is_muted=False,
        is_removed=False,
        joined_at=now,
        left_at=None,  # NULL means still in the meeting
    )
    db.add(participant)
    db.flush()  # assigns participant.id so the response can carry it

    # Build the payload before commit: afterwards the rows are expired and
    # reading them would lazy-load inside a closing request.
    payload = MeetingWithParticipantOut(
        meeting=MeetingOut.from_meeting(meeting),
        participant=ParticipantOut.from_participant(participant),
    )
    db.commit()
    return payload
