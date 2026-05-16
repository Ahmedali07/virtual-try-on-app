"""Hugging Face–compatible HTTP inference (multipart images)."""

from __future__ import annotations

import io
import logging
from pathlib import Path
from typing import Any

import requests

from services.ai.image_codec import read_image_rgb
from utils.config import Settings

logger = logging.getLogger(__name__)


def is_placeholder_hf_url(url: str) -> bool:
    return "your-org/your-vton-model" in url


def run_multipart_image_inference(
    *,
    settings: Settings,
    user_image_path: Path,
    garment_image_bytes: bytes,
    garment_filename: str,
    output_path: Path,
) -> bool:
    """
    POST user + garment images as multipart form data to HF_API_URL.

    Intended for self-hosted or community gateways that accept two image files.
    Field names are configurable via HF_HUMAN_FIELD / HF_GARMENT_FIELD.
    Returns True if an image was written to output_path.
    """
    token = (settings.hf_api_token or "").strip()
    url = settings.hf_api_url.strip()
    if not token or is_placeholder_hf_url(url):
        return False

    user_rgb = read_image_rgb(user_image_path)
    ubuf = io.BytesIO()
    user_rgb.save(ubuf, format="JPEG", quality=90, optimize=True)
    user_bytes = ubuf.getvalue()

    headers = {"Authorization": f"Bearer {token}"}
    files = {
        settings.hf_human_field: ("human.jpg", user_bytes, "image/jpeg"),
        settings.hf_garment_field: (garment_filename, garment_image_bytes, "image/jpeg"),
    }

    try:
        resp = requests.post(url, headers=headers, files=files, timeout=180)
    except requests.RequestException as exc:
        logger.warning("HF multipart request failed: %s", exc)
        return False

    if resp.status_code != 200:
        logger.warning(
            "HF multipart returned %s: %s",
            resp.status_code,
            resp.text[:500],
        )
        return False

    ctype = resp.headers.get("content-type", "")
    if "image" in ctype:
        output_path.write_bytes(resp.content)
        return True

    # Try JSON with common shapes
    try:
        data: dict[str, Any] = resp.json()
    except ValueError:
        logger.warning("HF multipart returned non-image, non-json body")
        return False

    for key in ("image", "output", "result", "url", "image_url"):
        val = data.get(key)
        if isinstance(val, str) and val.startswith("http"):
            r2 = requests.get(val, timeout=120)
            r2.raise_for_status()
            output_path.write_bytes(r2.content)
            return True

    logger.warning("HF multipart JSON did not contain a usable image reference: %s", data)
    return False
