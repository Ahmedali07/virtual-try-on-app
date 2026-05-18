import type {
  TryOnGenerateResponse,
  TryOnUploadResponse,
  TryOnApiClientConfig,
} from "@/services/tryon/types";

/**
 * Thrown when the try-on API returns a non-2xx response or malformed payload.
 */
export class TryOnApiError extends Error {
  readonly status: number;
  readonly body?: string;

  constructor(message: string, status: number, body?: string) {
    super(message);
    this.name = "TryOnApiError";
    this.status = status;
    this.body = body;
  }
}

function joinUrl(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * `fetch` must not be called as a detached method (e.g. `this.fetchImpl()`),
 * or browsers throw "Illegal invocation". Always invoke through a closure.
 */
function bindFetch(impl: typeof fetch = fetch): typeof fetch {
  return (input, init) => impl(input, init);
}

/**
 * Normalizes backend JSON keys across iterations (snake_case vs camelCase).
 */
function pickOutputImageUrl(data: Record<string, unknown>): string | undefined {
  const candidates = [
    data.outputImageUrl,
    data.output_image_url,
    data.imageUrl,
    data.image_url,
    data.url,
    data.result_url,
  ];
  for (const c of candidates) {
    if (typeof c === "string" && c.length > 0) {
      return c;
    }
  }
  return undefined;
}

/**
 * Modular HTTP client for virtual try-on endpoints.
 * Instantiate per base URL (demo site vs Shopify app proxy).
 */
export class TryOnApiClient {
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(config: TryOnApiClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, "");
    this.fetchImpl = bindFetch(config.fetchImpl);
  }

  async health(): Promise<{ status: string }> {
    const res = await this.fetchImpl(joinUrl(this.baseUrl, "/api/health"), {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new TryOnApiError(
        `Health check failed (${res.status})`,
        res.status,
        text,
      );
    }
    return (await res.json()) as { status: string };
  }

  /**
   * Persists the user portrait on the backend (optional step before /api/tryon).
   */
  async uploadUserImage(file: File): Promise<TryOnUploadResponse> {
    const body = new FormData();
    body.append("file", file);

    const res = await this.fetchImpl(joinUrl(this.baseUrl, "/api/upload"), {
      method: "POST",
      body,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new TryOnApiError(
        `Upload failed (${res.status})`,
        res.status,
        text,
      );
    }
    return (await res.json()) as TryOnUploadResponse;
  }

  /**
   * Runs the virtual try-on pipeline with the user's image and a garment URL.
   */
  async generateTryOn(input: {
    userImage: File;
    clothingImageUrl: string;
  }): Promise<TryOnGenerateResponse> {
    const body = new FormData();
    body.append("user_image", input.userImage);
    body.append("clothing_image_url", input.clothingImageUrl);

    const res = await this.fetchImpl(joinUrl(this.baseUrl, "/api/tryon"), {
      method: "POST",
      body,
    });

    const text = await res.text().catch(() => "");
    if (!res.ok) {
      throw new TryOnApiError(
        parseErrorMessage(text, res.status),
        res.status,
        text,
      );
    }

    let data: Record<string, unknown>;
    try {
      data = JSON.parse(text) as Record<string, unknown>;
    } catch {
      throw new TryOnApiError("Invalid JSON from try-on API", res.status, text);
    }

    const outputImageUrl = pickOutputImageUrl(data);
    if (!outputImageUrl) {
      throw new TryOnApiError(
        "Try-on API response missing image URL",
        res.status,
        text,
      );
    }

    return {
      outputImageUrl,
      requestId:
        typeof data.request_id === "string"
          ? data.request_id
          : typeof data.requestId === "string"
            ? data.requestId
            : undefined,
    };
  }
}

function parseErrorMessage(body: string, status: number): string {
  try {
    const data = JSON.parse(body) as Record<string, unknown>;
    const detail = data.detail ?? data.message ?? data.error;
    if (typeof detail === "string") {
      return detail;
    }
  } catch {
    /* fall through */
  }
  if (body.trim().length > 0) {
    return `Request failed (${status}): ${body.slice(0, 280)}`;
  }
  return `Request failed (${status})`;
}
