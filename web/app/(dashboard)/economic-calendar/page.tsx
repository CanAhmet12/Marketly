import type { Metadata } from "next";
import { Suspense } from "react";

import { EconomicCalendarIntelligencePageClient } from "@/features/markets/economic-calendar-intelligence-page-client";
import { IntelWorkspaceSkeleton } from "@/features/markets/components/markets-states";
import { OG_SITE_DEFAULTS, siteCanonical } from "@/lib/seo/metadata-helpers";

export const metadata: Metadata = {
  ...siteCanonical("/economic-calendar"),
  title: "Ekonomik Takvim — Marketly",
  description: "Makro etkinlikler, etki seviyeleri ve izleme kesişimi.",
  openGraph: {
    ...OG_SITE_DEFAULTS,
    title: "Ekonomik Takvim — Marketly",
    description: "Makro etkinlikler, etki seviyeleri ve izleme kesişimi.",
  },
};

export default function EconomicCalendarPage() {
  return (
    <Suspense fallback={<IntelWorkspaceSkeleton rows={6} />}>
      <EconomicCalendarIntelligencePageClient />
    </Suspense>
  );
}
