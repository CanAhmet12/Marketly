import type { Metadata } from "next";
import { Suspense } from "react";

import { DelayedSkeleton } from "@/components/states/delayed-skeleton";
import { UploadPageSkeleton } from "@/features/studio/components/studio-states";
import { UploadPageClientLazy } from "@/lib/lazy/dynamic-route-clients";
import { OG_SITE_DEFAULTS, siteCanonical } from "@/lib/seo/metadata-helpers";

export const metadata: Metadata = {
  ...siteCanonical("/hub/upload"),
  title: "İçerik Oluştur",
  description: "Gönderi, video, sinyal veya short oluşturun.",
  robots: { index: false, follow: true },
  openGraph: {
    ...OG_SITE_DEFAULTS,
    title: "İçerik Oluştur — Marketly",
    description: "Gönderi, video, sinyal veya short oluşturun.",
  },
};

export default function HubUploadPage() {
  return (
    <Suspense
      fallback={
        <DelayedSkeleton>
          <UploadPageSkeleton />
        </DelayedSkeleton>
      }
    >
      <UploadPageClientLazy />
    </Suspense>
  );
}
