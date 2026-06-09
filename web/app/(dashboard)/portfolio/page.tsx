import type { Metadata } from "next";
import { Suspense } from "react";

import { PortfolioPageClient } from "@/features/markets/portfolio-page-client";
import { PortfolioPageSkeleton } from "@/features/markets/components/markets-states";
import { OG_SITE_DEFAULTS, siteCanonical } from "@/lib/seo/metadata-helpers";

export const metadata: Metadata = {
  ...siteCanonical("/portfolio"),
  title: "Portföy — Marketly",
  description: "Canlı ve kağıt portföy, P&L, dağılım, risk ve portföy sinyalleri.",
  openGraph: {
    ...OG_SITE_DEFAULTS,
    title: "Portföy — Marketly",
    description: "Canlı ve kağıt portföy, P&L, dağılım, risk ve portföy sinyalleri.",
  },
};

export default function PortfolioPage() {
  return (
    <Suspense fallback={<PortfolioPageSkeleton />}>
      <PortfolioPageClient />
    </Suspense>
  );
}
