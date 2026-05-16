/**
 * Centralized access to public environment variables.
 * Values prefixed with NEXT_PUBLIC_ are exposed to the browser.
 */

/** Direct FastAPI URL when not using the Next.js proxy (SSR fallback). */
const DEFAULT_DEV_API = "http://127.0.0.1:8000";

/**
 * Base URL for the FastAPI backend (no trailing slash).
 *
 * Resolution order:
 * 1. `NEXT_PUBLIC_API_BASE_URL` when set (direct API, production, or custom proxy).
 * 2. In the browser, when unset: same-origin `/vtoa-api` (rewrites to FastAPI — see `next.config.ts`).
 * 3. During SSR without env: `http://127.0.0.1:8000` (matches FastAPI default bind).
 */
export function getPublicApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (raw) {
    return raw.replace(/\/$/, "");
  }
  if (typeof window !== "undefined") {
    return `${window.location.origin}/vtoa-api`.replace(/\/$/, "");
  }
  return DEFAULT_DEV_API;
}
