import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Marketing hero for the landing route.
 * Copy and layout are intentionally generic for reuse in partner demos.
 */
export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/15 via-background to-background"
      />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-4 py-20 sm:px-6 sm:py-28 lg:flex-row lg:items-center lg:gap-16">
        <div className="flex-1 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Demo-first · API-ready architecture
          </div>
          <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            AI Virtual Try-On
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground text-pretty sm:text-xl">
            Upload your photo and preview outfits instantly. Built with a clean
            separation between UI and try-on logic so you can embed the same
            flow inside a Shopify theme or storefront app later.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              render={<Link href="/try-on" />}
              nativeButton={false}
              className="rounded-xl px-6"
            >
              Try Demo
            </Button>
            <Link
              href="/#architecture"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "rounded-xl px-6",
              )}
            >
              Why this architecture
            </Link>
          </div>
          <ul className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
            <li className="rounded-xl border border-border/80 bg-card/60 p-4">
              Modular API client with typed errors
            </li>
            <li className="rounded-xl border border-border/80 bg-card/60 p-4">
              Reusable try-on widget + Zustand session state
            </li>
          </ul>
        </div>
        <div className="flex flex-1 justify-center lg:justify-end">
          <div className="relative aspect-[4/5] w-full max-w-sm overflow-hidden rounded-2xl border border-border/80 bg-muted/40 shadow-xl ring-1 ring-foreground/10">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 via-transparent to-cyan-500/20" />
            <div className="absolute inset-6 flex flex-col justify-between rounded-xl bg-background/85 p-4 shadow-lg backdrop-blur-sm">
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Live preview
                </p>
                <p className="text-sm font-medium leading-snug">
                  Portrait in · garment selected · preview out
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {["You", "Garment", "Blend"].map((label, i) => (
                  <div
                    key={label}
                    className="flex aspect-square flex-col justify-end rounded-lg bg-gradient-to-br from-muted to-muted/40 p-2 text-[10px] font-medium text-muted-foreground"
                  >
                    <span className="text-foreground">{i + 1}</span>
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
