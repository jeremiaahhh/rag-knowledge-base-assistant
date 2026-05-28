import math

from app.services.embedding_service import MockEmbeddingProvider


def cosine(a, b):
    dot = sum(x * y for x, y in zip(a, b))
    na = math.sqrt(sum(x * x for x in a))
    nb = math.sqrt(sum(y * y for y in b))
    if na == 0 or nb == 0:
        return 0.0
    return dot / (na * nb)


def test_embeddings_have_fixed_dimensionality():
    p = MockEmbeddingProvider()
    vecs = p.embed(["hello world", "another text"])
    assert all(len(v) == p.dim for v in vecs)


def test_embeddings_are_deterministic():
    p = MockEmbeddingProvider()
    a = p.embed(["the quick brown fox"])[0]
    b = p.embed(["the quick brown fox"])[0]
    assert a == b


def test_similar_texts_have_higher_similarity_than_unrelated():
    p = MockEmbeddingProvider()
    base, similar, unrelated = p.embed(
        [
            "the company offers paid vacation and remote work benefits",
            "we provide vacation time and remote-friendly policies",
            "kubernetes deployment manifests for production clusters",
        ]
    )
    assert cosine(base, similar) > cosine(base, unrelated)
