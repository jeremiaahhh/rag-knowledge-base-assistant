from __future__ import annotations

import os
from pathlib import Path

import pytest


@pytest.fixture(autouse=True)
def _isolated_env(tmp_path: Path, monkeypatch: pytest.MonkeyPatch):
    db_path = tmp_path / "test.db"
    chroma_dir = tmp_path / "chroma"
    upload_dir = tmp_path / "uploads"
    chroma_dir.mkdir()
    upload_dir.mkdir()

    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{db_path}")
    monkeypatch.setenv("CHROMA_PERSIST_DIR", str(chroma_dir))
    monkeypatch.setenv("UPLOAD_DIR", str(upload_dir))
    monkeypatch.setenv("USE_MOCK_AI", "true")
    monkeypatch.setenv("CHUNK_SIZE", "60")
    monkeypatch.setenv("CHUNK_OVERLAP", "10")
    monkeypatch.setenv("CHROMA_COLLECTION", f"test_collection_{os.getpid()}_{db_path.stem}")

    from app.core import config as config_module

    config_module.get_settings.cache_clear()

    import importlib

    from app.db import session as session_module

    importlib.reload(session_module)

    from app.services import retrieval_service

    retrieval_service.VectorStore._client = None

    yield

    config_module.get_settings.cache_clear()
    retrieval_service.VectorStore._client = None


@pytest.fixture
def client():
    from fastapi.testclient import TestClient

    from app.main import create_app

    app = create_app()
    with TestClient(app) as c:
        yield c
