import type { Metadata } from "next";
import { Suspense } from "react";

import { DelayedSkeleton } from "@/components/states/delayed-skeleton";
import { DiscoverLegacyTabRedirect } from "@/features/discover/components/discover-legacy-tab-redirect";
import { DiscoverFeedSkeleton } from "@/features/discover/visual-reference/discover-feed-skeleton";
import { DiscoverVisualReferenceContainerLazy } from "@/lib/lazy/dynamic-route-clients";
import { siteCanonical, OG_SITE_DEFAULTS } from "@/lib/seo/metadata-helpers";

export const metadata: Metadata = {
  ...siteCanonical("/discover"),
  title: "Keşfet — Marketly",
  description: "Canlı yayınlar, Pulse videolar, sinyaller ve üretici keşfi.",
  openGraph: {
    ...OG_SITE_DEFAULTS,
    title: "Keşfet — Marketly",
    description: "Canlı yayınlar, Pulse videolar, sinyaller ve üretici keşfi.",
  },
};

export default function DiscoverPage() {
  return (
    <>
      <Suspense fallback={null}>
        <DiscoverLegacyTabRedirect />
      </Suspense>
      <Suspense
        fallback={
          <DelayedSkeleton>
            <DiscoverFeedSkeleton />
          </DelayedSkeleton>
        }
      >
        <DiscoverVisualReferenceContainerLazy />
      </Suspense>
    </>
  );
}
