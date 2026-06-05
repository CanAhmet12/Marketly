import type { Metadata } from "next";
import { Suspense } from "react";

import { LivePageClient } from "@/features/discover/pages/live-page-client";
import { LiveListSkeleton } from "@/features/discover/visual-reference/live-list-skeleton";
import { OG_SITE_DEFAULTS, siteCanonical } from "@/lib/seo/metadata-helpers";

export const metadata: Metadata = {
  ...siteCanonical("/live"),
  title: "Canlı Yayınlar — Marketly",
  description: "Canlı yayınlar ve gerçek zamanlı piyasa masaları.",
  openGraph: {
    ...OG_SITE_DEFAULTS,
    title: "Canlı Yayınlar — Marketly",
    description: "Canlı yayınlar ve gerçek zamanlı piyasa masaları.",
  },
};

export default function LivePage() {
  return (
    <Suspense fallback={<LiveListSkeleton />}>
      <LivePageClient />
    </Suspense>
  );
}
