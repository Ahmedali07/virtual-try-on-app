"use client";

import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";

import { Toaster } from "@/components/ui/sonner";

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Application-level providers (theming, global toasts).
 * Isolated from route layouts to keep server components lean.
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
      <Toaster richColors position="top-right" closeButton />
    </ThemeProvider>
  );
}
