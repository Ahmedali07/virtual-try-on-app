"""API route handlers."""

from __future__ import annotations

import io
import logging
import uuid
from pathlib import Path

import requests
from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    Request,
    UploadFile,
    status,
)

from models.schemas import HealthResponse, TryOnResponse, UploadResponse
from services.ai.replicate_client import ReplicateError
from services.virtual_tryon import VirtualTryOnService
from utils.config import Settings, get_settings
from utils.images import validate_image_stream
from utils.storage import assert_hex_id, new_job_id, results_dir, uploads_dir
from utils.urls import validate_clothing_image_url

logger = logging.getLogger(__name__)

router = APIRouter(tags=["api"])


def settings_dep() -> Settings:
    return get_settings()


def public_base(request: Request, settings: Settings) -> str:
    if settings.public_base_url.strip():
        return settings.public_base_url.strip().rstrip("/")
    return str(request.base_url).rstrip("/")


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok")


@router.post("/upload", response_model=UploadResponse)
async def upload_user_image(
    request: Request,
    file: UploadFile = File(..., description="User portrait image"),
    settings: Settings = Depends(settings_dep),
) -> UploadResponse:
    if file.content_type not in settings.allowed_image_mime:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="unsupported or missing image content type",
        )

    upload_id = new_job_id()
    buf = io.BytesIO(await file.read())
    buf.seek(0)
    try:
        img, fmt = validate_image_stream(buf, settings=settings)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    ext = ".jpg" if fmt == "jpeg" else f".{fmt}"
    assert_hex_id(upload_id)
    dest = uploads_dir(settings) / f"{upload_id}{ext}"
    pil_format = "JPEG" if fmt == "jpeg" else fmt.upper()
    try:
        if pil_format == "JPEG":
            img.convert("RGB").save(dest, format="JPEG", quality=90)
        else:
            img.save(dest, format=pil_format)
    except OSError as exc:
        logger.exception("failed to save upload")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="failed to persist upload",
        ) from exc

    base = public_base(request, settings)
    rel = f"/static/uploads/{dest.name}"
    return UploadResponse(
        upload_id=upload_id,
        user_image_url=f"{base}{rel}",
        message="uploaded",
    )


@router.post("/tryon", response_model=TryOnResponse)
async def try_on(
    request: Request,
    user_image: UploadFile = File(..., description="User portrait image"),
    clothing_image_url: str = Form(..., description="Public URL of garment image"),
    settings: Settings = Depends(settings_dep),
) -> TryOnResponse:
    if user_image.content_type not in settings.allowed_image_mime:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="unsupported or missing user_image content type",
        )

    try:
        validate_clothing_image_url(clothing_image_url)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    buf = io.BytesIO(await user_image.read())
    buf.seek(0)
    try:
        _, fmt = validate_image_stream(buf, settings=settings)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    buf.seek(0)
    job_id = new_job_id()
    assert_hex_id(job_id)
    ext = ".jpg" if fmt == "jpeg" else f".{fmt}"
    user_tmp = uploads_dir(settings) / f"tmp_{uuid.uuid4().hex}{ext}"
    user_tmp.write_bytes(buf.getvalue())

    out_path = results_dir(settings) / f"{job_id}_out.png"

    service = VirtualTryOnService(settings)
    try:
        service.generate_preview(
            user_image_path=user_tmp,
            clothing_image_url=clothing_image_url,
            output_path=out_path,
            request_id=job_id,
        )
    except requests.HTTPError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"failed to download clothing image: {exc}",
        ) from exc
    except requests.RequestException as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"clothing image request failed: {exc}",
        ) from exc
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except ReplicateError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        logger.exception("try-on failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="try-on generation failed",
        ) from exc
    finally:
        try:
            user_tmp.unlink(missing_ok=True)
        except OSError:
            pass

    base = public_base(request, settings)
    output_url = f"{base}/static/results/{out_path.name}"
    return TryOnResponse(output_image_url=output_url, request_id=job_id)

