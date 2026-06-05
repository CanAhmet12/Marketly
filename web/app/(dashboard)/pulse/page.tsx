import type { Metadata } from "next";
import { Suspense } from "react";

import { PulsePageClient } from "@/features/discover/pages/pulse-page-client";
import { PulseListSkeleton } from "@/features/pulse/pulse-list-skeleton";
import { OG_SITE_DEFAULTS, siteCanonical } from "@/lib/seo/metadata-helpers";

export const metadata: Metadata = {
  ...siteCanonical("/pulse"),
  title: "Pulse — Marketly",
  description: "Kısa form piyasa yorumları ve Pulse içerikleri.",
  openGraph: {
    ...OG_SITE_DEFAULTS,
    title: "Pulse — Marketly",
    description: "Kısa form piyasa yorumları ve Pulse içerikleri.",
  },
};

export default function PulsePage() {
  return (
    <Suspense fallback={<PulseListSkeleton />}>
      <PulsePageClient />
    </Suspense>
  );
}
