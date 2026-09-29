"""Meetings routes (plan section 6). Thin handlers: rules live in services."""

from typing import Literal

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.meeting import (
    MeetingOut,
    MeetingWithParticipantOut,
    ScheduleMeetingIn,
    ScheduleMeetingOut,
)
from app.services import meeting_service

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
    response_model=ScheduleMeetingOut,
    status_code=201,
    summary="Schedule a future Meeting for the Default User",
)
def schedule_meeting(
    payload: ScheduleMeetingIn, db: Session = Depends(get_db)
) -> ScheduleMeetingOut:
    return meeting_service.create_scheduled_meeting(db, payload)


@router.get(
    "",
    response_model=list[MeetingOut],
    summary="Dashboard lists: Upcoming (not ended, end in future) or Recent",
)
def list_meetings(
    meeting_filter: Literal["upcoming", "recent"] = Query(alias="filter"),
    db: Session = Depends(get_db),
) -> list[MeetingOut]:
    return meeting_service.list_meetings(db, meeting_filter)
