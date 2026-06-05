import type { Metadata } from "next";
import { Suspense } from "react";

import { DelayedSkeleton } from "@/components/states/delayed-skeleton";
import { RequireAuth } from "@/features/auth/require-auth";
import { UploadPageSkeleton } from "@/features/studio/components/studio-states";
import { UploadPageClientLazy } from "@/lib/lazy/dynamic-route-clients";
import { OG_SITE_DEFAULTS, siteCanonical } from "@/lib/seo/metadata-helpers";

export const metadata: Metadata = {
  ...siteCanonical("/upload"),
  title: "İçerik Yükle — Marketly",
  description: "Gönderi, video, sinyal veya short oluşturun.",
  robots: { index: false, follow: true },
  openGraph: {
    ...OG_SITE_DEFAULTS,
    title: "İçerik Yükle — Marketly",
    description: "Gönderi, video, sinyal veya short oluşturun.",
  },
};

export default function UploadPage() {
  return (
    <RequireAuth>
      <Suspense
        fallback={
          <DelayedSkeleton>
            <UploadPageSkeleton />
          </DelayedSkeleton>
        }
      >
        <UploadPageClientLazy />
      </Suspense>
    </RequireAuth>
  );
}
