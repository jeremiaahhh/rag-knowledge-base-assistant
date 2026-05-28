# Backend — FastAPI RAG service

Layered FastAPI app powering the RAG Knowledge Base Assistant. See the
[root README](../README.md) and [`docs/architecture.md`](../docs/architecture.md)
for the full picture.

## Local development

```bash
cp .env.example .env
python3.12 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

`http://localhost:8000/docs` opens the interactive OpenAPI explorer.

## Tests

```bash
pytest -q
```

Tests use SQLite and a tmp-dir Chroma store, so no Postgres or external API
keys are required.

## Folder layout

```
app/
  api/
    deps.py        → dependency wiring (services built here)
    routes/        → thin HTTP adapters
  core/            → config, logging, errors, request-id middleware
  db/              → engine + session
  models/          → SQLAlchemy ORM
  repositories/    → DB access
  schemas/         → Pydantic schemas
  services/        → business logic + LLM providers
  main.py          → FastAPI factory + lifespan
tests/             → pytest suite (30 tests)
```
