from __future__ import annotations

import threading
from dataclasses import dataclass
from typing import Iterable

import chromadb
from chromadb.config import Settings as ChromaSettings

from app.core.config import Settings, get_settings
from app.core.logging import get_logger
from app.services.embedding_service import EmbeddingProvider

logger = get_logger(__name__)


@dataclass
class RetrievedChunk:
    document_id: str
    document_name: str
    chunk_index: int
    text: str
    score: float


class VectorStore:
    _client_lock = threading.Lock()
    _client: chromadb.api.ClientAPI | None = None

    def __init__(self, settings: Settings, embedder: EmbeddingProvider) -> None:
        self.settings = settings
        self.embedder = embedder
        self.collection = self._get_collection()

    @classmethod
    def _get_client(cls, persist_dir: str) -> chromadb.api.ClientAPI:
        with cls._client_lock:
            if cls._client is None:
                cls._client = chromadb.PersistentClient(
                    path=persist_dir,
                    settings=ChromaSettings(anonymized_telemetry=False, allow_reset=True),
                )
            return cls._client

    def _get_collection(self):
        client = self._get_client(self.settings.chroma_persist_dir)
        return client.get_or_create_collection(
            name=self.settings.chroma_collection,
            metadata={"hnsw:space": "cosine"},
        )

    def add_chunks(
        self,
        *,
        document_id: str,
        document_name: str,
        chunks: Iterable[tuple[int, str]],
    ) -> int:
        ids: list[str] = []
        documents: list[str] = []
        metadatas: list[dict] = []

        for index, text in chunks:
            ids.append(f"{document_id}:{index}")
            documents.append(text)
            metadatas.append(
                {
                    "document_id": document_id,
                    "document_name": document_name,
                    "chunk_index": index,
                }
            )

        if not ids:
            return 0

        embeddings = self.embedder.embed(documents)
        self.collection.add(
            ids=ids, documents=documents, metadatas=metadatas, embeddings=embeddings
        )
        return len(ids)

    def delete_document(self, document_id: str) -> int:
        existing = self.collection.get(where={"document_id": document_id})
        count = len(existing.get("ids", []) or [])
        if count:
            self.collection.delete(where={"document_id": document_id})
        return count

    def reset(self) -> int:
        existing = self.collection.get()
        count = len(existing.get("ids", []) or [])
        if count:
            client = self._get_client(self.settings.chroma_persist_dir)
            client.delete_collection(self.settings.chroma_collection)
            self.collection = client.get_or_create_collection(
                name=self.settings.chroma_collection,
                metadata={"hnsw:space": "cosine"},
            )
        return count

    def similarity_search(self, query: str, *, top_k: int) -> list[RetrievedChunk]:
        embedding = self.embedder.embed([query])[0]
        result = self.collection.query(
            query_embeddings=[embedding],
            n_results=top_k,
            include=["documents", "metadatas", "distances"],
        )

        chunks: list[RetrievedChunk] = []
        ids_lists = result.get("ids") or [[]]
        doc_lists = result.get("documents") or [[]]
        meta_lists = result.get("metadatas") or [[]]
        dist_lists = result.get("distances") or [[]]

        for _id, text, meta, distance in zip(
            ids_lists[0], doc_lists[0], meta_lists[0], dist_lists[0]
        ):
            score = max(0.0, 1.0 - float(distance))
            chunks.append(
                RetrievedChunk(
                    document_id=str(meta.get("document_id", "")),
                    document_name=str(meta.get("document_name", "")),
                    chunk_index=int(meta.get("chunk_index", 0)),
                    text=text,
                    score=score,
                )
            )
        return chunks


def get_vector_store(
    settings: Settings | None = None,
    embedder: EmbeddingProvider | None = None,
) -> VectorStore:
    from app.services.embedding_service import get_embedding_provider

    settings = settings or get_settings()
    embedder = embedder or get_embedding_provider(settings)
    return VectorStore(settings=settings, embedder=embedder)
