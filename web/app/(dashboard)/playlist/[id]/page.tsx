import type { Metadata } from "next";
import { Suspense } from "react";

import { PlaylistPageClient } from "@/features/watch/playlist-page-client";
import { PlaylistPageSkeleton } from "@/features/playlists/playlist-page-skeleton";
import { OG_SITE_DEFAULTS, siteCanonical } from "@/lib/seo/metadata-helpers";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ play?: string | string[] }>;
};

export const metadata: Metadata = {
  ...siteCanonical("/playlist"),
  title: "Oynatma listesi — Marketly",
  description: "Küratörlü video koleksiyonu ve izleme sırası.",
  openGraph: {
    ...OG_SITE_DEFAULTS,
    title: "Oynatma listesi — Marketly",
    description: "Küratörlü video koleksiyonu ve izleme sırası.",
  },
};

export default async function PlaylistPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const raw = sp.play;
  const playingId = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : null;
  let decoded = id;
  try {
    decoded = decodeURIComponent(id);
  } catch {
    decoded = id;
  }
  return (
    <Suspense fallback={<PlaylistPageSkeleton />}>
      <PlaylistPageClient playlistId={decoded} playingId={playingId} />
    </Suspense>
  );
}
