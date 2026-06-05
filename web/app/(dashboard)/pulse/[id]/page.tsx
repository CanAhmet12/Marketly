import type { Metadata } from "next";
import { Suspense } from "react";

import { PulsePlayerClient } from "@/features/pulse/pulse-player-client";
import { PulsePlayerSkeleton } from "@/features/pulse/pulse-player-skeleton";
import { OG_SITE_DEFAULTS, siteCanonical } from "@/lib/seo/metadata-helpers";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    ...siteCanonical(`/pulse/${id}`),
    title: "Pulse — Marketly",
    description: "Kısa form piyasa içeriği — dikey Pulse oynatıcı.",
    openGraph: {
      ...OG_SITE_DEFAULTS,
      title: "Pulse — Marketly",
      description: "Kısa form piyasa içeriği.",
    },
  };
}

function PulsePlayerFallback() {
  return <PulsePlayerSkeleton />;
}

export default async function PulsePlayerPage({ params }: Props) {
  const { id } = await params;
  return (
    <Suspense fallback={<PulsePlayerFallback />}>
      <PulsePlayerClient postId={id} />
    </Suspense>
  );
}
