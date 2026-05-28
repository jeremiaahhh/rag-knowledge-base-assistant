import io


SAMPLE_MD = (
    b"# ACME Engineering Runbook\n\n"
    b"On-call rotation is weekly. Engineers rotate on Mondays at 10:00 UTC. "
    b"Incidents above severity 2 page the secondary on-call after 15 minutes. "
    b"Deploys happen via the deploy pipeline on the main branch.\n"
)


def _upload(client, name="runbook.md", data=SAMPLE_MD, content_type="text/markdown"):
    return client.post(
        "/documents/upload",
        files={"file": (name, io.BytesIO(data), content_type)},
    )


def test_upload_then_list_then_delete(client):
    response = _upload(client)
    assert response.status_code == 201, response.text
    body = response.json()
    assert body["status"] == "ready"
    assert body["chunk_count"] >= 1
    document_id = body["id"]

    response = client.get("/documents")
    assert response.status_code == 200
    listing = response.json()
    assert listing["total"] == 1

    response = client.delete(f"/documents/{document_id}")
    assert response.status_code == 204

    response = client.get("/documents")
    assert response.json()["total"] == 0


def test_unsupported_extension_rejected(client):
    response = client.post(
        "/documents/upload",
        files={"file": ("image.png", io.BytesIO(b"x"), "image/png")},
    )
    assert response.status_code == 400


def test_reset_clears_everything(client):
    _upload(client, name="a.md")
    _upload(client, name="b.md")
    response = client.post("/documents/reset")
    assert response.status_code == 200
    body = response.json()
    assert body["deleted_documents"] == 2
    assert client.get("/documents").json()["total"] == 0
