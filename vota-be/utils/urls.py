"""URL validation for externally fetched garment images."""

from __future__ import annotations

from urllib.parse import urlparse


def validate_clothing_image_url(url: str) -> None:
    """
    Restrict clothing_image_url to public HTTP(S) endpoints.
    Blocks file:// and other schemes to reduce SSRF risk in demo deployments.
    """
    parsed = urlparse(url.strip())
    if parsed.scheme not in {"http", "https"}:
        raise ValueError("clothing_image_url must use http or https")
    if not parsed.netloc:
        raise ValueError("clothing_image_url must include a host")
