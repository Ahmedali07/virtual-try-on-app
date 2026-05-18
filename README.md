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

## Deploy (production)

| App | URL | Platform |
| --- | --- | --- |
| Frontend | https://virtual-try-on-app-nu.vercel.app | [Vercel](https://vercel.com) · root `vtoa-fr` |
| Backend | https://vtoa-api.onrender.com | [Render](https://render.com) · root `vota-be` |

**Vercel env:** `NEXT_PUBLIC_API_BASE_URL=https://vtoa-api.onrender.com`  
**Render env:** `PUBLIC_BASE_URL=https://vtoa-api.onrender.com` and `CORS_ORIGINS=https://virtual-try-on-app-nu.vercel.app,http://localhost:3000`

Full checklist: [`DEPLOY.md`](./DEPLOY.md). Provider keys (Replicate): `vota-be/README.md`.

## Repository layout

```
vtoa-fr/   Next.js demo + reusable TryOnWidget
vota-be/   FastAPI + virtual try-on providers
```
