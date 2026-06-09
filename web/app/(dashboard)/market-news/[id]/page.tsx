import type { Metadata } from "next";
import { Suspense } from "react";
import { createClient } from "@supabase/supabase-js";

import { MarketNewsDetailClient } from "@/features/markets/market-news-detail-client";
import { MarketNewsDetailSkeleton } from "@/features/markets/components/markets-states";
import { fetchMarketNewsById } from "@/features/markets/fetch-market-news";
import { OG_SITE_DEFAULTS, siteCanonical } from "@/lib/seo/metadata-helpers";
import { getSiteUrl, getSupabasePublicEnv } from "@/lib/supabase/env";

type Props = {
  params: Promise<{ id: string }>;
};

function metaSnippet(text: string | null | undefined, max = 120): string {
  const t = text?.trim();
  if (!t) return "";
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trim()}…`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { url, anonKey } = getSupabasePublicEnv();

  let headline = "Piyasa Haberi";
  let description = "Canlı piyasa haberi, etki analizi ve sembol bağlamı.";
  let ogImage: string | undefined;

  if (url && anonKey) {
    const supabase = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const row = await fetchMarketNewsById(supabase, id);
    if (row) {
      headline = row.title.trim() || headline;
      description =
        metaSnippet(row.description, 140) ||
        `${row.source} · ${headline}`;
      ogImage = row.image_url?.trim() || undefined;
    }
  }

  const title = `${headline} — Marketly`;
  const site = getSiteUrl();

  return {
    ...siteCanonical(`/market-news/${id}`),
    title,
    description,
    openGraph: {
      ...OG_SITE_DEFAULTS,
      title,
      description,
      type: "article",
      ...(ogImage ? { images: [{ url: ogImage, alt: headline }] } : {}),
      ...(site ? { url: `${site}/market-news/${id}` } : {}),
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

export default async function MarketNewsDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <Suspense fallback={<MarketNewsDetailSkeleton />}>
      <MarketNewsDetailClient newsId={id} />
    </Suspense>
  );
}
