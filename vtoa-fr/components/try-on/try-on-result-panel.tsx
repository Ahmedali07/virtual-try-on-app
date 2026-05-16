"use client";

import Image from "next/image";
import { Loader2, Sparkles } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTryOnStore } from "@/stores/tryon-store";

/**
 * Result surface with loading and error states (actions live in {@link TryOnWidget}).
 */
export function TryOnResultPanel() {
  const status = useTryOnStore((s) => s.status);
  const resultImageUrl = useTryOnStore((s) => s.resultImageUrl);
  const errorMessage = useTryOnStore((s) => s.errorMessage);

  const isBusy = status === "generating" || status === "uploading";

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="size-4" aria-hidden />
          Preview
        </CardTitle>
        <CardDescription>
          Output is returned by your FastAPI service as a public image URL.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {errorMessage && status === "error" && (
          <Alert variant="destructive">
            <AlertTitle>Could not generate preview</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <div className="relative flex min-h-[320px] items-center justify-center overflow-hidden rounded-xl border border-dashed border-border/80 bg-muted/30">
          {isBusy && (
            <div className="flex flex-col items-center gap-3 p-8 text-center">
              <Loader2
                className="size-10 animate-spin text-muted-foreground"
                aria-hidden
              />
              <div className="space-y-2">
                <p className="text-sm font-medium">Generating preview…</p>
                <div className="mx-auto w-48 space-y-2">
                  <Skeleton className="h-2 w-full" />
                  <Skeleton className="h-2 w-4/5" />
                </div>
              </div>
            </div>
          )}

          {!isBusy && resultImageUrl && (
            <div className="relative aspect-[3/4] w-full max-w-md">
              <Image
                src={resultImageUrl}
                alt="Virtual try-on result"
                fill
                className="object-contain bg-background"
                unoptimized
              />
            </div>
          )}

          {!isBusy && !resultImageUrl && (
            <p className="max-w-xs px-6 text-center text-sm text-muted-foreground">
              Generated look appears here. Connect the FastAPI backend and use
              &quot;Generate preview&quot; to run the round trip.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
