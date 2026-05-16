"""Image helpers for external AI APIs (resize, encode)."""

from __future__ import annotations

import base64
import io
from pathlib import Path

from PIL import Image, ImageOps


def read_image_rgb(path: Path) -> Image.Image:
    img = Image.open(path)
    return ImageOps.exif_transpose(img).convert("RGB")


def to_jpeg_data_uri(path: Path, *, max_side: int = 1536, quality: int = 88) -> str:
    """
    Encode a portrait as a JPEG data URI for providers that accept inline images
    (e.g. Replicate) while keeping payloads bounded.
    """
    img = read_image_rgb(path)
    img.thumbnail((max_side, max_side), Image.Resampling.LANCZOS)
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=quality, optimize=True)
    raw = base64.standard_b64encode(buf.getvalue()).decode("ascii")
    return f"data:image/jpeg;base64,{raw}"
