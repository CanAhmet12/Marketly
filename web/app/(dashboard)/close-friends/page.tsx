import type { Metadata } from "next";
import { Suspense } from "react";

import { CloseFriendsPageClient } from "@/features/social/close-friends-page-client";
import { CloseFriendsPageSkeleton } from "@/features/social/components/social-states";
import { OG_SITE_DEFAULTS, siteCanonical } from "@/lib/seo/metadata-helpers";

export const metadata: Metadata = {
  ...siteCanonical("/close-friends"),
  title: "Yakın Arkadaşlar — Marketly",
  description: "Özel daireler, güven katmanı ve dar çevre toplulukları.",
  openGraph: {
    ...OG_SITE_DEFAULTS,
    title: "Yakın Arkadaşlar — Marketly",
    description: "Özel daireler, güven katmanı ve dar çevre toplulukları.",
  },
};

export default function CloseFriendsPage() {
  return (
    <Suspense fallback={<CloseFriendsPageSkeleton />}>
      <CloseFriendsPageClient />
    </Suspense>
  );
}
