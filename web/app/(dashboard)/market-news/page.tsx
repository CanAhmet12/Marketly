import type { Metadata } from "next";
import { Suspense } from "react";

import { MarketNewsroomPageClient } from "@/features/markets/market-newsroom-page-client";
import { MarketNewsPageSkeleton } from "@/features/markets/components/markets-states";
import { OG_SITE_DEFAULTS, siteCanonical } from "@/lib/seo/metadata-helpers";

export const metadata: Metadata = {
  ...siteCanonical("/market-news"),
  title: "Piyasa Haberleri — Marketly",
  description: "Canlı piyasa haberleri ve makro akış.",
  openGraph: {
    ...OG_SITE_DEFAULTS,
    title: "Piyasa Haberleri — Marketly",
    description: "Canlı piyasa haberleri ve makro akış.",
  },
};

export default function MarketNewsPage() {
  return (
    <Suspense fallback={<MarketNewsPageSkeleton />}>
      <MarketNewsroomPageClient />
    </Suspense>
  );
}
