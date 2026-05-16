"""Application configuration (environment-driven)."""

from __future__ import annotations

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", ".env.local"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    host: str = Field(default="0.0.0.0", validation_alias="HOST")
    port: int = Field(default=8000, validation_alias="PORT")

    public_base_url: str = Field(default="", validation_alias="PUBLIC_BASE_URL")

    cors_origins: str = Field(
        default="http://localhost:3000,http://127.0.0.1:3000",
        validation_alias="CORS_ORIGINS",
    )

    tryon_provider: str = Field(default="huggingface", validation_alias="TRYON_PROVIDER")

    hf_api_url: str = Field(
        default="https://api-inference.huggingface.co/models/your-org/your-vton-model",
        validation_alias="HF_API_URL",
    )
    hf_api_token: str = Field(default="", validation_alias="HF_API_TOKEN")
    hf_human_field: str = Field(
        default="human_image",
        validation_alias="HF_HUMAN_FIELD",
        description="Multipart form field name for the user portrait (custom HF gateways).",
    )
    hf_garment_field: str = Field(
        default="garment_image",
        validation_alias="HF_GARMENT_FIELD",
        description="Multipart form field name for the garment image bytes.",
    )

    replicate_api_token: str = Field(default="", validation_alias="REPLICATE_API_TOKEN")
    replicate_model_version: str = Field(
        default="27c1edcff8d2ab01893c78e59118b9392da5542c93aef99e8c583910f1d55e1f",
        validation_alias="REPLICATE_MODEL_VERSION",
        description="Replicate model version id (64-char digest) for viktorfa/oot_diffusion.",
    )
    replicate_steps: int = Field(default=20, ge=1, le=40, validation_alias="REPLICATE_STEPS")
    replicate_guidance_scale: float = Field(
        default=2.0,
        ge=1.0,
        le=5.0,
        validation_alias="REPLICATE_GUIDANCE_SCALE",
    )
    replicate_poll_interval_s: float = Field(
        default=2.0,
        ge=0.5,
        le=30.0,
        validation_alias="REPLICATE_POLL_INTERVAL_S",
    )
    replicate_max_wait_s: float = Field(
        default=600.0,
        ge=30.0,
        le=3600.0,
        validation_alias="REPLICATE_MAX_WAIT_S",
    )

    local_model_path: str = Field(default="", validation_alias="LOCAL_MODEL_PATH")

    max_upload_bytes: int = Field(default=8 * 1024 * 1024, validation_alias="MAX_UPLOAD_BYTES")
    allowed_image_mime: frozenset[str] = frozenset(
        {"image/jpeg", "image/png", "image/webp"}
    )

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
