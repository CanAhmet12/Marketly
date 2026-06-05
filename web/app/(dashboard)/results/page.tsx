import type { Metadata } from "next";
import { Suspense } from "react";

import { SearchPageClient } from "@/features/search/search-page-client";
import { SearchResultsFallback } from "@/features/search/components/search-results-fallback";
import { OG_SITE_DEFAULTS, siteCanonical } from "@/lib/seo/metadata-helpers";

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  const t = (q ?? "").trim();
  const title = t ? `"${t.slice(0, 48)}${t.length > 48 ? "…" : ""}" · Arama` : "Arama · Marketly";
  const qPath = t ? `/results?q=${encodeURIComponent(t)}` : "/results";
  return {
    ...siteCanonical(qPath),
    title,
    description: "Marketly’de gönderi, kanal, video ve piyasa arayın.",
    robots: { index: false, follow: true },
    openGraph: {
      ...OG_SITE_DEFAULTS,
      title,
      description: "Marketly’de gönderi, kanal, video ve piyasa arayın.",
    },
  };
}

export default async function ResultsPage({ searchParams }: Props) {
  await searchParams;
  return (
    <Suspense fallback={<SearchResultsFallback />}>
      <SearchPageClient />
    </Suspense>
  );
}
