import type { Metadata } from "next";
import { Suspense } from "react";

import { PrivateCircleDetailClient } from "@/features/close-friends/private-circle-detail-client";
import { CircleDetailSkeleton } from "@/features/close-friends/components/close-friends-states";
import { OG_SITE_DEFAULTS, siteCanonical } from "@/lib/seo/metadata-helpers";

export const metadata: Metadata = {
  ...siteCanonical("/close-friends"),
  title: "Özel Daire — Marketly",
  description: "Davetli çember, özel akış ve daire istihbaratı.",
  openGraph: {
    ...OG_SITE_DEFAULTS,
    title: "Özel Daire — Marketly",
    description: "Davetli çember, özel akış ve daire istihbaratı.",
  },
};

type Props = { params: Promise<{ circleId: string }> };

export default async function HubPrivateCirclePage({ params }: Props) {
  const { circleId } = await params;
  return (
    <Suspense fallback={<CircleDetailSkeleton />}>
      <PrivateCircleDetailClient circleId={decodeURIComponent(circleId)} />
    </Suspense>
  );
}
