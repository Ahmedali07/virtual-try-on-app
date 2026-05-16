import { create } from "zustand";

import type { ClothingItem, TryOnJobStatus } from "@/services/tryon/types";

/**
 * Global try-on UI state for the demo.
 * For multi-merchant Shopify surfaces, consider a Context + scoped store factory.
 */
interface TryOnState {
  userPhotoFile: File | null;
  userPhotoPreviewUrl: string | null;
  selectedClothing: ClothingItem | null;
  resultImageUrl: string | null;
  status: TryOnJobStatus;
  errorMessage: string | null;
  lastRequestId: string | null;

  setUserPhoto: (file: File | null, previewUrl: string | null) => void;
  setSelectedClothing: (item: ClothingItem | null) => void;
  setResultImageUrl: (url: string | null) => void;
  setStatus: (status: TryOnJobStatus) => void;
  setError: (message: string | null) => void;
  setLastRequestId: (id: string | null) => void;
  /** Clears generated output and errors; keeps selections for quick retry */
  resetResult: () => void;
  /** Full reset for a new session */
  resetAll: () => void;
}

function revokeIfObjectUrl(url: string | null) {
  if (url?.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}

export const useTryOnStore = create<TryOnState>((set, get) => ({
  userPhotoFile: null,
  userPhotoPreviewUrl: null,
  selectedClothing: null,
  resultImageUrl: null,
  status: "idle",
  errorMessage: null,
  lastRequestId: null,

  setUserPhoto: (file, previewUrl) => {
    const prev = get().userPhotoPreviewUrl;
    revokeIfObjectUrl(prev);
    set({
      userPhotoFile: file,
      userPhotoPreviewUrl: previewUrl,
      resultImageUrl: null,
      errorMessage: null,
      status: "idle",
    });
  },

  setSelectedClothing: (item) =>
    set({
      selectedClothing: item,
      resultImageUrl: null,
      errorMessage: null,
      status: "idle",
    }),

  setResultImageUrl: (url) => set({ resultImageUrl: url }),

  setStatus: (status) => set({ status }),

  setError: (message) =>
    set({
      errorMessage: message,
      status: message ? "error" : get().status,
    }),

  setLastRequestId: (id) => set({ lastRequestId: id }),

  resetResult: () =>
    set({
      resultImageUrl: null,
      errorMessage: null,
      status: "idle",
      lastRequestId: null,
    }),

  resetAll: () => {
    const prev = get().userPhotoPreviewUrl;
    revokeIfObjectUrl(prev);
    set({
      userPhotoFile: null,
      userPhotoPreviewUrl: null,
      selectedClothing: null,
      resultImageUrl: null,
      status: "idle",
      errorMessage: null,
      lastRequestId: null,
    });
  },
}));
