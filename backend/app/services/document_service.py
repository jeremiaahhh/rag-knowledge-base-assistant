from __future__ import annotations

from pathlib import Path

from fastapi import UploadFile

from app.core.config import Settings, get_settings
from app.core.errors import IngestionError, NotFoundError
from app.core.logging import get_logger
from app.models.document import Document
from app.repositories.document_repository import DocumentRepository
from app.services.ingestion_service import SUPPORTED_EXTENSIONS, IngestionService
from app.services.retrieval_service import VectorStore

logger = get_logger(__name__)


class DocumentService:
    def __init__(
        self,
        documents: DocumentRepository,
        ingestion: IngestionService,
        vector_store: VectorStore,
        settings: Settings | None = None,
    ) -> None:
        self.documents = documents
        self.ingestion = ingestion
        self.vector_store = vector_store
        self.settings = settings or get_settings()

    def list(self) -> list[Document]:
        return self.documents.list()

    def get(self, document_id: str) -> Document:
        document = self.documents.get(document_id)
        if not document:
            raise NotFoundError(f"Document {document_id} not found.")
        return document

    def upload(self, file: UploadFile) -> Document:
        filename = file.filename or "untitled"
        ext = Path(filename).suffix.lower()
        if ext not in SUPPORTED_EXTENSIONS:
            raise IngestionError(
                f"Unsupported file type '{ext}'. "
                f"Accepted: {', '.join(sorted(SUPPORTED_EXTENSIONS))}."
            )

        data = file.file.read()
        if not data:
            raise IngestionError("Uploaded file is empty.")
        if len(data) > self.settings.max_upload_bytes:
            raise IngestionError(
                f"File exceeds maximum size of {self.settings.max_upload_mb} MB."
            )

        document = self.documents.create(
            filename=filename,
            content_type=file.content_type or "application/octet-stream",
            size_bytes=len(data),
        )

        upload_dir = Path(self.settings.upload_dir)
        upload_dir.mkdir(parents=True, exist_ok=True)
        target = upload_dir / f"{document.id}{ext}"
        target.write_bytes(data)

        self.ingestion.ingest(document, data)
        return document

    def delete(self, document_id: str) -> None:
        document = self.get(document_id)
        self.vector_store.delete_document(document.id)
        try:
            for path in Path(self.settings.upload_dir).glob(f"{document.id}.*"):
                path.unlink(missing_ok=True)
        except OSError as exc:
            logger.warning("upload_cleanup_failed", document_id=document.id, error=str(exc))
        self.documents.delete(document)

    def reset(self) -> tuple[int, int]:
        deleted_chunks = self.vector_store.reset()
        try:
            for path in Path(self.settings.upload_dir).glob("*"):
                if path.is_file() and path.name != ".gitkeep":
                    path.unlink(missing_ok=True)
        except OSError as exc:
            logger.warning("upload_reset_cleanup_failed", error=str(exc))
        deleted_documents = self.documents.delete_all()
        return deleted_documents, deleted_chunks
