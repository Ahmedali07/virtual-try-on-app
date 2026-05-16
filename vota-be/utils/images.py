"""Image validation using Pillow."""

from __future__ import annotations

import io
from typing import BinaryIO

from PIL import Image, UnidentifiedImageError

from utils.config import Settings


def validate_image_stream(
    stream: BinaryIO,
    *,
    settings: Settings,
    max_bytes: int | None = None,
) -> tuple[Image.Image, str]:
    """
    Read stream into memory (bounded), open with Pillow, verify format.
    Returns (image, format_lower) e.g. ("jpeg",).
    """
    limit = max_bytes if max_bytes is not None else settings.max_upload_bytes
    data = stream.read(limit + 1)
    if len(data) > limit:
        raise ValueError(f"file exceeds max size of {limit} bytes")
    if len(data) == 0:
        raise ValueError("empty file")

    try:
        img = Image.open(io.BytesIO(data))
        img.load()
    except UnidentifiedImageError as e:
        raise ValueError("unrecognized image format") from e

    fmt = (img.format or "").lower()
    if fmt not in {"jpeg", "png", "webp"}:
        raise ValueError(f"unsupported image format: {fmt}")

    mime = {
        "jpeg": "image/jpeg",
        "png": "image/png",
        "webp": "image/webp",
    }[fmt]
    if mime not in settings.allowed_image_mime:
        raise ValueError("image type not allowed")

    return img, fmt
