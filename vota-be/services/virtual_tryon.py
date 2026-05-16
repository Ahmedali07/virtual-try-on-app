"""
Virtual try-on service with pluggable providers.

- **replicate**: OOTDiffusion on Replicate (real diffusion try-on when `REPLICATE_API_TOKEN` is set).
- **huggingface**: Multipart POST to `HF_API_URL` with portrait + garment (for custom HF / self-hosted gateways).
- **local**: Reserved; falls back to placeholder composite until weights are wired.

If the selected provider cannot run, a deterministic OpenCV side-by-side composite is used
so local demos keep working without API keys.
"""

from __future__ import annotations

import logging
from enum import Enum
from pathlib import Path

import cv2
import numpy as np
import requests

from services.ai.huggingface_http import is_placeholder_hf_url, run_multipart_image_inference
from services.ai.replicate_tryon import run_oot_diffusion_tryon
from utils.config import Settings
from utils.urls import validate_clothing_image_url

logger = logging.getLogger(__name__)


class TryOnProvider(str, Enum):
    HUGGINGFACE = "huggingface"
    REPLICATE = "replicate"
    LOCAL = "local"


class VirtualTryOnService:
    """
    Facade over inference backends. Swap `TRYON_PROVIDER` via settings.
    """

    def __init__(self, settings: Settings) -> None:
        self._settings = settings

    def generate_preview(
        self,
        *,
        user_image_path: Path,
        clothing_image_url: str,
        output_path: Path,
        request_id: str | None = None,
    ) -> None:
        validate_clothing_image_url(clothing_image_url)

        try:
            provider = TryOnProvider(self._settings.tryon_provider.lower())
        except ValueError:
            provider = TryOnProvider.HUGGINGFACE

        if provider is TryOnProvider.REPLICATE:
            self._run_replicate(user_image_path, clothing_image_url, output_path)
        elif provider is TryOnProvider.HUGGINGFACE:
            self._run_huggingface(user_image_path, clothing_image_url, output_path)
        elif provider is TryOnProvider.LOCAL:
            self._run_local(user_image_path, clothing_image_url, output_path)

    def _run_huggingface(
        self,
        user_image_path: Path,
        clothing_image_url: str,
        output_path: Path,
    ) -> None:
        """
        Hugging Face–compatible inference: multipart user + garment images to `HF_API_URL`.

        Point `HF_API_URL` at any HTTP endpoint that accepts the configured field names
        (`HF_HUMAN_FIELD`, `HF_GARMENT_FIELD`) and returns an image body or JSON with a URL.

        The default hub template URL is skipped until you replace it with a real gateway.
        """
        token = (self._settings.hf_api_token or "").strip()
        url = self._settings.hf_api_url.strip()
        if token and url and not is_placeholder_hf_url(url):
            try:
                gresp = requests.get(clothing_image_url, timeout=60)
                gresp.raise_for_status()
                garment_bytes = gresp.content
            except requests.RequestException as exc:
                raise ValueError(f"could not download garment image: {exc}") from exc

            if run_multipart_image_inference(
                settings=self._settings,
                user_image_path=user_image_path,
                garment_image_bytes=garment_bytes,
                garment_filename="garment.jpg",
                output_path=output_path,
            ):
                logger.info("HF multipart inference produced preview")
                return

        logger.warning(
            "Hugging Face inference skipped or failed; using placeholder composite. "
            "Set HF_API_URL to your inference endpoint and HF_API_TOKEN."
        )
        self._placeholder_composite(user_image_path, clothing_image_url, output_path)

    def _run_replicate(
        self,
        user_image_path: Path,
        clothing_image_url: str,
        output_path: Path,
    ) -> None:
        """
        Replicate OOTDiffusion — requires `REPLICATE_API_TOKEN`.
        """
        run_oot_diffusion_tryon(
            settings=self._settings,
            user_image_path=user_image_path,
            garment_image_url=clothing_image_url,
            output_path=output_path,
        )

    def _run_local(
        self,
        user_image_path: Path,
        clothing_image_url: str,
        output_path: Path,
    ) -> None:
        """
        Self-hosted weights (not implemented in MVP).

        TODO: Load ONNX / PyTorch checkpoint from LOCAL_MODEL_PATH and run inference.
        """
        logger.warning("Local model provider not implemented; using placeholder composite.")
        self._placeholder_composite(user_image_path, clothing_image_url, output_path)

    def _placeholder_composite(
        self,
        user_image_path: Path,
        clothing_image_url: str,
        output_path: Path,
    ) -> None:
        """
        Demo-safe output: resized person + garment side-by-side using OpenCV.
        """
        user_arr = np.fromfile(user_image_path, dtype=np.uint8)
        user_img = cv2.imdecode(user_arr, cv2.IMREAD_COLOR)
        if user_img is None:
            raise ValueError("could not decode user image")

        resp = requests.get(clothing_image_url, timeout=60)
        resp.raise_for_status()
        garment_img = cv2.imdecode(
            np.frombuffer(resp.content, dtype=np.uint8),
            cv2.IMREAD_COLOR,
        )
        if garment_img is None:
            raise ValueError("could not decode clothing image from URL")

        target_h = 640
        user_img = _resize_height(user_img, target_h)
        garment_img = _resize_height(garment_img, target_h)

        if user_img.shape[0] != garment_img.shape[0]:
            h = min(user_img.shape[0], garment_img.shape[0])
            user_img = user_img[:h, :, :]
            garment_img = garment_img[:h, :, :]

        combined = cv2.hconcat([user_img, garment_img])
        ok = cv2.imwrite(str(output_path), combined)
        if not ok:
            raise RuntimeError("failed to write composite preview")


def _resize_height(img: np.ndarray, target_h: int) -> np.ndarray:
    h, w = img.shape[:2]
    if h == target_h:
        return img
    scale = target_h / float(h)
    new_w = max(1, int(w * scale))
    return cv2.resize(img, (new_w, target_h), interpolation=cv2.INTER_AREA)
