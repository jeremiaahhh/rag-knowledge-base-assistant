from __future__ import annotations

from fastapi import APIRouter, Depends

from app.api.deps import get_rag_service
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.rag_service import RAGService

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post(
    "",
    response_model=ChatResponse,
    summary="Answer a question over the indexed knowledge base",
)
def chat(
    request: ChatRequest,
    rag: RAGService = Depends(get_rag_service),
) -> ChatResponse:
    return rag.answer(request)
