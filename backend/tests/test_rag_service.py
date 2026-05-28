from __future__ import annotations

from dataclasses import dataclass

from app.schemas.chat import ChatRequest
from app.services.llm_service import ChatContext, ChatProvider
from app.services.rag_service import RAGService
from app.services.retrieval_service import RetrievedChunk


class _StubVectorStore:
    def __init__(self, chunks):
        self._chunks = chunks
        self.calls = []

    def similarity_search(self, query, *, top_k):
        self.calls.append((query, top_k))
        return self._chunks[:top_k]


@dataclass
class _StubChatProvider(ChatProvider):
    name: str = "stub"
    is_mock: bool = True
    captured: ChatContext | None = None

    def answer(self, context: ChatContext) -> str:
        self.captured = context
        return f"ANSWER({len(context.passages)})"


def _chunk(idx: int, score: float, doc: str = "doc.md") -> RetrievedChunk:
    return RetrievedChunk(
        document_id="doc-1",
        document_name=doc,
        chunk_index=idx,
        text=f"passage {idx}",
        score=score,
    )


def test_answer_returns_citations_in_input_order():
    store = _StubVectorStore([_chunk(0, 0.9), _chunk(1, 0.7)])
    rag = RAGService(vector_store=store, chat_provider=_StubChatProvider())

    response = rag.answer(ChatRequest(question="anything", top_k=2))

    assert [c.chunk_index for c in response.citations] == [0, 1]
    assert response.source_documents == ["doc.md"]


def test_answer_confidence_is_mean_of_scores():
    store = _StubVectorStore([_chunk(0, 1.0), _chunk(1, 0.5)])
    rag = RAGService(vector_store=store, chat_provider=_StubChatProvider())

    response = rag.answer(ChatRequest(question="anything", top_k=2))

    assert response.confidence == 0.75


def test_answer_handles_no_results():
    store = _StubVectorStore([])
    rag = RAGService(vector_store=store, chat_provider=_StubChatProvider())

    response = rag.answer(ChatRequest(question="anything"))

    assert response.citations == []
    assert response.source_documents == []
    assert response.confidence == 0.0


def test_answer_passes_passages_to_chat_provider():
    store = _StubVectorStore([_chunk(0, 0.9), _chunk(1, 0.8)])
    provider = _StubChatProvider()
    rag = RAGService(vector_store=store, chat_provider=provider)

    rag.answer(ChatRequest(question="why?"))

    assert provider.captured is not None
    assert provider.captured.question == "why?"
    assert provider.captured.passages == ["passage 0", "passage 1"]


def test_answer_dedupes_source_documents():
    store = _StubVectorStore(
        [_chunk(0, 0.9, "a.md"), _chunk(1, 0.8, "a.md"), _chunk(2, 0.7, "b.md")]
    )
    rag = RAGService(vector_store=store, chat_provider=_StubChatProvider())

    response = rag.answer(ChatRequest(question="?", top_k=3))

    assert response.source_documents == ["a.md", "b.md"]


def test_answer_marks_mock_flag_from_provider():
    store = _StubVectorStore([_chunk(0, 0.5)])
    rag = RAGService(vector_store=store, chat_provider=_StubChatProvider(is_mock=False))
    response = rag.answer(ChatRequest(question="?"))
    assert response.used_mock is False
