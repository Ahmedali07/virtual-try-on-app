# Deploy: GitHub + Vercel + API host

## 1. Push this monorepo to GitHub

From the repo root (`VTOA`):

```bash
git init
git add .
git commit -m "Initial commit: virtual try-on frontend and backend"
```

Create the repo on GitHub (pick one):

**GitHub website:** [github.com/new](https://github.com/new) → name e.g. `virtual-try-on-app` → do **not** add README (you already have one) → create → then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/virtual-try-on-app.git
git branch -M main
git push -u origin main
```

**GitHub CLI** (after `gh auth login`):

```bash
gh repo create virtual-try-on-app --public --source=. --remote=origin --push
```

## 2. Import into Vercel

1. [vercel.com/new](https://vercel.com/new) → **Import** your GitHub repo.
2. **Root Directory:** click *Edit* → set to **`vtoa-fr`** (required for this monorepo).
3. Framework: **Next.js** (auto-detected).
4. **Environment variables** (Production):

   | Name | Value |
   | --- | --- |
   | `NEXT_PUBLIC_API_BASE_URL` | Your live FastAPI URL, e.g. `https://vtoa-api.onrender.com` |

5. Deploy.

Preview deployments use the same vars unless you override per environment.

## 3. Deploy the backend (not on Vercel)

FastAPI + long Replicate jobs fit **Railway**, **Render**, or **Fly.io** better than Vercel serverless.

**Render (example):** New → Web Service → same repo → **Root Directory** `vota-be` → use `render.yaml` or:

- Build: `pip install -r requirements.txt`
- Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`

Set env from `vota-be/.env.example` (`REPLICATE_API_TOKEN`, `TRYON_PROVIDER`, `CORS_ORIGINS` including your Vercel URL, `PUBLIC_BASE_URL` if needed).

After the API is live, set `NEXT_PUBLIC_API_BASE_URL` on Vercel and redeploy the frontend.

## 4. CORS checklist

`vota-be` `.env`:

```env
CORS_ORIGINS=https://your-app.vercel.app,https://your-app-*.vercel.app
```

Use your exact production domain; add preview URLs if you test from Vercel preview branches.
