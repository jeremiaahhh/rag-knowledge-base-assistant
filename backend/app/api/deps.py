from __future__ import annotations

from fastapi import Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.repositories.document_repository import DocumentRepository
from app.services.document_service import DocumentService
from app.services.embedding_service import EmbeddingProvider, get_embedding_provider
from app.services.ingestion_service import IngestionService
from app.services.llm_service import ChatProvider, get_chat_provider
from app.services.rag_service import RAGService
from app.services.retrieval_service import VectorStore, get_vector_store


def get_document_repository(db: Session = Depends(get_db)) -> DocumentRepository:
    return DocumentRepository(db)


def get_embedder() -> EmbeddingProvider:
    return get_embedding_provider()


def get_vectors(
    embedder: EmbeddingProvider = Depends(get_embedder),
) -> VectorStore:
    return get_vector_store(embedder=embedder)


def get_chat() -> ChatProvider:
    return get_chat_provider()


def get_ingestion_service(
    documents: DocumentRepository = Depends(get_document_repository),
    vectors: VectorStore = Depends(get_vectors),
) -> IngestionService:
    return IngestionService(documents=documents, vector_store=vectors)


def get_document_service(
    documents: DocumentRepository = Depends(get_document_repository),
    ingestion: IngestionService = Depends(get_ingestion_service),
    vectors: VectorStore = Depends(get_vectors),
) -> DocumentService:
    return DocumentService(
        documents=documents,
        ingestion=ingestion,
        vector_store=vectors,
    )


def get_rag_service(
    vectors: VectorStore = Depends(get_vectors),
    chat_provider: ChatProvider = Depends(get_chat),
) -> RAGService:
    return RAGService(vector_store=vectors, chat_provider=chat_provider)
