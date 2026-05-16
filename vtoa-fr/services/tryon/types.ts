/**
 * Domain types for virtual try-on flows.
 * Kept provider-agnostic so the same shapes work for demo, Shopify, or headless storefronts.
 */

export type TryOnJobStatus =
  | "idle"
  | "uploading"
  | "generating"
  | "success"
  | "error";

export interface ClothingItem {
  id: string;
  name: string;
  category: string;
  /** Publicly reachable garment image used by the inference pipeline */
  imageUrl: string;
}

/** Response from POST /api/upload (backend may extend fields later) */
export interface TryOnUploadResponse {
  /** Server-side identifier or path after upload */
  uploadId?: string;
  /** Temporary URL to fetch the stored user image */
  userImageUrl?: string;
  message?: string;
}

/** Response from POST /api/tryon */
export interface TryOnGenerateResponse {
  outputImageUrl: string;
  /** Optional correlation id for support / analytics */
  requestId?: string;
}

export interface TryOnApiClientConfig {
  baseUrl: string;
  /** Optional fetch implementation (tests, Shopify App Bridge, etc.) */
  fetchImpl?: typeof fetch;
}
