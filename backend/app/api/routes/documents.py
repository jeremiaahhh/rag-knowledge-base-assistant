from __future__ import annotations

from fastapi import APIRouter, Depends, File, Response, UploadFile, status

from app.api.deps import get_document_service
from app.schemas.document import DocumentList, DocumentRead, ResetResponse
from app.services.document_service import DocumentService

router = APIRouter(prefix="/documents", tags=["documents"])


@router.post(
    "/upload",
    response_model=DocumentRead,
    status_code=status.HTTP_201_CREATED,
    summary="Upload and ingest a document",
)
def upload_document(
    file: UploadFile = File(...),
    service: DocumentService = Depends(get_document_service),
) -> DocumentRead:
    document = service.upload(file)
    return DocumentRead.model_validate(document)


@router.get("", response_model=DocumentList, summary="List indexed documents")
def list_documents(
    service: DocumentService = Depends(get_document_service),
) -> DocumentList:
    items = [DocumentRead.model_validate(d) for d in service.list()]
    return DocumentList(items=items, total=len(items))


@router.get(
    "/{document_id}",
    response_model=DocumentRead,
    summary="Fetch a single document by id",
)
def get_document(
    document_id: str,
    service: DocumentService = Depends(get_document_service),
) -> DocumentRead:
    return DocumentRead.model_validate(service.get(document_id))


@router.delete(
    "/{document_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a document and its embeddings",
)
def delete_document(
    document_id: str,
    service: DocumentService = Depends(get_document_service),
) -> Response:
    service.delete(document_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post(
    "/reset",
    response_model=ResetResponse,
    summary="Wipe all documents and embeddings",
)
def reset_knowledge_base(
    service: DocumentService = Depends(get_document_service),
) -> ResetResponse:
    deleted_documents, deleted_chunks = service.reset()
    return ResetResponse(
        deleted_documents=deleted_documents,
        deleted_chunks=deleted_chunks,
    )
