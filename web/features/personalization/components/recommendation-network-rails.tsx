"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";

import { getPersonalizationRepository } from "@/features/personalization/repository";
import { usePersonalizationSnapshot } from "@/features/personalization/hooks/use-personalization-snapshot";
import type { RecommendationChip } from "@/features/personalization/domain/recommendation-network-bundle";
import { useSignalRecommendations } from "@/features/signals/hooks/use-signal-recommendations";
import { AlgoFlags } from "@/lib/algo-flags";
import { isMockDataEnabled } from "@/mock/config";
import { cn } from "@/lib/cn";

type Props = {
  viewerId: string | null;
  excludeCreatorId?: string | null;
  className?: string;
  /** Phase 1A — Home sağ şerit: ince liste, kart yok */
  ambient?: boolean;
  /** Phase 1C — Home: alt başlıkları gizle, Keşfet CTA */
  railHome?: boolean;
  /** Phase 1C — ambient modda üst sınır */
  maxAmbientItems?: number;
};

export function RecommendationNetworkRails({
  viewerId,
  excludeCreatorId = null,
  className,
  ambient = false,
  railHome = false,
  maxAmbientItems,
}: Props) {
  const mockOn = isMockDataEnabled();
  const cfOn = AlgoFlags.signalCollaborativeFilter;
  const active = mockOn || cfOn;
  const { rev: cfRev } = useSignalRecommendations();
  const snap = usePersonalizationSnapshot();
  const railLogged = useRef<string>("");

  const bundle = useMemo(() => {
    if (!active) return null;
    void snap.affinity.meta.eventCount;
    void snap.feedbackRev;
    void snap.explorationRev;
    void snap.watchRev;
    void snap.recommendRev;
    void snap.adaptiveRev;
    void cfRev;
    return getPersonalizationRepository().getRecommendationNetworkBundle(viewerId, { excludeCreatorId });
  }, [
    active,
    viewerId,
    excludeCreatorId,
    snap.affinity.meta.eventCount,
    snap.feedbackRev,
    snap.explorationRev,
    snap.watchRev,
    snap.recommendRev,
    snap.adaptiveRev,
    cfRev,
  ]);

  useEffect(() => {
    if (!active || !bundle) return;
    const hasAny =
      bundle.creator_follow.length +
        bundle.rising_creators.length +
        bundle.premium_analysts.length +
        bundle.similar_creators.length +
        bundle.related_topics.length +
        bundle.rising_communities.length +
        bundle.portfolio_themes.length +
        bundle.recommended_signals.length +
        bundle.signal_style_peers.length >
      0;
    if (!hasAny) return;
    const key = `${viewerId ?? ""}|${excludeCreatorId ?? ""}|${bundle.affinity_line}`;
    if (railLogged.current === key) return;
    railLogged.current = key;
    getPersonalizationRepository().recordAdaptiveLearning({
      type: "recommendation_rail_view",
      surface: "network_rails",
    });
  }, [active, bundle, viewerId, excludeCreatorId]);

  if (!active || !bundle) return null;

  const ambientCap = maxAmbientItems ?? (ambient ? 6 : 8);

  const allChips: RecommendationChip[] = [
    ...bundle.creator_follow,
    ...bundle.rising_creators,
    ...bundle.premium_analysts,
    ...bundle.similar_creators,
    ...bundle.related_topics,
    ...bundle.rising_communities,
    ...bundle.recommended_signals,
  ].slice(0, ambient ? ambientCap : 8);

  if (!allChips.length) return null;

  if (ambient) {
    return (
      <div className={cn("pb-0", className)}>
        <p className="ms-home-rail-overline">{railHome ? "Öneriler" : "İlgine yakın"}</p>
        <ul className="m-0 list-none space-y-2 p-0">
          {allChips.map((c, i) => (
            <li key={`${i}:${c.href}:${c.sub}`}>
              <Link href={c.href} className="group block py-0.5">
                <span className="line-clamp-2 text-[13px] font-semibold leading-snug text-[var(--color-text)] transition-colors group-hover:text-[var(--color-primary)]">
                  {c.label}
                </span>
                {!railHome && c.sub ? (
                  <span className="mt-0.5 block text-[12px] font-medium text-[var(--color-meta)]">{c.sub}</span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href={railHome ? "/discover" : "/subscriptions"}
          className="mt-2 inline-block text-[12px] font-semibold text-[var(--color-primary)] opacity-90 hover:opacity-100"
        >
          {railHome ? "Tümünü keşfet" : "Tümünü gör"}
        </Link>
      </div>
    );
  }

  return (
    <div className={cn("border-b border-[var(--color-divider)] pb-[var(--sp-2)]", className)}>
      <div className="mb-1.5 flex items-center gap-[var(--sp-2)]">
        <span className="text-[11px] font-semibold text-[var(--color-meta)]">İlgine yakın</span>
        <Link href="/subscriptions" className="ml-auto text-[10px] font-semibold text-[var(--color-primary-dark)] hover:underline">
          Tümü
        </Link>
      </div>
      <div className="flex min-w-0 flex-wrap gap-1.5">
        {allChips.map((c, i) => (
          <Link
            key={`${i}:${c.href}:${c.sub}`}
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
