"use client";

import Link from "next/link";
import { useMemo } from "react";

import { usePersonalizationSnapshot } from "@/features/personalization/hooks/use-personalization-snapshot";
import { getPersonalizationRepository } from "@/features/personalization/repository";
import { useClientMountReady } from "@/hooks/use-client-mount-ready";
import { isMockDataEnabled } from "@/mock/config";

type Props = {
  viewerId: string | null;
};

export function DiscoverExplorePersonalizationRails({ viewerId }: Props) {
  const mockOn = isMockDataEnabled();
  const clientReady = useClientMountReady();
  const snap = usePersonalizationSnapshot();

  const surface = useMemo(() => {
    if (!mockOn) return null;
    void snap.affinity.meta.eventCount;
    void snap.feedbackRev;
    void snap.explorationRev;
    void snap.watchRev;
    void snap.recommendRev;
    void snap.adaptiveRev;
    void snap.intel.confidenceLabel;
    return getPersonalizationRepository().getDiscoverExploreSurface(viewerId);
  }, [
    mockOn,
    viewerId,
    snap.affinity.meta.eventCount,
    snap.feedbackRev,
    snap.explorationRev,
    snap.watchRev,
    snap.recommendRev,
    snap.adaptiveRev,
    snap.intel.confidenceLabel,
  ]);

  if (!mockOn || !surface) return null;

  // getDiscoverExploreSurface pulls markets/social/watchlist; those read localStorage on the client
  // but not during SSR — defer chips until mount so hydration matches server HTML (empty strip).
  if (!clientReady) return null;

  const chips = [
    ...surface.new_discoveries,
    ...surface.near_interest,
    ...surface.rising_topics,
    ...surface.unfollowed_suggestions,
    ...surface.portfolio_linked,
    ...surface.watchlist_linked,
    ...surface.similar_creators,
  ].slice(0, 8);

  if (!chips.length) return null;

  return (
    <div className="border-b border-[var(--color-divider)] pb-[var(--sp-2)]">
      <div className="mb-1.5 flex items-center gap-[var(--sp-2)]">
        <span className="text-[11px] font-semibold text-[var(--color-meta)]">Senin için keşfet</span>
      </div>
      <div className="flex min-w-0 flex-wrap gap-1.5">
        {chips.map((c, i) => (
          <Link
            key={`${i}:${c.href}:${c.label}:${c.sub}`}
            href={c.href}
            className="inline-flex max-w-[14rem] items-baseline gap-1 truncate rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1 text-[11px] font-semibold text-[var(--color-text)] transition hover:border-[color-mix(in_srgb,var(--color-primary)_35%,var(--color-border))]"
          >
            <span className="truncate">{c.label}</span>
            {c.sub ? <span className="shrink-0 text-[9px] font-medium text-[var(--color-meta)]">{c.sub}</span> : null}
          </Link>
        ))}
      </div>
    </div>
  );
}
