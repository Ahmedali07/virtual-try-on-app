"""Filesystem helpers for temporary uploads and generated previews."""

from __future__ import annotations

import uuid
from pathlib import Path

from utils.config import Settings


def project_root() -> Path:
    return Path(__file__).resolve().parent.parent


def uploads_dir(settings: Settings) -> Path:
    _ = settings
    p = project_root() / "storage" / "uploads"
    p.mkdir(parents=True, exist_ok=True)
    return p


def results_dir(settings: Settings) -> Path:
    _ = settings
    p = project_root() / "storage" / "results"
    p.mkdir(parents=True, exist_ok=True)
    return p


def new_job_id() -> str:
    """32-char hex id suitable for public filenames."""
    return uuid.uuid4().hex


def assert_hex_id(value: str) -> None:
    if len(value) != 32 or not value.isalnum():
        raise ValueError("invalid id")
