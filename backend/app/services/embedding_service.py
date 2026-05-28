from __future__ import annotations

import hashlib
import math
import re
from abc import ABC, abstractmethod
from typing import Sequence

from app.core.config import Settings, get_settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class EmbeddingProvider(ABC):
    name: str = "abstract"
    dim: int = 0

    @abstractmethod
    def embed(self, texts: Sequence[str]) -> list[list[float]]:
        ...


class MockEmbeddingProvider(EmbeddingProvider):
    """Deterministic hashed bag-of-words embedding. Each token maps to a
    fixed bucket; the resulting vector is L2-normalized so cosine similarity
    still ranks related text above unrelated text."""

    name = "mock"
    dim = 384

    _token_re = re.compile(r"[A-Za-z0-9]+")

    def embed(self, texts: Sequence[str]) -> list[list[float]]:
        return [self._embed_one(t) for t in texts]

    def _embed_one(self, text: str) -> list[float]:
        vector = [0.0] * self.dim
        tokens = self._token_re.findall(text.lower())
        if not tokens:
            return vector
        for token in tokens:
            digest = hashlib.sha1(token.encode("utf-8")).digest()
            bucket = int.from_bytes(digest[:4], "big") % self.dim
            sign = 1.0 if digest[4] & 1 else -1.0
            vector[bucket] += sign
        norm = math.sqrt(sum(v * v for v in vector))
        if norm == 0.0:
            return vector
        return [v / norm for v in vector]


class OpenAIEmbeddingProvider(EmbeddingProvider):
    name = "openai"

    def __init__(self, api_key: str, model: str) -> None:
        from openai import OpenAI

        self._client = OpenAI(api_key=api_key)
        self._model = model
        self.dim = 1536 if "small" in model else 3072

    def embed(self, texts: Sequence[str]) -> list[list[float]]:
        response = self._client.embeddings.create(model=self._model, input=list(texts))
        return [item.embedding for item in response.data]


def get_embedding_provider(settings: Settings | None = None) -> EmbeddingProvider:
    settings = settings or get_settings()
    if settings.use_mock_ai or not settings.openai_api_key:
        if not settings.use_mock_ai:
            logger.warning(
                "embedding_provider_fallback_to_mock",
                reason="OPENAI_API_KEY missing; falling back to MockEmbeddingProvider",
            )
        return MockEmbeddingProvider()
    return OpenAIEmbeddingProvider(
        api_key=settings.openai_api_key,
        model=settings.openai_embedding_model,
    )
