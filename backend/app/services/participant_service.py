"""Participant rules: roster, leave with auto-end, self-mute, host controls.

Room identity is NOT auth (ADR-0002): callers send X-Participant-Id, the
backend uses it only to locate the participant row and enforce the
"only the host can mute-all / remove" business rule.
"""

from datetime import datetime, timezone

from fastapi import Header, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Meeting, Participant
from app.schemas.meeting import ParticipantOut
from app.services import meeting_service


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _active_participants(db: Session, meeting_id: int) -> list[Participant]:
    return list(
        db.scalars(
            select(Participant)
            .where(
                Participant.meeting_id == meeting_id,
                Participant.left_at.is_(None),
                Participant.is_removed.is_(False),
            )
            .order_by(Participant.id.asc())
        ).all()
    )


def require_caller(
    db: Session, meeting: Meeting, participant_id: int | None
) -> Participant:
    """Locate the caller's row for this meeting or raise a friendly error."""
    if participant_id is None:
        raise HTTPException(
            status_code=400, detail="Missing X-Participant-Id header."
        )
    caller = db.get(Participant, participant_id)
    if (
        caller is None
        or caller.meeting_id != meeting.id
        or caller.is_removed
        or caller.left_at is not None
    ):
        raise HTTPException(
            status_code=404, detail="Participant not in this meeting."
        )
    return caller


def require_host(caller: Participant) -> None:
    if caller.role != "host":
        raise HTTPException(
            status_code=403, detail="Only the host can do this."
        )


def list_active(db: Session, code: str) -> list[ParticipantOut]:
    meeting = meeting_service.get_by_code(db, code)
    return [ParticipantOut.from_participant(p) for p in _active_participants(db, meeting.id)]


def leave(db: Session, code: str, participant_id: int | None) -> dict:
    """Mark the caller left; last active leave flips the meeting to ended."""
    meeting = meeting_service.get_by_code(db, code)
    caller = require_caller(db, meeting, participant_id)
    caller.left_at = _utcnow()
    db.flush()
    remaining = _active_participants(db, meeting.id)
    if not remaining and meeting.status != "ended":
        meeting.status = "ended"
        meeting.ended_at = _utcnow()
    db.commit()
    return {"ok": True}


def toggle_self_mute(
    db: Session, code: str, participant_id: int | None, is_muted: bool
) -> ParticipantOut:
    meeting = meeting_service.get_by_code(db, code)
    caller = require_caller(db, meeting, participant_id)
    caller.is_muted = is_muted
    db.commit()
    db.refresh(caller)
    return ParticipantOut.from_participant(caller)


def mute_all(db: Session, code: str, participant_id: int | None) -> dict:
    """Host-only: mute every active non-host participant (T-007)."""
    meeting = meeting_service.get_by_code(db, code)
    caller = require_caller(db, meeting, participant_id)
    require_host(caller)
    for p in _active_participants(db, meeting.id):
        if p.role != "host":
            p.is_muted = True
    db.commit()
    return {"ok": True}


def remove_participant(
    db: Session, code: str, target_id: int, participant_id: int | None
) -> dict:
    """Host-only remove (T-007). Cannot remove the host or self."""
    meeting = meeting_service.get_by_code(db, code)
    caller = require_caller(db, meeting, participant_id)
    require_host(caller)
    target = db.get(Participant, target_id)
    if target is None or target.meeting_id != meeting.id:
        raise HTTPException(status_code=404, detail="Participant not found.")
    if target.role == "host" or target.id == caller.id:
        raise HTTPException(
            status_code=400, detail="Cannot remove the host."
        )
    target.is_removed = True
    target.left_at = _utcnow()
    db.commit()
    return {"ok": True}


def caller_from_header(
    x_participant_id: int | None = Header(default=None, alias="X-Participant-Id"),
) -> int | None:
    """Pass the raw header through; require_caller raises the friendly 400."""
    return x_participant_id
