"use client";

import Image from "next/image";
import { Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ClothingItem } from "@/services/tryon/types";
import { useTryOnStore } from "@/stores/tryon-store";

export interface ClothingGalleryProps {
  items: ClothingItem[];
}

/**
 * Selectable garment rail. Swap `items` prop for Shopify product media later.
 */
export function ClothingGallery({ items }: ClothingGalleryProps) {
  const selected = useTryOnStore((s) => s.selectedClothing);
  const setSelected = useTryOnStore((s) => s.setSelectedClothing);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Sample clothing</CardTitle>
        <CardDescription>
          Pick a garment image. These URLs mirror what a catalog feed would
          provide in production.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const isActive = selected?.id === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setSelected(item)}
                  className={cn(
                    "group relative w-full overflow-hidden rounded-xl border bg-muted/20 text-left transition-all outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                    isActive
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-border/80 hover:border-muted-foreground/40",
                  )}
                >
                  <div className="relative aspect-[4/5] w-full bg-muted">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      sizes="(max-width: 768px) 50vw, 33vw"
                    />
                    {isActive && (
                      <span className="absolute right-2 top-2 inline-flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
                        <Check className="size-4" aria-hidden />
                      </span>
                    )}
                  </div>
                  <div className="space-y-1 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium">{item.name}</p>
                      <Badge variant="secondary" className="shrink-0 text-[10px]">
                        {item.category}
                      </Badge>
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
