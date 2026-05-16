# AI Virtual Try-On — Backend (FastAPI)

Python API that pairs with the Next.js app in `../vtoa-fr`. It accepts user photos and a garment URL, runs the pluggable `VirtualTryOnService`, and returns a URL to a generated preview (served from `/static/results/`).

## Features

| Endpoint | Description |
| --- | --- |
| `GET /api/health` | Liveness probe; returns `{"status": "ok"}` |
| `POST /api/upload` | Multipart `file` — validates, stores under `storage/uploads/` |
| `POST /api/tryon` | Multipart `user_image` + form `clothing_image_url` — writes preview to `storage/results/` |

Static files are exposed at `/static/uploads/...` and `/static/results/...` so the browser can load `output_image_url` returned by `/api/tryon`.

## AI providers

Set `TRYON_PROVIDER` in `.env`:

| Provider | Behavior |
| --- | --- |
| **`replicate`** | Runs **[viktorfa/oot_diffusion](https://replicate.com/viktorfa/oot_diffusion)** on Replicate. Requires `REPLICATE_API_TOKEN`. User photo is sent as a JPEG **data URI**; garment uses the public `clothing_image_url`. Tuned via `REPLICATE_STEPS`, `REPLICATE_GUIDANCE_SCALE`, and polling env vars. |
| **`huggingface`** (default) | `POST`s **multipart** `HF_HUMAN_FIELD` + `HF_GARMENT_FIELD` to `HF_API_URL` with `Authorization: Bearer HF_API_TOKEN`. Use this for a **custom** Hugging Face Space, private gateway, or self-hosted endpoint that accepts two images. While `HF_API_URL` is still the placeholder hub path, the service **falls back** to an OpenCV side-by-side composite so the demo works without keys. |
| **`local`** | Reserved; composite fallback until you wire `LOCAL_MODEL_PATH`. |

Replicate failures return **502** with a message from the Replicate API. Hugging Face misconfiguration falls back to the composite (unless garment download fails).

## Setup

```bash
cd vota-be
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

## Run (development)

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Or use the helper scripts:

- `bash scripts/dev.sh`
- `powershell -File scripts/dev.ps1`

## Environment

See `.env.example`. Important variables:

- `CORS_ORIGINS` — comma-separated list; must include your Next.js origin (e.g. `http://localhost:3000`) when the browser calls FastAPI **directly**.
- `PUBLIC_BASE_URL` — optional; if set, absolute URLs in JSON use this instead of the incoming request host. When using the **Next.js `/vtoa-api` proxy** (default in `vtoa-fr`), set this to your Next origin plus `/vtoa-api`, e.g. `http://localhost:3000/vtoa-api`, so `output_image_url` is same-origin and Next `Image` can load previews without extra CORS.
- `TRYON_PROVIDER` — `huggingface` | `replicate` | `local`
- `HF_*` — custom multipart inference endpoint (see **AI providers** above).
- `REPLICATE_*` — OOTDiffusion integration (see **AI providers** above).

## Project layout

| Path | Role |
| --- | --- |
| `main.py` | FastAPI app factory, CORS, static mount |
| `api/routes.py` | HTTP handlers |
| `models/schemas.py` | Pydantic response models |
| `services/virtual_tryon.py` | Provider facade + composite fallback |
| `services/ai/` | Replicate client, HF multipart helper, image encoding |
| `utils/` | Config, image validation, URL safety |

## Notes for production

- Prefer `TRYON_PROVIDER=replicate` or a secured `HF_API_URL` gateway instead of the composite fallback for customer-facing traffic.
- Add authentication/rate limits before exposing on the public internet.
- Tighten `validate_clothing_image_url` if you need to block private IPs (SSRF hardening).
