import type { Metadata } from "next";
import { Suspense } from "react";

import { MarketNewsDetailClient } from "@/features/markets/market-news-detail-client";
import { IntelWorkspaceSkeleton } from "@/features/markets/components/markets-states";
import { OG_SITE_DEFAULTS, siteCanonical } from "@/lib/seo/metadata-helpers";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const title = "Piyasa Haberi — Marketly";
  const description = "Canlı piyasa haberi, etki analizi ve sembol bağlamı.";

  return {
    ...siteCanonical(`/market-news/${id}`),
    title,
    description,
    openGraph: {
      ...OG_SITE_DEFAULTS,
      title,
      description,
      type: "article",
    },
  };
}

export default async function MarketNewsDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <Suspense fallback={<IntelWorkspaceSkeleton rows={6} />}>
      <MarketNewsDetailClient newsId={id} />
    </Suspense>
  );
}
