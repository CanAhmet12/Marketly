import type { Metadata } from "next";
import { Suspense } from "react";

import { CreatorsDirectoryClient } from "@/features/creators/creators-directory-client";
import { CreatorsDirectorySkeleton } from "@/features/creators/components/creators-directory-skeleton";
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
  return <CreatorsDirectorySkeleton />;
}

export default function CreatorsPage() {
  return (
    <Suspense fallback={<CreatorsFallback />}>
      <CreatorsDirectoryClient />
    </Suspense>
  );
}
