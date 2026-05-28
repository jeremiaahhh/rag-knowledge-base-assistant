from __future__ import annotations

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=2000)
    top_k: int | None = Field(default=None, ge=1, le=20)


class Citation(BaseModel):
    document_id: str
    document_name: str
    chunk_index: int
    text: str
    score: float


class ChatResponse(BaseModel):
    answer: str
    citations: list[Citation]
    source_documents: list[str]
    confidence: float = Field(..., ge=0.0, le=1.0)
    used_mock: bool
