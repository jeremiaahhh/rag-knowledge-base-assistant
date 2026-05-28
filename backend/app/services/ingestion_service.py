from __future__ import annotations

import io
from pathlib import Path

from app.core.config import Settings, get_settings
from app.core.errors import IngestionError
from app.core.logging import get_logger
from app.models.document import Document, DocumentStatus
from app.repositories.document_repository import DocumentRepository
from app.services.chunking_service import chunk_text
from app.services.retrieval_service import VectorStore

logger = get_logger(__name__)


SUPPORTED_EXTENSIONS = {".pdf", ".txt", ".md", ".markdown"}


class IngestionService:
    def __init__(
        self,
        documents: DocumentRepository,
        vector_store: VectorStore,
        settings: Settings | None = None,
    ) -> None:
        self.documents = documents
        self.vector_store = vector_store
        self.settings = settings or get_settings()

    def ingest(self, document: Document, file_bytes: bytes) -> Document:
        ext = Path(document.filename).suffix.lower()
        if ext not in SUPPORTED_EXTENSIONS:
            self.documents.update_status(
                document,
                DocumentStatus.FAILED,
                error_message=f"Unsupported file extension: {ext}",
            )
            raise IngestionError(f"Unsupported file extension: {ext}")

        try:
            self.documents.update_status(document, DocumentStatus.PROCESSING)
            text = self._extract_text(ext, file_bytes)
            if not text.strip():
                raise IngestionError("Document is empty after text extraction.")

            chunks = chunk_text(
                text,
                size=self.settings.chunk_size,
                overlap=self.settings.chunk_overlap,
            )
            if not chunks:
                raise IngestionError("Document produced no chunks.")

            added = self.vector_store.add_chunks(
                document_id=document.id,
                document_name=document.filename,
                chunks=[(c.index, c.text) for c in chunks],
            )
            self.documents.set_chunk_count(document, added)
            self.documents.update_status(document, DocumentStatus.READY)
            logger.info(
                "document_ingested",
                document_id=document.id,
                filename=document.filename,
                chunks=added,
            )
            return document
        except IngestionError as exc:
            self.documents.update_status(
                document, DocumentStatus.FAILED, error_message=str(exc)
            )
            raise
        except Exception as exc:
            logger.exception("ingestion_failed", document_id=document.id)
            self.documents.update_status(
                document, DocumentStatus.FAILED, error_message=str(exc)
            )
            raise IngestionError(f"Ingestion failed: {exc}") from exc

    @staticmethod
    def _extract_text(ext: str, data: bytes) -> str:
        if ext == ".pdf":
            from pypdf import PdfReader

            reader = PdfReader(io.BytesIO(data))
            pages = [page.extract_text() or "" for page in reader.pages]
            return "\n\n".join(pages)
        try:
            return data.decode("utf-8")
        except UnicodeDecodeError:
            return data.decode("latin-1", errors="ignore")
