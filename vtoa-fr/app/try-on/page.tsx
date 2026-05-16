import type { Metadata } from "next";

import { SiteHeader } from "@/components/layout/site-header";
import { TryOnWidget } from "@/components/try-on/try-on-widget";

export const metadata: Metadata = {
  title: "Try-On Studio",
};

export default function TryOnPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <TryOnWidget />
      </main>
    </div>
  );
}
