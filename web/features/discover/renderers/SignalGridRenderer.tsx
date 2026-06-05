"use client";

import Link from "next/link";

import { SignalCard } from "@/features/discover/cards/SignalCard";
import { EmptyState } from "@/components/states";
import type { FeedPost } from "@/features/feed/types";
import type { HomeEngagementHandlers } from "@/features/home/home-engagement";

type Props = {
  posts: FeedPost[];
  engagement: HomeEngagementHandlers;
};

export function SignalGridRenderer({ posts, engagement }: Props) {
  if (posts.length === 0) {
    return (
      <EmptyState
        title="Henüz sinyal yok"
        description="İlk sinyali sen oluştur!"
        actionLabel="Sinyal Oluştur"
        actionHref="/upload"
        tone="market"
        compact
      />
    );
  }

  return (
    <div className="hv-ref-discover-sec hv-ref-discover-sec--signals">
      <div className="hv-ref-discover-sec__head">
        <div className="min-w-0">
          <h2 className="hv-ref-discover-sec__title">Sinyal keşfi</h2>
          <p className="hv-ref-discover-sec__kicker">Analist tezleri ve seviye özeti — tam filtre ve kopya için pazara geçin.</p>
        </div>
        <Link
          href="/signals"
          className="inline-flex shrink-0 items-center rounded-md border border-[color-mix(in_srgb,var(--hv-sep)_80%,transparent)] bg-[color-mix(in_srgb,var(--hv-text)_5%,transparent)] px-3 py-2 text-[0.8125rem] font-semibold text-[var(--hv-text-2)] transition-colors hover:border-[color-mix(in_srgb,var(--hv-text)_18%,transparent)] hover:bg-[color-mix(in_srgb,var(--hv-text)_8%,transparent)] hover:text-[var(--hv-text)]"
        >
          Sinyal pazarına git
        </Link>
      </div>
      <ul className="discover-signal-intel-grid m-0 mt-[var(--hv-s-4)] grid list-none grid-cols-1 gap-2 p-0 lg:grid-cols-3">
        {posts.map((post, index) => (
          <li key={post.id} className="min-w-0">
            <SignalCard post={post} engagement={engagement} index={index} feedSurface="default" discoverIntel />
          </li>
        ))}
      </ul>
    </div>
  );
}
