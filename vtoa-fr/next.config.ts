import path from "path";
import { fileURLToPath } from "url";
import type { NextConfig } from "next";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * FastAPI origin for the dev proxy (`/vtoa-api/*` → backend).
 * Server-only; not exposed to the browser.
 */
const backendOrigin =
  process.env.VTOA_BACKEND_ORIGIN?.replace(/\/$/, "") || "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "localhost",
        pathname: "/**",
      },
      /* Proxied static previews when PUBLIC_BASE_URL points at Next /vtoa-api */
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/vtoa-api/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "3000",
        pathname: "/vtoa-api/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/vtoa-api/:path*",
        destination: `${backendOrigin}/:path*`,
      },
    ];
  },
};

export default nextConfig;
