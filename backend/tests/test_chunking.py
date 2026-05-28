from app.services.chunking_service import chunk_text


def test_chunk_empty_text():
    assert chunk_text("", size=100, overlap=10) == []


def test_chunk_short_text_returns_single_chunk():
    text = "word " * 10
    chunks = chunk_text(text, size=100, overlap=20)
    assert len(chunks) == 1
    assert chunks[0].index == 0


def test_chunks_have_overlap():
    text = " ".join(str(i) for i in range(300))
    chunks = chunk_text(text, size=50, overlap=10)
    assert len(chunks) > 1
    first_tail = chunks[0].text.split()[-10:]
    second_head = chunks[1].text.split()[:10]
    assert first_tail == second_head


def test_chunks_cover_entire_text():
    text = " ".join(str(i) for i in range(500))
    chunks = chunk_text(text, size=80, overlap=20)
    joined = " ".join(c.text for c in chunks)
    for token in ["0", "499", "250"]:
        assert token in joined


def test_chunks_indexed_sequentially():
    text = " ".join(str(i) for i in range(200))
    chunks = chunk_text(text, size=40, overlap=5)
    assert [c.index for c in chunks] == list(range(len(chunks)))
