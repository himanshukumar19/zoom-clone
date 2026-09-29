"""Meetings routes (plan section 6). Thin by design: no queries, no rules."""

from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.meeting import (
    JoinMeetingIn,
    MeetingOut,
    MeetingWithParticipantOut,
    ParticipantOut,
    ScheduleMeetingIn,
    SelfMuteIn,
)
from app.services import meeting_service, participant_service

router = APIRouter(prefix="/api/meetings", tags=["meetings"])


@router.post(
    "/instant",
    response_model=MeetingWithParticipantOut,
    status_code=201,
    summary="Create an instant Meeting and join the Default User as Host",
)
def create_instant_meeting(db: Session = Depends(get_db)) -> MeetingWithParticipantOut:
    return meeting_service.create_instant_meeting(db)


@router.post(
    "",
    response_model=MeetingOut,
    status_code=201,
    summary="Schedule a meeting for later",
)
def schedule_meeting(
    payload: ScheduleMeetingIn, db: Session = Depends(get_db)
) -> MeetingOut:
    return meeting_service.schedule_meeting(
        db,
        title=payload.title,
        description=payload.description,
        scheduled_start=payload.scheduled_start,
        duration_minutes=payload.duration_minutes,
    )


@router.get("", response_model=list[MeetingOut], summary="Upcoming / recent lists")
def list_meetings(
    filter: str = "upcoming", db: Session = Depends(get_db)
) -> list[MeetingOut]:
    return meeting_service.list_meetings(db, filter)


@router.get("/{code}", response_model=MeetingOut, summary="Validate a meeting exists")
def get_meeting(code: str, db: Session = Depends(get_db)) -> MeetingOut:
    return MeetingOut.from_meeting(meeting_service.get_by_code(db, code))


@router.post(
    "/{code}/start",
    response_model=MeetingWithParticipantOut,
    summary="Host starts a scheduled meeting",
)
def start_meeting(code: str, db: Session = Depends(get_db)) -> MeetingWithParticipantOut:
    return meeting_service.start_by_code(db, code)


@router.post(
    "/{code}/join",
    response_model=MeetingWithParticipantOut,
    status_code=201,
    summary="Join as a guest with a display name",
)
def join_meeting(
    code: str,
    payload: JoinMeetingIn,
    db: Session = Depends(get_db),
    x_participant_id: int | None = Header(default=None, alias="X-Participant-Id"),
) -> MeetingWithParticipantOut:
    return meeting_service.join_by_code(
        db, code, payload.display_name, caller_id=x_participant_id
    )


@router.post("/{code}/leave", summary="Leave; last active leave ends the meeting")
def leave_meeting(
    code: str,
    db: Session = Depends(get_db),
    x_participant_id: int | None = Header(default=None, alias="X-Participant-Id"),
) -> dict:
    return participant_service.leave(db, code, x_participant_id)


@router.get(
    "/{code}/participants",
    response_model=list[ParticipantOut],
    summary="Active participants",
)
def list_participants(code: str, db: Session = Depends(get_db)) -> list[ParticipantOut]:
    return participant_service.list_active(db, code)


@router.patch(
    "/{code}/participants/me",
    response_model=ParticipantOut,
    summary="Toggle own mute",
)
def mute_self(
    code: str,
    payload: SelfMuteIn,
    db: Session = Depends(get_db),
    x_participant_id: int | None = Header(default=None, alias="X-Participant-Id"),
) -> ParticipantOut:
    return participant_service.toggle_self_mute(
        db, code, x_participant_id, payload.is_muted
    )


@router.post("/{code}/mute-all", summary="Host-only: mute all non-host participants")
def mute_all(
    code: str,
    db: Session = Depends(get_db),
    x_participant_id: int | None = Header(default=None, alias="X-Participant-Id"),
) -> dict:
    return participant_service.mute_all(db, code, x_participant_id)


@router.delete(
    "/{code}/participants/{participant_id}",
    summary="Host-only: remove a participant",
)
def remove_participant(
    code: str,
    participant_id: int,
    db: Session = Depends(get_db),
    x_participant_id: int | None = Header(default=None, alias="X-Participant-Id"),
) -> dict:
    return participant_service.remove_participant(
        db, code, participant_id, x_participant_id
    )
