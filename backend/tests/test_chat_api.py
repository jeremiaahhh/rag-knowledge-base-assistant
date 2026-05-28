import io


def test_chat_empty_kb_returns_helpful_message(client):
    response = client.post("/chat", json={"question": "Anything about pricing?"})
    assert response.status_code == 200
    body = response.json()
    assert body["used_mock"] is True
    assert body["citations"] == []
    assert body["confidence"] == 0.0
    assert "couldn't find" in body["answer"].lower()


def test_chat_returns_citations_after_upload(client):
    md = (
        b"# Pricing\n\n"
        b"ACME offers three pricing tiers: Starter, Growth, and Enterprise. "
        b"Starter is free for up to 3 users. Growth is $29 per user per month. "
        b"Enterprise pricing is custom and includes SSO and audit logs.\n"
    )
    upload = client.post(
        "/documents/upload",
        files={"file": ("pricing.md", io.BytesIO(md), "text/markdown")},
    )
    assert upload.status_code == 201

    response = client.post(
        "/chat",
        json={"question": "What are the pricing tiers?"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["citations"], "expected at least one citation"
    assert "pricing.md" in body["source_documents"]
    assert body["confidence"] > 0.0
    assert body["used_mock"] is True
