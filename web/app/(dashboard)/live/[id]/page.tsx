import type { Metadata } from "next";
import { Suspense } from "react";

import { LiveWatchClient } from "@/features/live/live-watch-client";
import { LiveWatchSkeleton } from "@/features/live/live-watch-skeleton";
import { OG_SITE_DEFAULTS, siteCanonical } from "@/lib/seo/metadata-helpers";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    ...siteCanonical(`/live/${id}`),
    title: "Canlı Yayın — Marketly",
    description: "Canlı piyasa yayını ve sohbet.",
    openGraph: {
      ...OG_SITE_DEFAULTS,
      title: "Canlı Yayın — Marketly",
    },
  };
}

export default async function LiveWatchPage({ params }: Props) {
  const { id } = await params;
  return (
    <Suspense fallback={<LiveWatchSkeleton />}>
      <LiveWatchClient postId={id} />
    </Suspense>
  );
}
