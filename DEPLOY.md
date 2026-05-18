# Deploy: GitHub + Vercel + API host

## Live production

| App | URL |
| --- | --- |
| **Frontend** | https://virtual-try-on-app-nu.vercel.app |
| **Backend** | https://vtoa-api.onrender.com |
| **Health** | https://vtoa-api.onrender.com/api/health → `{"status":"ok"}` |
| **GitHub** | https://github.com/Ahmedali07/virtual-try-on-app |

## Vercel (frontend) — required env

Project → **Settings** → **Environment Variables** → **Production** (and **Preview** if needed):

| Name | Value |
| --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | `https://vtoa-api.onrender.com` |

**No trailing slash.** Save, then **Redeploy** the frontend.

## Render (backend) — required env

Service **vtoa-api** → **Environment**:

```env
PYTHON_VERSION=3.11.0
TRYON_PROVIDER=huggingface
CORS_ORIGINS=https://virtual-try-on-app-nu.vercel.app,http://localhost:3000
PUBLIC_BASE_URL=https://vtoa-api.onrender.com
```

Redeploy Render after changing env vars.

For real AI try-on (Replicate, paid per run):

```env
TRYON_PROVIDER=replicate
REPLICATE_API_TOKEN=r8_your_token_here
```

## Verify end-to-end

1. https://vtoa-api.onrender.com/api/health → `{"status":"ok"}`
2. https://virtual-try-on-app-nu.vercel.app/try-on → upload photo → **Generate preview**

If step 2 fails: confirm Vercel has `NEXT_PUBLIC_API_BASE_URL` and was redeployed; check Render logs and `CORS_ORIGINS`.

---

## Reference: initial setup

### GitHub

Repo: https://github.com/Ahmedali07/virtual-try-on-app

### Vercel import

1. [vercel.com/new](https://vercel.com/new) → import repo.
2. **Root Directory:** `vtoa-fr`
3. Set `NEXT_PUBLIC_API_BASE_URL` (see above).

### Render import

1. [render.com](https://render.com) → **Web Service** → repo `virtual-try-on-app`.
2. **Root Directory:** `vota-be`
3. **Build:** `pip install -r requirements.txt`
4. **Start:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Env vars (see above).

See also `vota-be/render.yaml`.
