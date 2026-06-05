import type { Metadata } from "next";
import { Suspense } from "react";

import { VideosPageClient } from "@/features/discover/pages/videos-page-client";
import { VideosListSkeleton } from "@/features/discover/visual-reference/videos-list-skeleton";
import { OG_SITE_DEFAULTS, siteCanonical } from "@/lib/seo/metadata-helpers";

export const metadata: Metadata = {
  ...siteCanonical("/videos"),
  title: "Videolar — Marketly",
  description: "Uzun form video içerikleri ve piyasa analizleri.",
  openGraph: {
    ...OG_SITE_DEFAULTS,
    title: "Videolar — Marketly",
    description: "Uzun form video içerikleri ve piyasa analizleri.",
  },
};

export default function VideosPage() {
  return (
    <Suspense fallback={<VideosListSkeleton />}>
      <VideosPageClient />
    </Suspense>
  );
}
