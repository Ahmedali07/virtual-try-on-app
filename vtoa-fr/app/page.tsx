import Link from "next/link";

import { HeroSection } from "@/components/landing/hero-section";
import { SiteHeader } from "@/components/layout/site-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <section
          id="architecture"
          className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16 sm:px-6"
        >
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Composable widget",
                body: "Mount `TryOnWidget` in any route or embed. Pass `apiBaseUrl` when the backend is proxied through Shopify.",
              },
              {
                title: "Typed API client",
                body: "`TryOnApiClient` centralizes `/api/health`, `/api/upload`, and `/api/tryon` so you can mock or swap transports per channel.",
              },
              {
                title: "Session state",
                body: "Zustand store separates UI from orchestration hooks, mirroring how you would hydrate merchant context in production.",
              },
            ].map((card) => (
              <article
                key={card.title}
                className="rounded-2xl border border-border/80 bg-card/60 p-6 shadow-sm"
              >
                <h2 className="font-heading text-lg font-semibold">{card.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{card.body}</p>
              </article>
            ))}
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-3">
            <Button
              size="lg"
              className="rounded-xl px-8"
              render={<Link href="/try-on" />}
              nativeButton={false}
            >
              Try Demo
            </Button>
            <Link
              href="/try-on"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "rounded-xl px-8",
              )}
            >
              Open studio
            </Link>
          </div>
        </section>
      </main>
      <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
        Demo frontend · configure{" "}
        <code className="rounded bg-muted px-1 py-0.5">NEXT_PUBLIC_API_BASE_URL</code>{" "}
        to point at FastAPI
      </footer>
    </div>
  );
}
