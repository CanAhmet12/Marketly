import type { Metadata } from "next";
import { Suspense } from "react";

import { DelayedSkeleton } from "@/components/states/delayed-skeleton";
import { SavedPageClient } from "@/features/social/saved-page-client";
import { SavedPageSkeleton } from "@/features/social/components/social-states";
import { OG_SITE_DEFAULTS, siteCanonical } from "@/lib/seo/metadata-helpers";

export const metadata: Metadata = {
  ...siteCanonical("/saved"),
  title: "Kaydedilenler — Marketly",
  description: "Kaydettiğiniz gönderiler, videolar ve içerikler.",
  openGraph: {
    ...OG_SITE_DEFAULTS,
    title: "Kaydedilenler — Marketly",
    description: "Kaydettiğiniz gönderiler, videolar ve içerikler.",
  },
};

export default function SavedPage() {
  return (
    <Suspense
      fallback={
        <DelayedSkeleton>
          <SavedPageSkeleton />
        </DelayedSkeleton>
      }
    >
      <SavedPageClient />
    </Suspense>
  );
}
