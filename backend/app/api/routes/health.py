from __future__ import annotations

from fastapi import APIRouter, Depends

from app.core.config import Settings, get_settings
from app.schemas.health import HealthResponse

router = APIRouter(prefix="/health", tags=["health"])


@router.get(
    "",
    response_model=HealthResponse,
    summary="Liveness probe + runtime mode indicator",
)
def healthcheck(settings: Settings = Depends(get_settings)) -> HealthResponse:
    mock_mode = settings.use_mock_ai or not settings.openai_api_key
    return HealthResponse(
        status="ok",
        app=settings.app_name,
        env=settings.app_env,
        version=settings.app_version,
        mock_ai=mock_mode,
    )
