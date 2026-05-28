def test_chat_rejects_empty_question(client):
    response = client.post("/chat", json={"question": ""})
    assert response.status_code == 422
    body = response.json()
    assert body["error"]["code"] == "request_validation_error"


def test_chat_rejects_invalid_top_k(client):
    response = client.post("/chat", json={"question": "hi", "top_k": 0})
    assert response.status_code == 422


def test_get_unknown_document_returns_typed_404(client):
    response = client.get("/documents/does-not-exist")
    assert response.status_code == 404
    body = response.json()
    assert body["error"]["code"] == "not_found"
    assert "does-not-exist" in body["error"]["message"]


def test_delete_unknown_document_returns_404(client):
    response = client.delete("/documents/does-not-exist")
    assert response.status_code == 404


def test_empty_upload_rejected(client):
    import io

    response = client.post(
        "/documents/upload",
        files={"file": ("empty.md", io.BytesIO(b""), "text/markdown")},
    )
    assert response.status_code == 400
    body = response.json()
    assert body["error"]["code"] == "ingestion_error"
