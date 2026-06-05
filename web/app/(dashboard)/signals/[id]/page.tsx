import type { Metadata } from "next";
import { Suspense } from "react";

import { SignalsFeedSkeleton } from "@/features/signals/components/signals-feed-skeleton";
import { SignalDetailPageClient } from "@/features/signals/signal-detail-page-client";
import { OG_SITE_DEFAULTS, siteCanonical } from "@/lib/seo/metadata-helpers";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const title = "Sinyal Detayı — Marketly";
  const description = "Trade sinyali, tez, seviyeler ve analist bağlamı.";

  return {
    ...siteCanonical(`/signals/${id}`),
    title,
    description,
    openGraph: {
      ...OG_SITE_DEFAULTS,
      title,
      description,
    },
  };
}

export default async function SignalDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <Suspense fallback={<SignalsFeedSkeleton />}>
      <SignalDetailPageClient signalId={id} />
    </Suspense>
  );
}
