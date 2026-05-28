from __future__ import annotations

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import chat, documents, health
from app.core.config import get_settings
from app.core.errors import register_exception_handlers
from app.core.logging import configure_logging, get_logger
from app.core.middleware import RequestContextMiddleware
from app.db.session import init_db


def create_app() -> FastAPI:
    settings = get_settings()
    configure_logging(level=settings.log_level, env=settings.app_env)
    logger = get_logger("app.lifecycle")

    @asynccontextmanager
    async def lifespan(_: FastAPI):
        Path(settings.upload_dir).mkdir(parents=True, exist_ok=True)
        Path(settings.chroma_persist_dir).mkdir(parents=True, exist_ok=True)
        init_db()
        logger.info(
            "app_started",
            app=settings.app_name,
            version=settings.app_version,
            env=settings.app_env,
            mock_ai=settings.use_mock_ai,
        )
        yield
        logger.info("app_stopped")

    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description=(
            "Retrieval-Augmented Generation assistant. Upload documents, ask "
            "questions, get answers with source citations. Includes a "
            "mock-Mode so the stack runs end-to-end without API keys."
        ),
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    app.add_middleware(RequestContextMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["X-Request-ID"],
    )

    register_exception_handlers(app)

    app.include_router(health.router)
    app.include_router(documents.router)
    app.include_router(chat.router)

    return app


app = create_app()
