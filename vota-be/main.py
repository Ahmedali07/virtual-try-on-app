"""
FastAPI entrypoint for the Virtual Try-On demo API.

Run locally: `uvicorn main:app --reload --host 0.0.0.0 --port 8000`
(from the `vota-be` directory, with dependencies installed).
"""

from __future__ import annotations

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from api.routes import router
from utils.config import get_settings
from utils.storage import project_root

logging.basicConfig(level=logging.INFO)


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title="AI Virtual Try-On API",
        version="0.1.0",
        description="Demo backend for portrait + garment preview generation.",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(router, prefix="/api")

    storage = project_root() / "storage"
    storage.mkdir(parents=True, exist_ok=True)
    app.mount(
        "/static",
        StaticFiles(directory=str(storage)),
        name="static",
    )
    return app


app = create_app()
