from __future__ import annotations

from app.core.config import get_settings
from app.services.embedding_service import MockEmbeddingProvider
from app.services.retrieval_service import VectorStore


def _store() -> VectorStore:
    return VectorStore(settings=get_settings(), embedder=MockEmbeddingProvider())


def test_add_and_search_returns_expected_chunks():
    store = _store()
    store.add_chunks(
        document_id="doc-1",
        document_name="pricing.md",
        chunks=[
            (0, "ACME offers three pricing tiers: Starter, Growth, Enterprise."),
            (1, "Starter is free for up to three users."),
            (2, "The on-call rotation is weekly and starts Monday at 10:00 UTC."),
        ],
    )

    results = store.similarity_search("ACME pricing tiers Starter Growth", top_k=2)
    assert results, "expected at least one result"
    assert results[0].document_name == "pricing.md"
    assert all(r.chunk_index in {0, 1} for r in results)


def test_delete_document_removes_only_that_documents_chunks():
    store = _store()
    store.add_chunks(
        document_id="a",
        document_name="a.md",
        chunks=[(0, "alpha alpha alpha"), (1, "beta beta beta")],
    )
    store.add_chunks(
        document_id="b",
        document_name="b.md",
        chunks=[(0, "gamma gamma gamma")],
    )

    removed = store.delete_document("a")
    assert removed == 2

    remaining = store.similarity_search("gamma", top_k=5)
    assert {r.document_id for r in remaining} == {"b"}


def test_reset_drops_everything():
    store = _store()
    store.add_chunks(
        document_id="a",
        document_name="a.md",
        chunks=[(0, "alpha")],
    )
    deleted = store.reset()
    assert deleted == 1
    assert store.similarity_search("alpha", top_k=5) == []


def test_scores_are_in_expected_range():
    store = _store()
    store.add_chunks(
        document_id="a",
        document_name="a.md",
        chunks=[(0, "vacation policy remote work benefits")],
    )
    results = store.similarity_search("remote work benefits", top_k=1)
    assert results
    assert 0.0 <= results[0].score <= 1.0
