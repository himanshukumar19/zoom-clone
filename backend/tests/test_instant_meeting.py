"""POST /api/meetings/instant -- one call, live Meeting + Host Participant (T-003).

Assertions stay at the HTTP boundary: status codes, envelope shape, and the
rows the request is supposed to leave behind. The fixture also seeds demo
meetings, so every stored-state query is scoped to the new Meeting.
"""

import re

from sqlalchemy import func, select

from app.config import settings
from app.database import SessionLocal
from app.models import Meeting, Participant

CODE_PATTERN = re.compile(r"^\d{10}$")


def test_creates_live_instant_meeting_titled_after_the_default_user(client):
    response = client.post("/api/meetings/instant")

    assert response.status_code == 201
    meeting = response.json()["meeting"]
    assert meeting["type"] == "instant"
    assert meeting["status"] == "live"
    assert meeting["title"] == "Demo User's Meeting"
    assert meeting["host"] == {"id": 1, "name": "Demo User"}
    # Instant means "now", not "at some future time".
    assert meeting["scheduled_start"] is None
    assert meeting["duration_minutes"] is None


def test_returns_host_participant_for_the_new_meeting(client):
    response = client.post("/api/meetings/instant")

    assert response.status_code == 201
    body = response.json()
    participant = body["participant"]
    assert participant["role"] == "host"
    assert participant["display_name"] == "Demo User"
    assert participant["meeting_id"] == body["meeting"]["id"]
    assert participant["is_muted"] is False
    assert participant["is_removed"] is False
    # Times are UTC with a Z designator so any browser can localise them (D6).
    assert participant["joined_at"].endswith("Z")


def test_returns_raw_code_spaced_display_code_and_computed_invite_link(client):
    response = client.post("/api/meetings/instant")

    meeting = response.json()["meeting"]
    code = meeting["meeting_code"]
    assert CODE_PATTERN.match(code)
    assert code[0] != "0"
    assert meeting["meeting_code_display"] == f"{code[:3]} {code[3:6]} {code[6:]}"
    assert meeting["invite_link"] == f"{settings.FRONTEND_URL.rstrip('/')}/join/{code}"

    # The Invite Link is computed, never persisted: the stored code stays raw.
    with SessionLocal() as db:
        stored_code = db.scalar(
            select(Meeting.meeting_code).where(Meeting.id == meeting["id"])
        )
    assert stored_code == code


def test_meeting_and_host_participant_are_persisted(client):
    body = client.post("/api/meetings/instant").json()

    with SessionLocal() as db:
        meeting = db.get(Meeting, body["meeting"]["id"])
        participant = db.get(Participant, body["participant"]["id"])
    assert meeting.status == "live"
    assert meeting.ended_at is None
    assert participant.meeting_id == meeting.id
    assert participant.user_id == meeting.host_id
    assert participant.left_at is None


def test_codes_are_unique_across_many_rapid_creates(client):
    codes = [
        client.post("/api/meetings/instant").json()["meeting"]["meeting_code"]
        for _ in range(25)
    ]

    assert len(set(codes)) == 25
    for code in codes:
        assert CODE_PATTERN.match(code)
        assert code[0] != "0"

    # Uniqueness is enforced on storage, not just in the responses.
    with SessionLocal() as db:
        stored = db.scalar(
            select(func.count())
            .select_from(Meeting)
            .where(Meeting.type == "instant")
        )
    assert stored == 25
