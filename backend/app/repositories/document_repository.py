from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.document import Document, DocumentStatus


class DocumentRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(
        self,
        *,
        filename: str,
        content_type: str,
        size_bytes: int,
        status: DocumentStatus = DocumentStatus.UPLOADED,
    ) -> Document:
        document = Document(
            filename=filename,
            content_type=content_type,
            size_bytes=size_bytes,
            status=status,
        )
        self.db.add(document)
        self.db.commit()
        self.db.refresh(document)
        return document

    def get(self, document_id: str) -> Document | None:
        return self.db.get(Document, document_id)

    def list(self) -> list[Document]:
        stmt = select(Document).order_by(Document.created_at.desc())
        return list(self.db.scalars(stmt))

    def list_all_ids(self) -> list[str]:
        stmt = select(Document.id)
        return list(self.db.scalars(stmt))

    def delete(self, document: Document) -> None:
        self.db.delete(document)
        self.db.commit()

    def delete_all(self) -> int:
        count = self.db.query(Document).count()
        self.db.query(Document).delete()
        self.db.commit()
        return count

    def update_status(
        self,
        document: Document,
        status: DocumentStatus,
        *,
        error_message: str | None = None,
    ) -> Document:
        document.status = status
        document.error_message = error_message
        self.db.commit()
        self.db.refresh(document)
        return document

    def set_chunk_count(self, document: Document, count: int) -> Document:
        document.chunk_count = count
        self.db.commit()
        self.db.refresh(document)
        return document
