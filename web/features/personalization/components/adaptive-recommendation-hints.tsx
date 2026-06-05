"use client";

import { useMemo } from "react";

import { cn } from "@/lib/cn";
import { usePersonalizationSnapshot } from "@/features/personalization/hooks/use-personalization-snapshot";
import { getPersonalizationRepository } from "@/features/personalization/repository";
import { useClientMountReady } from "@/hooks/use-client-mount-ready";

type Props = {
  viewerId: string | null;
  className?: string;
};

export function AdaptiveRecommendationHints({ viewerId, className }: Props) {
  const clientReady = useClientMountReady();
  const snap = usePersonalizationSnapshot();

  const profile = useMemo(() => {
    void snap.adaptiveRev;
    void snap.recommendRev;
    void snap.feedbackRev;
    void snap.explorationRev;
    void snap.watchRev;
    void snap.affinity.meta.eventCount;
    void snap.affinity.meta.confidence;
    return getPersonalizationRepository().getRecommendationAdaptationSnapshot(viewerId);
  }, [
    viewerId,
    snap.adaptiveRev,
    snap.recommendRev,
    snap.feedbackRev,
    snap.explorationRev,
    snap.watchRev,
    snap.affinity.meta.eventCount,
    snap.affinity.meta.confidence,
  ]);

  // getRecommendationAdaptationSnapshot reads adaptive / LS; defer until mount so SSR === first client paint
  if (!clientReady) return null;
  if (!profile.hints.length && !profile.subline) return null;

  return (
    <div
      className={cn(
        "flex min-w-0 flex-wrap items-baseline gap-x-[var(--sp-3)] gap-y-0.5 border-b border-[var(--color-divider)] pb-[var(--sp-2)]",
        className,
      )}
      aria-label="Akış bağlamı"
    >
      <span className="shrink-0 text-[11px] font-medium text-[var(--color-meta)]">{profile.subline}</span>
      {profile.hints.slice(0, 2).map((h) => (
        <span key={h} className="shrink-0 text-[11px] font-medium text-[var(--color-text-secondary)]">
          {h}
        </span>
      ))}
    </div>
  );
}
