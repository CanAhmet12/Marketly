import type { Metadata } from "next";
import { Suspense } from "react";

import { MembershipDetailClient } from "@/features/subscriptions/membership-detail-client";
import { MembershipDetailSkeleton } from "@/features/social/components/social-states";
import { OG_SITE_DEFAULTS, siteCanonical } from "@/lib/seo/metadata-helpers";

export const metadata: Metadata = {
  ...siteCanonical("/subscriptions"),
  title: "Üyelik Detayı — Marketly",
  description: "Creator üyelik planı, kilitler ve erişim özeti.",
  openGraph: {
    ...OG_SITE_DEFAULTS,
    title: "Üyelik Detayı — Marketly",
    description: "Creator üyelik planı, kilitler ve erişim özeti.",
  },
};

type Props = { params: Promise<{ creatorId: string }> };

export default async function MembershipDetailPage({ params }: Props) {
  const { creatorId } = await params;
  return (
    <Suspense fallback={<MembershipDetailSkeleton />}>
      <MembershipDetailClient creatorId={decodeURIComponent(creatorId)} />
    </Suspense>
  );
}
