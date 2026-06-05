import type { Metadata } from "next";
import { Suspense } from "react";

import { HomeEditorialHome } from "@/features/home/visual/home-editorial-home";
import { HomeEditorialFeedSkeleton } from "@/features/home/visual/home-editorial-feed-skeleton";
import { OG_SITE_DEFAULTS, siteCanonical } from "@/lib/seo/metadata-helpers";

import "@/styles/route-groups/home.css";

export const metadata: Metadata = {
  ...siteCanonical("/"),
  title: "Akış — Marketly",
  description: "Takip ettiğin üreticiler ve gönderi akışı; video ve canlı için üst sekmeler, Pulse Keşfet’te.",
  openGraph: {
    ...OG_SITE_DEFAULTS,
    title: "Akış — Marketly",
    description: "Takip ettiğin üreticiler ve gönderi akışı; video ve canlı için üst sekmeler, Pulse Keşfet’te.",
  },
};

function HomeFeedFallback() {
  return <HomeEditorialFeedSkeleton />;
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomeFeedFallback />}>
      <HomeEditorialHome />
    </Suspense>
  );
}
