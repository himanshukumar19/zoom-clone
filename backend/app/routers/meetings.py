"""Meetings routes (plan section 6)."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.meeting import MeetingWithParticipantOut
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
