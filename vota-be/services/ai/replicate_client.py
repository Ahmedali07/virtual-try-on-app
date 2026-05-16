"""Minimal Replicate HTTP client (predictions + polling)."""

from __future__ import annotations

import logging
import time
from typing import Any

import requests

logger = logging.getLogger(__name__)

REPLICATE_API_ROOT = "https://api.replicate.com/v1"


class ReplicateError(RuntimeError):
    """Raised when a Replicate prediction fails or times out."""


def _auth_headers(token: str) -> dict[str, str]:
    tok = token.strip()
    return {
        "Authorization": f"Token {tok}",
        "Content-Type": "application/json",
    }


def create_prediction(
    *,
    token: str,
    version: str,
    model_input: dict[str, Any],
    timeout_s: int = 120,
) -> dict[str, Any]:
    resp = requests.post(
        f"{REPLICATE_API_ROOT}/predictions",
        headers=_auth_headers(token),
        json={"version": version.strip(), "input": model_input},
        timeout=timeout_s,
    )
    if resp.status_code >= 400:
        raise ReplicateError(f"create prediction failed ({resp.status_code}): {resp.text[:800]}")
    return resp.json()


def wait_for_prediction(
    *,
    token: str,
    get_url: str,
    poll_interval_s: float = 2.0,
    max_wait_s: float = 600.0,
) -> dict[str, Any]:
    deadline = time.monotonic() + max_wait_s
    headers = _auth_headers(token)
    while time.monotonic() < deadline:
        resp = requests.get(get_url, headers=headers, timeout=120)
        if resp.status_code >= 400:
            raise ReplicateError(f"poll failed ({resp.status_code}): {resp.text[:800]}")
        data = resp.json()
        status = data.get("status")
        if status in {"starting", "processing"}:
            time.sleep(poll_interval_s)
            continue
        if status == "succeeded":
            return data
        if status in {"failed", "canceled"}:
            err = data.get("error") or data
            raise ReplicateError(f"prediction {status}: {err}")
        logger.debug("unknown replicate status %s: %s", status, data)
        time.sleep(poll_interval_s)
    raise ReplicateError("prediction timed out")


def extract_output_image_url(prediction: dict[str, Any]) -> str:
    out = prediction.get("output")
    if isinstance(out, str) and out.startswith("http"):
        return out
    if isinstance(out, list) and out and isinstance(out[0], str) and out[0].startswith("http"):
        return out[0]
    raise ReplicateError(f"unexpected output payload: {out!r}")


def download_to_path(url: str, dest: Path, *, timeout: int = 120) -> None:
    resp = requests.get(url, timeout=timeout)
    resp.raise_for_status()
    dest.write_bytes(resp.content)
