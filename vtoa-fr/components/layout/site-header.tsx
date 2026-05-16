import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="inline-flex size-8 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
            VT
          </span>
          <span className="text-sm sm:text-base">Virtual Try-On</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link
            href="/try-on"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "text-muted-foreground hover:text-foreground",
            )}
          >
            Try-On
          </Link>
          <Button
            render={<Link href="/try-on" />}
            nativeButton={false}
            size="sm"
          >
            Launch demo
          </Button>
        </nav>
      </div>
    </header>
  );
}
