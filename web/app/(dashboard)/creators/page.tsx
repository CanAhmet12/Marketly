import type { Metadata } from "next";
import { Suspense } from "react";

import { CreatorsPageClient } from "@/features/creators/creators-page-client";
import { CreatorsPageSkeleton } from "@/features/creators/components/creators-page-skeleton";
import { OG_SITE_DEFAULTS, siteCanonical } from "@/lib/seo/metadata-helpers";

export const metadata: Metadata = {
  ...siteCanonical("/creators"),
  title: "Üreticiler — Marketly",
  description: "Analist ve içerik üreticisi keşfi.",
  openGraph: {
    ...OG_SITE_DEFAULTS,
    title: "Üreticiler — Marketly",
    description: "Analist ve içerik üreticisi keşfi.",
  },
};

function CreatorsFallback() {
  return <CreatorsPageSkeleton />;
}

export default function CreatorsPage() {
  return (
    <Suspense fallback={<CreatorsFallback />}>
      <CreatorsPageClient />
    </Suspense>
  );
}
