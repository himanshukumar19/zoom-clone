"""T-001: health route accepts HEAD."""


def test_health_get_and_head_return_200(client):
    assert client.get("/api/health").status_code == 200
    assert client.head("/api/health").status_code == 200
