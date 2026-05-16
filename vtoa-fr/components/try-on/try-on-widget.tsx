"use client";

import { Loader2, RefreshCw, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTryOn } from "@/hooks/useTryOn";
import { SAMPLE_CLOTHING_ITEMS } from "@/lib/constants/sample-clothing";
import { cn } from "@/lib/utils";
import type { ClothingItem } from "@/services/tryon/types";
import { useTryOnStore } from "@/stores/tryon-store";

import { ClothingGallery } from "@/components/try-on/clothing-gallery";
import { TryOnResultPanel } from "@/components/try-on/try-on-result-panel";
import { UserPhotoUpload } from "@/components/try-on/user-photo-upload";

export interface TryOnWidgetProps {
  /**
   * Optional API origin override for embedded contexts (e.g. Shopify app proxy).
   */
  apiBaseUrl?: string;
  /** Replace the demo catalog with merchant-specific items */
  catalogItems?: ClothingItem[];
  className?: string;
}

/**
 * Self-contained try-on workspace: uploads, garment selection, preview, retry.
 * Mount this in a Next.js page today or inside a Shopify theme extension tomorrow.
 */
export function TryOnWidget({
  apiBaseUrl,
  catalogItems = SAMPLE_CLOTHING_ITEMS,
  className,
}: TryOnWidgetProps) {
  const { generatePreview, resetResult, resetAll } = useTryOn({ apiBaseUrl });

  const status = useTryOnStore((s) => s.status);
  const userPhotoFile = useTryOnStore((s) => s.userPhotoFile);
  const selectedClothing = useTryOnStore((s) => s.selectedClothing);

  const isBusy = status === "generating" || status === "uploading";
  const canGenerate =
    Boolean(userPhotoFile) && Boolean(selectedClothing) && !isBusy;

  return (
    <div className={cn("space-y-8", className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
            Virtual try-on studio
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Upload a portrait, pick a garment, then generate a preview against
            your FastAPI backend.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="lg"
            className="rounded-xl"
            disabled={!canGenerate}
            onClick={() => void generatePreview()}
          >
            {isBusy ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Generating…
              </>
            ) : (
              <>
                <Sparkles className="size-4" aria-hidden />
                Generate preview
              </>
            )}
          </Button>
          <Button
            type="button"
            size="lg"
            variant="outline"
            className="rounded-xl"
            disabled={!userPhotoFile || !selectedClothing || isBusy}
            onClick={() => {
              resetResult();
              void generatePreview();
            }}
          >
            <RefreshCw className="size-4" aria-hidden />
            Retry
          </Button>
          <Button
            type="button"
            size="lg"
            variant="ghost"
            className="rounded-xl"
            onClick={() => resetAll()}
          >
            Start over
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-8">
          <UserPhotoUpload />
          <ClothingGallery items={catalogItems} />
        </div>
        <TryOnResultPanel />
      </div>
    </div>
  );
}
