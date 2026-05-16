"use client";

import { useCallback, useMemo } from "react";
import { toast } from "sonner";

import { getPublicApiBaseUrl } from "@/lib/env";
import { TryOnApiClient, TryOnApiError } from "@/services/tryon";
import { useTryOnStore } from "@/stores/tryon-store";

export interface UseTryOnOptions {
  /**
   * When embedding in Shopify or another host, pass the resolved API origin
   * (e.g. App Proxy path) instead of relying on NEXT_PUBLIC_API_BASE_URL.
   */
  apiBaseUrl?: string;
}

/**
 * Headless orchestration for try-on actions.
 * UI components should stay thin and delegate to this hook where possible.
 */
export function useTryOn(options?: UseTryOnOptions) {
  const client = useMemo(() => {
    const base = (options?.apiBaseUrl ?? getPublicApiBaseUrl()).replace(
      /\/$/,
      "",
    );
    return new TryOnApiClient({ baseUrl: base });
  }, [options?.apiBaseUrl]);

  const userPhotoFile = useTryOnStore((s) => s.userPhotoFile);
  const selectedClothing = useTryOnStore((s) => s.selectedClothing);
  const status = useTryOnStore((s) => s.status);
  const errorMessage = useTryOnStore((s) => s.errorMessage);
  const resultImageUrl = useTryOnStore((s) => s.resultImageUrl);

  const setStatus = useTryOnStore((s) => s.setStatus);
  const setError = useTryOnStore((s) => s.setError);
  const setResultImageUrl = useTryOnStore((s) => s.setResultImageUrl);
  const setLastRequestId = useTryOnStore((s) => s.setLastRequestId);
  const resetResult = useTryOnStore((s) => s.resetResult);
  const resetAll = useTryOnStore((s) => s.resetAll);

  const generatePreview = useCallback(async () => {
    if (!userPhotoFile) {
      const msg = "Please upload a photo first.";
      setError(msg);
      toast.error(msg);
      return;
    }
    if (!selectedClothing) {
      const msg = "Please select a clothing item.";
      setError(msg);
      toast.error(msg);
      return;
    }

    setError(null);
    setStatus("generating");

    try {
      const res = await client.generateTryOn({
        userImage: userPhotoFile,
        clothingImageUrl: selectedClothing.imageUrl,
      });
      setResultImageUrl(res.outputImageUrl);
      setLastRequestId(res.requestId ?? null);
      setStatus("success");
      toast.success("Preview ready");
    } catch (e) {
      const message =
        e instanceof TryOnApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : "Unexpected error while generating preview.";
      setError(message);
      setStatus("error");
      toast.error(message);
    }
  }, [
    client,
    userPhotoFile,
    selectedClothing,
    setError,
    setLastRequestId,
    setResultImageUrl,
    setStatus,
  ]);

  const checkBackendHealth = useCallback(async () => {
    try {
      const res = await client.health();
      return res.status === "ok" || res.status === "healthy";
    } catch {
      return false;
    }
  }, [client]);

  return {
    status,
    errorMessage,
    resultImageUrl,
    generatePreview,
    resetResult,
    resetAll,
    checkBackendHealth,
  };
}
