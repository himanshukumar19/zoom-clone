"""Host-only controls: mute-all + remove with 403/400/404 rules (T-007).

Seam: HTTP API only. Asserts status codes, envelopes, and stored state --
never internal helpers. Room identity is the X-Participant-Id header, not
auth: only the host row may mute-all or remove.
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


def _roster(client, code):
    return client.get(f"/api/meetings/{code}/participants").json()


def test_mute_all_as_host_mutes_guests_not_host(client):
    code, host_id = _instant(client)
    alice = _join(client, code, "Alice")
    bob = _join(client, code, "Bob")

    response = client.post(
        f"/api/meetings/{code}/mute-all",
        headers={"X-Participant-Id": str(host_id)},
    )

    assert response.status_code == 200
    assert response.json() == {"ok": True}
    states = {p["id"]: p["is_muted"] for p in _roster(client, code)}
    assert states == {host_id: False, alice: True, bob: True}


def test_mute_all_as_non_host_returns_403(client):
    code, _ = _instant(client)
    alice = _join(client, code, "Alice")
    _join(client, code, "Bob")

    response = client.post(
        f"/api/meetings/{code}/mute-all",
        headers={"X-Participant-Id": str(alice)},
    )

    assert response.status_code == 403
    assert "detail" in response.json()
    # Failed mute-all changes nothing.
    assert all(p["is_muted"] is False for p in _roster(client, code))


def test_mute_all_without_header_returns_400(client):
    code, _ = _instant(client)

    response = client.post(f"/api/meetings/{code}/mute-all")

    assert response.status_code == 400
    assert "detail" in response.json()


def test_mute_all_unknown_participant_returns_404(client):
    code, _ = _instant(client)

    response = client.post(
        f"/api/meetings/{code}/mute-all",
        headers={"X-Participant-Id": "999999"},
    )

    assert response.status_code == 404


def test_remove_as_host_drops_guest_from_roster(client):
    code, host_id = _instant(client)
    alice = _join(client, code, "Alice")
    bob = _join(client, code, "Bob")

    response = client.delete(
        f"/api/meetings/{code}/participants/{alice}",
        headers={"X-Participant-Id": str(host_id)},
    )

    assert response.status_code == 200
    assert response.json() == {"ok": True}
    assert {p["id"] for p in _roster(client, code)} == {host_id, bob}


def test_remove_as_non_host_returns_403(client):
    code, host_id = _instant(client)
    alice = _join(client, code, "Alice")
    bob = _join(client, code, "Bob")

    response = client.delete(
        f"/api/meetings/{code}/participants/{bob}",
        headers={"X-Participant-Id": str(alice)},
    )

    assert response.status_code == 403
    # Nobody was removed.
    assert {p["id"] for p in _roster(client, code)} == {host_id, alice, bob}


def test_remove_without_header_returns_400(client):
    code, host_id = _instant(client)
    alice = _join(client, code, "Alice")

    response = client.delete(f"/api/meetings/{code}/participants/{alice}")

    assert response.status_code == 400
    assert {p["id"] for p in _roster(client, code)} == {host_id, alice}


def test_remove_host_or_self_returns_400(client):
    code, host_id = _instant(client)
    alice = _join(client, code, "Alice")

    # Cannot remove the host.
    assert (
        client.delete(
            f"/api/meetings/{code}/participants/{host_id}",
            headers={"X-Participant-Id": str(host_id)},
        ).status_code
        == 400
    )
    # Host cannot remove themselves either.
    assert (
        client.delete(
            f"/api/meetings/{code}/participants/{host_id}",
            headers={"X-Participant-Id": str(host_id)},
        ).status_code
        == 400
    )
    # Failed removes change nothing.
    assert {p["id"] for p in _roster(client, code)} == {host_id, alice}


def test_remove_unknown_participant_returns_404(client):
    code, host_id = _instant(client)

    response = client.delete(
        f"/api/meetings/{code}/participants/999999",
        headers={"X-Participant-Id": str(host_id)},
    )

    assert response.status_code == 404
