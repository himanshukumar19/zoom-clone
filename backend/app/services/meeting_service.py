"""Meeting rules: instant, schedule, list, start, join (T-003..T-005).

Lifecycle lives here, not in the routers: instant starts `live`, the first
join to a scheduled Meeting flips it `live` (T-005), the last participant to
leave flips it `ended` (T-006).
"""

from datetime import datetime, timedelta, timezone

from fastapi import HTTPException
from sqlalchemy import select
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


def _as_utc(value: datetime) -> datetime:
    """SQLite returns naive datetimes; treat those as UTC for comparisons."""
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def _scheduled_end(meeting: Meeting) -> datetime | None:
    """Scheduled end = start + duration. None when the meeting has no schedule."""
    if meeting.scheduled_start is None or meeting.duration_minutes is None:
        return None
    return _as_utc(meeting.scheduled_start) + timedelta(
        minutes=meeting.duration_minutes
    )


def _is_upcoming(meeting: Meeting, now: datetime) -> bool:
    """D13: not ended AND not past its scheduled end (no end = upcoming)."""
    if meeting.status == "ended":
        return False
    end = _scheduled_end(meeting)
    return end is None or end > now


def _is_recent(meeting: Meeting, now: datetime) -> bool:
    """D13: ended, or a scheduled meeting whose end time has passed."""
    if meeting.status == "ended":
        return True
    end = _scheduled_end(meeting)
    return end is not None and end <= now


def get_by_code(db: Session, code: str) -> Meeting:
    """Fetch a meeting by raw code (digits only) or raise 404."""
    raw = "".join(ch for ch in code if ch.isdigit())
    meeting = db.scalar(select(Meeting).where(Meeting.meeting_code == raw))
    if meeting is None:
        raise HTTPException(status_code=404, detail="Meeting ID not found.")
    return meeting


def schedule_meeting(
    db: Session,
    title: str,
    description: str | None,
    scheduled_start: datetime,
    duration_minutes: int,
) -> MeetingOut:
    """Create a scheduled meeting for the Default User (T-004)."""
    host = get_default_user(db)
    now = _utcnow()
    start = _as_utc(scheduled_start)
    if start <= now:
        raise HTTPException(
            status_code=422, detail="Scheduled start must be in the future."
        )
    if duration_minutes <= 0:
        raise HTTPException(
            status_code=422, detail="Duration must be greater than 0."
        )
    meeting = Meeting(
        meeting_code=generate_meeting_code(db),
        title=title.strip(),
        description=description,
        host_id=host.id,
        type="scheduled",
        status="scheduled",
        scheduled_start=scheduled_start,
        duration_minutes=duration_minutes,
        started_at=None,
        ended_at=None,
        created_at=now,
    )
    db.add(meeting)
    db.commit()
    db.refresh(meeting)
    return MeetingOut.from_meeting(meeting)


def start_by_code(db: Session, code: str) -> MeetingWithParticipantOut:
    """Host starts a scheduled meeting: status -> live + host participant."""
    meeting = get_by_code(db, code)
    if meeting.status == "ended":
        raise HTTPException(status_code=410, detail="This meeting has ended.")
    now = _utcnow()
    if meeting.status == "scheduled":
        meeting.status = "live"
        meeting.started_at = now
    host = get_default_user(db)
    # Reuse the active host row if Start is pressed twice.
    existing = db.scalar(
        select(Participant).where(
            Participant.meeting_id == meeting.id,
            Participant.role == "host",
            Participant.left_at.is_(None),
            Participant.is_removed.is_(False),
        )
    )
    if existing is None:
        existing = Participant(
            meeting_id=meeting.id,
            user_id=host.id,
            display_name=host.name,
            role="host",
            is_muted=False,
            is_removed=False,
            joined_at=now,
            left_at=None,
        )
        db.add(existing)
        db.flush()
    payload = MeetingWithParticipantOut(
        meeting=MeetingOut.from_meeting(meeting),
        participant=ParticipantOut.from_participant(existing),
    )
    db.commit()
    return payload


def join_by_code(
    db: Session, code: str, display_name: str, caller_id: int | None = None
) -> MeetingWithParticipantOut:
    """Guest join (T-005). First join to a scheduled meeting flips it live."""
    meeting = get_by_code(db, code)
    if meeting.status == "ended":
        raise HTTPException(status_code=410, detail="This meeting has ended.")
    name = display_name.strip()
    if not name or len(name) > 50:
        raise HTTPException(
            status_code=422, detail="Display name must be 1-50 characters."
        )
    # A removed session cannot act again with the same identity (T-005).
    if caller_id is not None:
        caller = db.get(Participant, caller_id)
        if (
            caller is not None
            and caller.meeting_id == meeting.id
            and caller.is_removed
        ):
            raise HTTPException(
                status_code=403, detail="You were removed from this meeting."
            )
    # Reuse active participant row if this session already exists (prevent
    # duplicate rows from refresh / double-click / Strict Mode).
    if caller_id is not None:
        existing = db.get(Participant, caller_id)
        if existing is not None and existing.meeting_id == meeting.id and existing.is_removed is False and existing.left_at is None:
            # Update display name if changed and return existing row.
            existing.display_name = name
            db.commit()
            db.refresh(existing)
            payload = MeetingWithParticipantOut(
                meeting=MeetingOut.from_meeting(meeting),
                participant=ParticipantOut.from_participant(existing),
            )
            return payload
    # Also guard by active display name for same meeting (refresh case).
    existing_name = db.scalar(
        select(Participant).where(
            Participant.meeting_id == meeting.id,
            Participant.display_name == name,
            Participant.left_at.is_(None),
            Participant.is_removed.is_(False),
        )
    )
    if existing_name is not None:
        payload = MeetingWithParticipantOut(
            meeting=MeetingOut.from_meeting(meeting),
            participant=ParticipantOut.from_participant(existing_name),
        )
        db.commit()
        return payload
    now = _utcnow()
    if meeting.status == "scheduled":
        meeting.status = "live"
        meeting.started_at = now
    participant = Participant(
        meeting_id=meeting.id,
        user_id=None,  # guests have no user row
        display_name=name,
        role="participant",
        is_muted=False,
        is_removed=False,
        joined_at=now,
        left_at=None,
    )
    db.add(participant)
    db.flush()
    payload = MeetingWithParticipantOut(
        meeting=MeetingOut.from_meeting(meeting),
        participant=ParticipantOut.from_participant(participant),
    )
    db.commit()
    return payload


def end_by_code(db: Session, code: str, participant_id: int | None) -> dict:
    """Host ends meeting for all (T-007). 403 non-host, 410 ended, 404 unknown."""
    from app.services.participant_service import require_caller, require_host
    meeting = get_by_code(db, code)
    if meeting.status == "ended":
        raise HTTPException(status_code=410, detail="This meeting has ended.")
    caller = require_caller(db, meeting, participant_id)
    require_host(caller)
    meeting.status = "ended"
    meeting.ended_at = _utcnow()
    for p in db.scalars(
        select(Participant).where(
            Participant.meeting_id == meeting.id,
            Participant.left_at.is_(None),
            Participant.is_removed.is_(False),
        )
    ).all():
        p.left_at = meeting.ended_at
    db.commit()
    return {"ok": True}


def list_meetings(
    db: Session, meeting_filter: str = "upcoming"
) -> list[MeetingOut]:
    """Dashboard lists (T-004): Upcoming / Recent per D13, newest first.

    Newest = most recently created. Filtering happens in Python (the dashboard
    set is small) so naive-vs-aware SQLite datetimes are handled in one place.
    """
    # Lazy expiry (no background job): live meeting with 0 active participants
    # becomes ended; live meeting past started_at + duration + 15 min becomes
    # ended (closing open left_at values); instant meetings capped at 40 min.
    now = _utcnow()
    for row in db.scalars(select(Meeting)).all():
        if row.status == "live" and row.started_at is not None:
            # Zero active participants → ended
            active = db.scalars(
                select(Participant).where(
                    Participant.meeting_id == row.id,
                    Participant.left_at.is_(None),
                    Participant.is_removed.is_(False),
                )
            ).all()
            if len(active) == 0:
                row.status = "ended"
                row.ended_at = now
                for p in db.scalars(
                    select(Participant).where(
                        Participant.meeting_id == row.id,
                        Participant.left_at.is_(None),
                    )
                ).all():
                    p.left_at = now
            else:
                # Past scheduled end + 15 min buffer (or 40 min cap for instant)
                cap = timedelta(minutes=40) if row.duration_minutes is None else timedelta(minutes=row.duration_minutes + 15)
                if now > _as_utc(row.started_at) + cap:
                    row.status = "ended"
                    row.ended_at = now
                    for p in db.scalars(
                        select(Participant).where(
                            Participant.meeting_id == row.id,
                            Participant.left_at.is_(None),
                        )
                    ).all():
                        p.left_at = now
    db.commit()

    if meeting_filter not in ("upcoming", "recent"):
        raise HTTPException(
            status_code=422, detail="Filter must be 'upcoming' or 'recent'."
        )
    now = _utcnow()
    rows = db.scalars(
        select(Meeting).order_by(Meeting.created_at.desc(), Meeting.id.desc())
    ).all()
    if meeting_filter == "upcoming":
        kept = [m for m in rows if _is_upcoming(m, now)]
    else:
        kept = [m for m in rows if _is_recent(m, now)]
    return [MeetingOut.from_meeting(m) for m in kept]
