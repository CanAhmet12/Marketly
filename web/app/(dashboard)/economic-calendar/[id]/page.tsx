import type { Metadata } from "next";
import { Suspense } from "react";

import { EconomicCalendarEventDetailClient } from "@/features/markets/economic-calendar-event-detail-client";
import { IntelWorkspaceSkeleton } from "@/features/markets/components/markets-states";
import { OG_SITE_DEFAULTS, siteCanonical } from "@/lib/seo/metadata-helpers";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const title = "Ekonomik Etkinlik — Marketly";
  const description = "Makro etkinlik detayı, veri karşılaştırması ve piyasa bağlamı.";

  return {
    ...siteCanonical(`/economic-calendar/${id}`),
    title,
    description,
    openGraph: {
      ...OG_SITE_DEFAULTS,
      title,
      description,
    },
  };
}

export default async function EconomicCalendarEventPage({ params }: Props) {
  const { id } = await params;
  return (
    <Suspense fallback={<IntelWorkspaceSkeleton rows={6} />}>
      <EconomicCalendarEventDetailClient eventId={id} />
    </Suspense>
  );
}
