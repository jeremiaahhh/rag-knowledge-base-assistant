from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class Chunk:
    index: int
    text: str


def chunk_text(text: str, *, size: int, overlap: int) -> list[Chunk]:
    if size <= 0:
        raise ValueError("chunk size must be > 0")
    if overlap < 0 or overlap >= size:
        raise ValueError("overlap must be in [0, size)")

    cleaned = " ".join(text.split())
    if not cleaned:
        return []

    words = cleaned.split(" ")
    if len(words) <= size:
        return [Chunk(index=0, text=cleaned)]

    step = size - overlap
    chunks: list[Chunk] = []
    start = 0
    index = 0
    while start < len(words):
        window = words[start : start + size]
        if not window:
            break
        chunks.append(Chunk(index=index, text=" ".join(window)))
        index += 1
        if start + size >= len(words):
            break
        start += step
    return chunks
