"use client";

import { useCallback, useRef, useState } from "react";
import { ImageIcon, Upload } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTryOnStore } from "@/stores/tryon-store";

const ACCEPT = "image/jpeg,image/png,image/webp";

/**
 * Native file upload with drag-and-drop.
 * Keeps binary data client-side until the generate step posts to FastAPI.
 */
export function UserPhotoUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const setUserPhoto = useTryOnStore((s) => s.setUserPhoto);
  const previewUrl = useTryOnStore((s) => s.userPhotoPreviewUrl);

  const onFile = useCallback(
    (file: File | undefined) => {
      if (!file || !file.type.startsWith("image/")) {
        return;
      }
      const url = URL.createObjectURL(file);
      setUserPhoto(file, url);
    },
    [setUserPhoto],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      onFile(file);
    },
    [onFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      onFile(file);
    },
    [onFile],
  );

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ImageIcon className="size-4" aria-hidden />
          Your photo
        </CardTitle>
        <CardDescription>
          Use a clear upper-body photo for best results. Images stay in your
          session until you generate a preview.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="sr-only"
          onChange={handleInputChange}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 bg-muted/30 hover:border-muted-foreground/40 hover:bg-muted/50"
          }`}
        >
          {previewUrl ? (
            <div className="relative aspect-[3/4] w-full max-w-xs overflow-hidden rounded-lg border border-border bg-background shadow-inner">
              <Image
                src={previewUrl}
                alt="Your uploaded preview"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <>
              <span className="inline-flex size-12 items-center justify-center rounded-full bg-background shadow-sm ring-1 ring-border">
                <Upload className="size-5 text-muted-foreground" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-medium">Drop an image here</p>
                <p className="text-xs text-muted-foreground">
                  or click to browse (JPEG, PNG, WebP)
                </p>
              </div>
            </>
          )}
        </button>
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={() => inputRef.current?.click()}>
            {previewUrl ? "Replace photo" : "Choose photo"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
