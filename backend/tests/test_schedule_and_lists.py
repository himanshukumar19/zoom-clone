"""Schedule validation + Upcoming/Recent list filters (T-004, D13).

Seam: HTTP API only. Asserts status codes, envelopes, and stored state --
never internal helpers. Covers the T-008 "list filters" gap: seed data
already gives 3 upcoming + 4 recent, new schedules land in Upcoming, and
ended meetings move to Recent.
"""

import re
from datetime import datetime, timedelta, timezone

CODE_PATTERN = re.compile(r"^\d{10}$")


def _future_iso(days=1):
    """ISO timestamp with Z designator, safely in the future."""
    return (datetime.now(timezone.utc) + timedelta(days=days)).isoformat().replace(
        "+00:00", "Z"
    )


def _past_iso(days=1):
    return (datetime.now(timezone.utc) - timedelta(days=days)).isoformat().replace(
        "+00:00", "Z"
    )


def _schedule(client, **overrides):
    payload = {
        "title": "Planned Sync",
        "description": "Weekly sync.",
        "scheduled_start": _future_iso(days=2),
        "duration_minutes": 30,
    }
    payload.update(overrides)
    return client.post("/api/meetings", json=payload)


def test_schedule_creates_scheduled_meeting_with_code_and_link(client):
    response = _schedule(client)

    assert response.status_code == 201
    meeting = response.json()
    assert meeting["type"] == "scheduled"
    assert meeting["status"] == "scheduled"
    assert meeting["title"] == "Planned Sync"
    assert CODE_PATTERN.match(meeting["meeting_code"])
    assert meeting["meeting_code"][0] != "0"
    assert meeting["meeting_code_display"] == (
        f"{meeting['meeting_code'][:3]} "
        f"{meeting['meeting_code'][3:6]} "
        f"{meeting['meeting_code'][6:]}"
    )
    assert meeting["invite_link"].endswith(f"/join/{meeting['meeting_code']}")


def test_schedule_codes_are_unique(client):
    codes = [_schedule(client).json()["meeting_code"] for _ in range(10)]

    assert len(set(codes)) == 10
    for code in codes:
        assert CODE_PATTERN.match(code)
        assert code[0] != "0"


def test_schedule_past_start_returns_422(client):
    response = _schedule(client, scheduled_start=_past_iso(days=1))

    assert response.status_code == 422
    assert "detail" in response.json()


def test_schedule_bad_durations_return_422(client):
    for bad in [0, -15]:
        response = _schedule(client, duration_minutes=bad)
        assert response.status_code == 422, bad


def test_schedule_bad_titles_return_422(client):
    for bad in ["", "   ", "x" * 201]:
        response = _schedule(client, title=bad)
        assert response.status_code == 422, repr(bad)


def test_schedule_long_description_returns_422(client):
    response = _schedule(client, description="x" * 2001)

    assert response.status_code == 422


def test_upcoming_contains_seed_and_new_schedule(client):
    upcoming = client.get("/api/meetings?filter=upcoming").json()

    # Seed provides 3 upcoming scheduled meetings (see seed.py).
    assert len(upcoming) == 3
    assert {m["status"] for m in upcoming} == {"scheduled"}

    new_code = _schedule(client).json()["meeting_code"]
    upcoming = client.get("/api/meetings?filter=upcoming").json()

    assert len(upcoming) == 4
    assert new_code in {m["meeting_code"] for m in upcoming}
    # Same default query (no filter) is Upcoming.
    assert client.get("/api/meetings").json() == upcoming


def test_recent_contains_seed_ended_meetings(client):
    recent = client.get("/api/meetings?filter=recent").json()

    # Seed provides 4 ended meetings from the past week.
    assert len(recent) == 4
    assert {m["status"] for m in recent} == {"ended"}


def test_lists_are_newest_first(client):
    first = _schedule(client, title="First").json()
    second = _schedule(client, title="Second").json()

    upcoming = client.get("/api/meetings?filter=upcoming").json()
    codes = [m["meeting_code"] for m in upcoming]
    # Newest created sorts first (created_at desc, id desc tiebreak).
    assert codes.index(second["meeting_code"]) < codes.index(first["meeting_code"])


def test_ended_meeting_moves_from_upcoming_to_recent(client):
    created = client.post("/api/meetings/instant").json()
    code = created["meeting"]["meeting_code"]
    host_id = created["participant"]["id"]

    assert code in {
        m["meeting_code"]
        for m in client.get("/api/meetings?filter=upcoming").json()
    }

    # Last active leave flips the meeting to ended (T-006 rule).
    assert (
        client.post(
            f"/api/meetings/{code}/leave",
            headers={"X-Participant-Id": str(host_id)},
        ).status_code
        == 200
    )

    upcoming_codes = {
        m["meeting_code"]
        for m in client.get("/api/meetings?filter=upcoming").json()
    }
    recent_codes = {
        m["meeting_code"] for m in client.get("/api/meetings?filter=recent").json()
    }
    assert code not in upcoming_codes
    assert code in recent_codes


def test_live_meeting_is_upcoming_not_recent(client):
    code = client.post("/api/meetings/instant").json()["meeting"]["meeting_code"]

    upcoming_codes = {
        m["meeting_code"]
        for m in client.get("/api/meetings?filter=upcoming").json()
    }
    recent_codes = {
        m["meeting_code"] for m in client.get("/api/meetings?filter=recent").json()
    }
    assert code in upcoming_codes
    assert code not in recent_codes


def test_invalid_filter_returns_422(client):
    response = client.get("/api/meetings?filter=today")

    assert response.status_code == 422
    assert "detail" in response.json()
