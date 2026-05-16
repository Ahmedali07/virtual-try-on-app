"""Replicate virtual try-on (OOTDiffusion) integration."""

from __future__ import annotations

import logging
from pathlib import Path

from services.ai.image_codec import to_jpeg_data_uri
from services.ai.replicate_client import (
    create_prediction,
    download_to_path,
    extract_output_image_url,
    wait_for_prediction,
)
from utils.config import Settings

logger = logging.getLogger(__name__)


def run_oot_diffusion_tryon(
    *,
    settings: Settings,
    user_image_path: Path,
    garment_image_url: str,
    output_path: Path,
) -> None:
    """
    Run viktorfa/oot_diffusion on Replicate.

    Inputs match the public model card: model_image, garment_image, steps, guidance_scale.
    """
    token = (settings.replicate_api_token or "").strip()
    if not token:
        raise ValueError("REPLICATE_API_TOKEN is required when TRYON_PROVIDER=replicate")

    version = (settings.replicate_model_version or "").strip()
    if not version:
        raise ValueError("REPLICATE_MODEL_VERSION is required when TRYON_PROVIDER=replicate")

    model_image = to_jpeg_data_uri(user_image_path)
    model_input = {
        "model_image": model_image,
        "garment_image": garment_image_url,
        "steps": settings.replicate_steps,
        "guidance_scale": settings.replicate_guidance_scale,
    }

    logger.info("Starting Replicate OOTDiffusion prediction")
    pred = create_prediction(
        token=token,
        version=version,
        model_input=model_input,
        timeout_s=120,
    )
    get_url = pred["urls"]["get"]
    final = wait_for_prediction(
        token=token,
        get_url=get_url,
        poll_interval_s=settings.replicate_poll_interval_s,
        max_wait_s=float(settings.replicate_max_wait_s),
    )
    out_url = extract_output_image_url(final)
    download_to_path(out_url, output_path, timeout=120)
    logger.info("Replicate prediction saved to %s", output_path)
