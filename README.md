# AI Virtual Try-On

Demo-first virtual try-on stack: **Next.js 15** frontend (`vtoa-fr`) + **FastAPI** backend (`vota-be`).

## Quick start (local)

**Backend**

```bash
cd vota-be
python -m venv .venv
# Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend**

```bash
cd vtoa-fr
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → **Try Demo** at `/try-on`.

## Deploy

| App | Platform | Root directory |
| --- | --- | --- |
| Frontend | [Vercel](https://vercel.com) | `vtoa-fr` (see `vercel.json`) |
| Backend | Railway, Render, or Fly.io | `vota-be` |

Set `NEXT_PUBLIC_API_BASE_URL` on Vercel to your production API URL. Set `PUBLIC_BASE_URL` on the backend to match how the browser reaches the API (or use CORS + direct URL).

See `vtoa-fr/README.md` and `vota-be/README.md` for provider-specific env vars (Replicate, Hugging Face).

## Repository layout

```
vtoa-fr/   Next.js demo + reusable TryOnWidget
vota-be/   FastAPI + virtual try-on providers
```
