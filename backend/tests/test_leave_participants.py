"""Leave with auto-end, active roster, self mute-toggle (T-006, ADR-0002).

Seam: HTTP API only. Asserts status codes, envelopes, and stored state.
Room identity is the X-Participant-Id header, not auth.
"""


def _instant(client):
    """Create a live instant meeting; returns (code, host_id)."""
    body = client.post("/api/meetings/instant").json()
    return body["meeting"]["meeting_code"], body["participant"]["id"]


def _join(client, code, name):
    body = client.post(
        f"/api/meetings/{code}/join", json={"display_name": name}
    ).json()
    return body["participant"]["id"]


def test_participants_list_returns_only_active(client):
    code, host_id = _instant(client)
    alice = _join(client, code, "Alice")
    bob = _join(client, code, "Bob")

    # All three are active at first.
    assert len(client.get(f"/api/meetings/{code}/participants").json()) == 3

    # Alice leaves: roster drops her but the meeting stays live.
    assert (
        client.post(
            f"/api/meetings/{code}/leave",
            headers={"X-Participant-Id": str(alice)},
        ).status_code
        == 200
    )
    active = client.get(f"/api/meetings/{code}/participants").json()
    assert {p["id"] for p in active} == {host_id, bob}
    assert client.get(f"/api/meetings/{code}").json()["status"] == "live"

    # Host removes Bob (T-007 endpoint): roster drops him too.
    assert (
        client.delete(
            f"/api/meetings/{code}/participants/{bob}",
            headers={"X-Participant-Id": str(host_id)},
        ).status_code
        == 200
    )
    active = client.get(f"/api/meetings/{code}/participants").json()
    assert [p["id"] for p in active] == [host_id]


def test_leave_without_header_returns_400(client):
    code, _ = _instant(client)
    response = client.post(f"/api/meetings/{code}/leave")
    assert response.status_code == 400
    assert "detail" in response.json()


def test_leave_unknown_participant_returns_404(client):
    code, _ = _instant(client)
    response = client.post(
        f"/api/meetings/{code}/leave", headers={"X-Participant-Id": "999999"}
    )
    assert response.status_code == 404


def test_last_active_leave_ends_meeting(client):
    code, host_id = _instant(client)
    guest = _join(client, code, "Guest")
    # Guest leaves first: one active (host) remains, still live.
    client.post(
        f"/api/meetings/{code}/leave",
        headers={"X-Participant-Id": str(guest)},
    )
    assert client.get(f"/api/meetings/{code}").json()["status"] == "live"
    # Host leaves last: nobody active, meeting flips to ended.
    assert (
        client.post(
            f"/api/meetings/{code}/leave",
            headers={"X-Participant-Id": str(host_id)},
        ).status_code
        == 200
    )
    assert client.get(f"/api/meetings/{code}").json()["status"] == "ended"


def test_self_mute_flips_only_caller(client):
    code, host_id = _instant(client)
    alice = _join(client, code, "Alice")
    bob = _join(client, code, "Bob")

    response = client.patch(
        f"/api/meetings/{code}/participants/me",
        json={"is_muted": True},
        headers={"X-Participant-Id": str(alice)},
    )
    assert response.status_code == 200
    assert response.json()["id"] == alice
    assert response.json()["is_muted"] is True

    # Only Alice is muted; host and Bob are untouched.
    states = {
        p["id"]: p["is_muted"]
        for p in client.get(f"/api/meetings/{code}/participants").json()
    }
    assert states == {host_id: False, alice: True, bob: False}


def test_self_mute_without_header_returns_400(client):
    code, _ = _instant(client)
    response = client.patch(
        f"/api/meetings/{code}/participants/me", json={"is_muted": True}
    )
    assert response.status_code == 400


def test_join_on_ended_meeting_returns_410(client):
    code, host_id = _instant(client)
    client.post(
        f"/api/meetings/{code}/leave",
        headers={"X-Participant-Id": str(host_id)},
    )
    assert client.get(f"/api/meetings/{code}").json()["status"] == "ended"
    response = client.post(
        f"/api/meetings/{code}/join", json={"display_name": "Late Guest"}
    )
    assert response.status_code == 410
