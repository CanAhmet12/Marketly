import type { Metadata } from "next";
import { Suspense } from "react";

import { DelayedSkeleton } from "@/components/states/delayed-skeleton";
import { PriceAlertsPageClient } from "@/features/markets/price-alerts-page-client";
import { PriceAlertsPageSkeleton } from "@/features/markets/components/markets-states";
import { OG_SITE_DEFAULTS, siteCanonical } from "@/lib/seo/metadata-helpers";

export const metadata: Metadata = {
  ...siteCanonical("/price-alerts"),
  title: "Fiyat Alarmları — Marketly",
  description: "Varlık fiyat uyarıları ve eşik alarmları.",
  openGraph: {
    ...OG_SITE_DEFAULTS,
    title: "Fiyat Alarmları — Marketly",
    description: "Varlık fiyat uyarıları ve eşik alarmları.",
  },
};

export default function PriceAlertsPage() {
  return (
    <Suspense
      fallback={
        <DelayedSkeleton>
          <PriceAlertsPageSkeleton />
        </DelayedSkeleton>
      }
    >
      <PriceAlertsPageClient />
    </Suspense>
  );
}
