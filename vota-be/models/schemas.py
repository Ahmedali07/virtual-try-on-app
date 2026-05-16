"""Pydantic schemas for API request/response bodies."""

from __future__ import annotations

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    """GET /api/health"""

    status: str = Field(..., examples=["ok"])


class UploadResponse(BaseModel):
    """POST /api/upload"""

    upload_id: str
    message: str = "uploaded"
    user_image_url: str | None = Field(
        default=None,
        description="URL to fetch the stored upload when static serving is enabled.",
    )


class TryOnResponse(BaseModel):
    """POST /api/tryon"""

    output_image_url: str
    request_id: str | None = None
