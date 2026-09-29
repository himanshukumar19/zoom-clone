"""GET-by-code, host start, guest join with lifecycle rules (T-005, ADR-0003).

Seam: HTTP API only. Asserts status codes, envelopes, and stored state.
"""

from datetime import datetime, timedelta, timezone


def _upcoming_code(client, want_status="scheduled"):
    """Return a code from Upcoming, preferring one with the wanted status."""
    meetings = client.get("/api/meetings?filter=upcoming").json()
    assert meetings, "seed should provide upcoming meetings"
    for m in meetings:
        detail = client.get(f"/api/meetings/{m['meeting_code']}").json()
        if detail["status"] == want_status:
            return m["meeting_code"]
    return meetings[0]["meeting_code"]


def test_get_by_code_returns_meeting(client):
    code = _upcoming_code(client)
    response = client.get(f"/api/meetings/{code}")
    assert response.status_code == 200
    body = response.json()
    assert body["meeting_code"] == code
    assert body["invite_link"].endswith(f"/join/{code}")


def test_get_unknown_code_returns_404(client):
    response = client.get("/api/meetings/0000000000")
    assert response.status_code == 404
    assert "detail" in response.json()


def test_get_accepts_spaced_code(client):
    code = _upcoming_code(client)
    spaced = f"{code[:3]} {code[3:6]} {code[6:]}"
    response = client.get(f"/api/meetings/{spaced}")
    assert response.status_code == 200
    assert response.json()["meeting_code"] == code


def test_start_flips_scheduled_to_live_with_host_participant(client):
    code = _upcoming_code(client, want_status="scheduled")
    response = client.post(f"/api/meetings/{code}/start")
    assert response.status_code == 200
    body = response.json()
    assert body["meeting"]["status"] == "live"
    assert body["participant"]["role"] == "host"
    assert body["participant"]["meeting_id"] == body["meeting"]["id"]


def test_start_unknown_code_returns_404(client):
    assert client.post("/api/meetings/0000000000/start").status_code == 404


def _ended_code(client):
    """Make an ended meeting: instant meeting + host leaves (last out ends it)."""
    created = client.post("/api/meetings/instant").json()
    code = created["meeting"]["meeting_code"]
    host_id = created["participant"]["id"]
    assert client.post(
        f"/api/meetings/{code}/leave", headers={"X-Participant-Id": str(host_id)}
    ).status_code == 200
    assert client.get(f"/api/meetings/{code}").json()["status"] == "ended"
    return code


def test_start_ended_returns_410(client):
    code = _ended_code(client)
    response = client.post(f"/api/meetings/{code}/start")
    assert response.status_code == 410


def test_join_valid_name_returns_meeting_and_participant(client):
    code = _upcoming_code(client)
    response = client.post(
        f"/api/meetings/{code}/join", json={"display_name": "  Alice  "}
    )
    assert response.status_code == 201
    body = response.json()
    assert body["meeting"]["meeting_code"] == code
    # Service trims the name; the schema validator trims it too.
    assert body["participant"]["display_name"] == "Alice"
    assert body["participant"]["role"] == "participant"
    assert body["participant"]["meeting_id"] == body["meeting"]["id"]


def test_join_bad_names_return_422(client):
    code = _upcoming_code(client)
    for bad in ["", "   ", "x" * 51]:
        response = client.post(
            f"/api/meetings/{code}/join", json={"display_name": bad}
        )
        assert response.status_code == 422, bad


def test_join_unknown_code_returns_404(client):
    response = client.post(
        "/api/meetings/0000000000/join", json={"display_name": "Bob"}
    )
    assert response.status_code == 404


def test_join_ended_returns_410(client):
    code = _ended_code(client)
    response = client.post(
        f"/api/meetings/{code}/join", json={"display_name": "Bob"}
    )
    assert response.status_code == 410


def test_first_join_flips_scheduled_to_live(client):
    code = _upcoming_code(client, want_status="scheduled")
    assert client.get(f"/api/meetings/{code}").json()["status"] == "scheduled"
    response = client.post(
        f"/api/meetings/{code}/join", json={"display_name": "Early Guest"}
    )
    assert response.status_code == 201
    assert response.json()["meeting"]["status"] == "live"
    assert client.get(f"/api/meetings/{code}").json()["status"] == "live"


def test_removed_session_cannot_rejoin(client):
    created = client.post("/api/meetings/instant").json()
    code = created["meeting"]["meeting_code"]
    host_id = created["participant"]["id"]
    guest_id = client.post(
        f"/api/meetings/{code}/join", json={"display_name": "Guest1"}
    ).json()["participant"]["id"]
    # Host-only remove (T-007 endpoint already exists; T-005 only needs the block).
    assert (
        client.delete(
            f"/api/meetings/{code}/participants/{guest_id}",
            headers={"X-Participant-Id": str(host_id)},
        ).status_code
        == 200
    )
    response = client.post(
        f"/api/meetings/{code}/join",
        json={"display_name": "Guest1"},
        headers={"X-Participant-Id": str(guest_id)},
    )
    assert response.status_code == 403
