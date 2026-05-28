from __future__ import annotations

from statistics import fmean

from app.core.config import Settings, get_settings
from app.core.logging import get_logger
from app.schemas.chat import ChatRequest, ChatResponse, Citation
from app.services.llm_service import ChatContext, ChatProvider
from app.services.retrieval_service import VectorStore

logger = get_logger(__name__)


class RAGService:
    def __init__(
        self,
        vector_store: VectorStore,
        chat_provider: ChatProvider,
        settings: Settings | None = None,
    ) -> None:
        self.vector_store = vector_store
        self.chat_provider = chat_provider
        self.settings = settings or get_settings()

    def answer(self, request: ChatRequest) -> ChatResponse:
        top_k = request.top_k or self.settings.top_k
        retrieved = self.vector_store.similarity_search(request.question, top_k=top_k)

        citations = [
            Citation(
                document_id=chunk.document_id,
                document_name=chunk.document_name,
                chunk_index=chunk.chunk_index,
                text=chunk.text,
                score=round(chunk.score, 4),
            )
            for chunk in retrieved
        ]

        source_documents = sorted({c.document_name for c in citations if c.document_name})

        answer_text = self.chat_provider.answer(
            ChatContext(
                question=request.question,
                passages=[c.text for c in citations],
            )
        )

        confidence = float(fmean([c.score for c in citations])) if citations else 0.0
        confidence = max(0.0, min(1.0, confidence))

        logger.info(
            "chat_answered",
            top_k=top_k,
            retrieved=len(citations),
            confidence=round(confidence, 3),
            mock=self.chat_provider.is_mock,
        )

        return ChatResponse(
            answer=answer_text,
            citations=citations,
            source_documents=source_documents,
            confidence=confidence,
            used_mock=self.chat_provider.is_mock,
        )
