# AI Virtual Try-On — Frontend (Next.js 15)

Demo-first Next.js application for the AI Virtual Try-On product. This package intentionally keeps **UI**, **state**, and **HTTP orchestration** separate so the same building blocks can be embedded in a Shopify theme extension or app surface later.

## Stack

- Next.js 15 (App Router) + React 19
- TypeScript + Tailwind CSS v4
- Shadcn UI (Base UI primitives)
- Zustand for session state
- Native `<input type="file">` uploads (no UploadThing keys required for the MVP)

## Getting started

```bash
cd vtoa-fr
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the landing page and [http://localhost:3000/try-on](http://localhost:3000/try-on) for the studio.

## Environment

Copy the example file:

```bash
cp .env.example .env.local
```

### Connecting to FastAPI (two modes)

**Default (recommended for local dev):** leave `NEXT_PUBLIC_API_BASE_URL` unset. The browser calls **`/vtoa-api/...`** on the Next server; `next.config.ts` **rewrites** those requests to FastAPI (`VTOA_BACKEND_ORIGIN`, default `http://127.0.0.1:8000`). Avoids browser CORS issues. For preview images to load through the same host, set **`PUBLIC_BASE_URL=http://localhost:3000/vtoa-api`** (or `127.0.0.1:3000`) in the backend `.env` so `output_image_url` is same-origin.

**Direct API:** set `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000` (no trailing slash). The FastAPI app must allow your Next origin in `CORS_ORIGINS`.

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Optional. If set, all API calls go here instead of `/vtoa-api`. |
| `VTOA_BACKEND_ORIGIN` | Server-only. Rewrite target for `/vtoa-api` (default `http://127.0.0.1:8000`). |

When the backend is not running, **Generate preview** surfaces typed errors via toasts and the preview panel.

## Project layout

| Path | Role |
| --- | --- |
| `app/` | Routes (`/`, `/try-on`) |
| `components/try-on/try-on-widget.tsx` | Reusable workspace (upload + catalog + preview) |
| `hooks/useTryOn.ts` | Headless orchestration hook |
| `services/tryon/tryon-api.ts` | Typed `TryOnApiClient` for `/api/*` endpoints |
| `stores/tryon-store.ts` | Zustand session store |
| `lib/env.ts` | Reads public env vars |

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Turbopack dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |

## Backend AI (FastAPI)

Real try-on runs in `../vota-be`. Set `TRYON_PROVIDER=replicate` and `REPLICATE_API_TOKEN` for **Replicate OOTDiffusion**, or keep `huggingface` and point `HF_API_URL` at a **multipart** inference endpoint. See `../vota-be/README.md` (section **AI providers**).

## Shopify readiness notes

- Pass `apiBaseUrl` to `<TryOnWidget />` when the storefront cannot rely on `NEXT_PUBLIC_*` build-time variables (e.g. App Proxy URL per shop).
- Keep catalog data external (`catalogItems` prop) instead of hardcoding in UI leaf components.
- `useTryOn` accepts the same override, so hooks can be reused inside client-only extensions.
