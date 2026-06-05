import type { Metadata } from "next";
import { Suspense } from "react";

import { SubscriptionsHubClient } from "@/features/subscriptions/subscriptions-hub-client";
import { SubscriptionsPageSkeleton } from "@/features/social/components/social-states";
import { OG_SITE_DEFAULTS, siteCanonical } from "@/lib/seo/metadata-helpers";

export const metadata: Metadata = {
  ...siteCanonical("/subscriptions"),
  title: "Abonelikler — Marketly",
  description: "Creator üyelikleri, premium planlar ve erişim kademeleri.",
  openGraph: {
    ...OG_SITE_DEFAULTS,
    title: "Abonelikler — Marketly",
    description: "Creator üyelikleri, premium planlar ve erişim kademeleri.",
  },
};

export default function SubscriptionsPage() {
  return (
    <Suspense fallback={<SubscriptionsPageSkeleton />}>
      <SubscriptionsHubClient />
    </Suspense>
  );
}
