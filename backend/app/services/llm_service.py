from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass

from app.core.config import Settings, get_settings
from app.core.logging import get_logger

logger = get_logger(__name__)


@dataclass
class ChatContext:
    question: str
    passages: list[str]


class ChatProvider(ABC):
    name: str = "abstract"
    is_mock: bool = False

    @abstractmethod
    def answer(self, context: ChatContext) -> str:
        ...


SYSTEM_PROMPT = (
    "You are a careful enterprise knowledge assistant. Answer the user's "
    "question using ONLY the provided source passages. If the passages do not "
    "contain the answer, say so honestly. Cite specific facts when you can. "
    "Keep answers concise (2-5 sentences)."
)


def build_user_prompt(context: ChatContext) -> str:
    blocks = []
    for i, passage in enumerate(context.passages, start=1):
        blocks.append(f"[Source {i}]\n{passage}")
    sources_block = "\n\n".join(blocks) if blocks else "(no sources retrieved)"
    return (
        f"Sources:\n{sources_block}\n\n"
        f"Question: {context.question}\n\n"
        "Answer using the sources above. Reference sources inline like [1], [2] where helpful."
    )


class MockChatProvider(ChatProvider):
    """Extractive provider that stitches the leading sentence of each
    retrieved passage and tags inline citations. Used when no OPENAI_API_KEY
    is configured."""

    name = "mock"
    is_mock = True

    def answer(self, context: ChatContext) -> str:
        if not context.passages:
            return (
                "I couldn't find anything in your knowledge base about that. "
                "Try uploading more documents or rephrasing the question."
            )

        snippets: list[str] = []
        for i, passage in enumerate(context.passages, start=1):
            first_sentence = self._leading_sentence(passage)
            snippets.append(f"{first_sentence} [{i}]")

        joined = " ".join(snippets)
        return (
            "Based on the documents you uploaded:\n\n"
            f"{joined}\n\n"
            "_This response was generated in mock mode. Set `USE_MOCK_AI=false` "
            "and provide an `OPENAI_API_KEY` for real model-generated answers._"
        )

    @staticmethod
    def _leading_sentence(passage: str, max_chars: int = 220) -> str:
        text = passage.strip().replace("\n", " ")
        for sep in [". ", "? ", "! "]:
            if sep in text:
                head = text.split(sep, 1)[0] + sep.strip()
                if len(head) <= max_chars:
                    return head
        return text[:max_chars] + ("…" if len(text) > max_chars else "")


class OpenAIChatProvider(ChatProvider):
    name = "openai"
    is_mock = False

    def __init__(self, api_key: str, model: str) -> None:
        from openai import OpenAI

        self._client = OpenAI(api_key=api_key)
        self._model = model

    def answer(self, context: ChatContext) -> str:
        response = self._client.chat.completions.create(
            model=self._model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": build_user_prompt(context)},
            ],
            temperature=0.2,
        )
        return response.choices[0].message.content or ""


def get_chat_provider(settings: Settings | None = None) -> ChatProvider:
    settings = settings or get_settings()
    if settings.use_mock_ai or not settings.openai_api_key:
        if not settings.use_mock_ai:
            logger.warning(
                "chat_provider_fallback_to_mock",
                reason="OPENAI_API_KEY missing; falling back to MockChatProvider",
            )
        return MockChatProvider()
    return OpenAIChatProvider(
        api_key=settings.openai_api_key,
        model=settings.openai_chat_model,
    )
