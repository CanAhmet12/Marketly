import type { Metadata } from "next";
import { Suspense } from "react";

import { SignalsPageClient } from "@/features/signals/signals-page-client";
import { SignalsPageSkeleton } from "@/features/signals/components/signals-feed-skeleton";
import { OG_SITE_DEFAULTS, siteCanonical } from "@/lib/seo/metadata-helpers";

export const metadata: Metadata = {
  ...siteCanonical("/signals"),
  title: "Sinyaller — Marketly",
  description: "Analist sinyalleri, güven skoru ve trade ticket kataloğu.",
  openGraph: {
    ...OG_SITE_DEFAULTS,
    title: "Sinyaller — Marketly",
    description: "Analist sinyalleri, güven skoru ve trade ticket kataloğu.",
  },
};

export default function SignalsPage() {
  return (
    <Suspense fallback={<SignalsPageSkeleton />}>
      <SignalsPageClient />
    </Suspense>
  );
}
