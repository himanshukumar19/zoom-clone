"""Response shapes for the meetings API (plan section 6).

Each schema knows how to build itself from a model row, so routes never
reformat a code or recompute an Invite Link by hand.
"""

from typing import Optional

from pydantic import BaseModel

from app.models import Meeting, Participant
from app.schemas.common import UtcDateTime
from app.utils.meeting_code import build_invite_link, format_meeting_code


class HostOut(BaseModel):
    """Enough to render a row. No email: there are no accounts to manage."""

    id: int
    name: str


class MeetingOut(BaseModel):
    id: int
    meeting_code: str
    meeting_code_display: str
    title: str
    description: Optional[str]
    type: str
    status: str
    scheduled_start: Optional[UtcDateTime]
    duration_minutes: Optional[int]
    invite_link: str
    host: HostOut

    @classmethod
    def from_meeting(cls, meeting: Meeting) -> "MeetingOut":
        return cls(
            id=meeting.id,
            meeting_code=meeting.meeting_code,
            meeting_code_display=format_meeting_code(meeting.meeting_code),
            title=meeting.title,
            description=meeting.description,
            type=meeting.type,
            status=meeting.status,
            scheduled_start=meeting.scheduled_start,
            duration_minutes=meeting.duration_minutes,
            invite_link=build_invite_link(meeting.meeting_code),
            host=HostOut(id=meeting.host.id, name=meeting.host.name),
        )


class ParticipantOut(BaseModel):
    id: int
    meeting_id: int
    display_name: str
    role: str
    is_muted: bool
    is_removed: bool
    joined_at: UtcDateTime

    @classmethod
    def from_participant(cls, participant: Participant) -> "ParticipantOut":
        return cls(
            id=participant.id,
            meeting_id=participant.meeting_id,
            display_name=participant.display_name,
            role=participant.role,
            is_muted=participant.is_muted,
            is_removed=participant.is_removed,
            joined_at=participant.joined_at,
        )


class MeetingWithParticipantOut(BaseModel):
    """Envelope for calls that create a Meeting and join the caller to it."""

    meeting: MeetingOut
    participant: ParticipantOut
