def test_health_ok_and_mock_mode_indicated(client):
    response = client.get("/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["mock_ai"] is True
    assert body["app"]
    assert body["version"]


def test_health_response_carries_request_id(client):
    response = client.get("/health")
    assert "x-request-id" in {k.lower() for k in response.headers}
