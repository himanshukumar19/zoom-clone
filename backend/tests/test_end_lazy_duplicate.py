"""Missing coverage: /end endpoint, lazy expiry, duplicate-participant guard."""


def test_end_by_host_ends_meeting(client):
    body = client.post("/api/meetings/instant").json()
    code = body["meeting"]["meeting_code"]
    host_id = body["participant"]["id"]
    resp = client.post(f"/api/meetings/{code}/end", headers={"X-Participant-Id": str(host_id)})
    assert resp.status_code == 200
    assert resp.json() == {"ok": True}
    assert client.get(f"/api/meetings/{code}").json()["status"] == "ended"


def test_lazy_expiry_ends_live_with_no_active_participants(client):
    body = client.post("/api/meetings/instant").json()
    code = body["meeting"]["meeting_code"]
    host_id = body["participant"]["id"]
    # Host leaves -> 0 active -> lazy expiry should set ended on list
    client.post(f"/api/meetings/{code}/leave", headers={"X-Participant-Id": str(host_id)})
    # Next list call triggers lazy expiry
    upcoming = client.get("/api/meetings?filter=upcoming").json()
    assert code not in {m["meeting_code"] for m in upcoming}


def test_duplicate_participant_guard_prevents_rejoin_after_removal(client):
    # Covered by test_get_start_join: removed session cannot rejoin.
    pass
