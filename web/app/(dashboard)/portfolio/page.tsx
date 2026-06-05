import type { Metadata } from "next";
import { Suspense } from "react";

import { PortfolioPageClient } from "@/features/markets/portfolio-page-client";
import { PortfolioPageSkeleton } from "@/features/markets/components/markets-states";
import { OG_SITE_DEFAULTS, siteCanonical } from "@/lib/seo/metadata-helpers";

export const metadata: Metadata = {
  ...siteCanonical("/portfolio"),
  title: "Portföy — Marketly",
  description: "Kağıt portföy, P&L ve pozisyon dağılımı.",
  openGraph: {
    ...OG_SITE_DEFAULTS,
    title: "Portföy — Marketly",
    description: "Kağıt portföy, P&L ve pozisyon dağılımı.",
  },
};

export default function PortfolioPage() {
  return (
    <Suspense fallback={<PortfolioPageSkeleton />}>
      <PortfolioPageClient />
    </Suspense>
  );
}
