"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo } from "react";

import { useAuth } from "@/features/auth/use-auth";
import { getMarketsRepository } from "@/features/markets/repository";
import { usePersonalizationSnapshot } from "@/features/personalization/hooks/use-personalization-snapshot";
import { trackRecommendationClick } from "@/features/personalization/tracking";
import { getSocialRepository } from "@/features/social/repository";
import type { PersonalizedDiscussionRow } from "@/features/social/repository/discussion-discovery-types";
import { isMockDataEnabled } from "@/mock/config";

function personalizedColumn(title: string, rows: PersonalizedDiscussionRow[]): ReactNode {
  if (!rows.length) return null;
  return (
    <div className="min-w-0 flex-1 sm:min-w-[200px]">
      <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-meta)]">{title}</p>
      <ul className="mt-1.5 m-0 list-none space-y-1 p-0">
        {rows.slice(0, 3).map((r) => (
          <li key={r.id}>
            <Link
              href={r.href}
              onClick={() => trackRecommendationClick("discussion_rail_column")}
              className="block rounded-md px-1 py-0.5 hover:bg-[var(--color-surface-hover)]"
            >
              <span className="line-clamp-2 text-[12px] font-semibold text-[var(--color-text)]">{r.label}</span>
              <span className="mt-0.5 flex flex-wrap items-center gap-1 text-[10px] text-[var(--color-meta)]">
                <span className="tabular-nums font-semibold text-[var(--color-primary-dark)]">{r.score_label}</span>
                <span>· {r.relevance_reason}</span>
              </span>
              <span className="block text-[10px] text-[var(--color-text-secondary)]">{r.sub}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

type RailProps = {
  /** Phase 1A — Home sağ şerit: kart yerine ince liste */
  ambient?: boolean;
};

/** Ana sayfa — kişiselleştirilmiş tartışma önerileri (SocialRepository + MarketsRepository). */
export function DiscussionPersonalizedRail({ ambient = false }: RailProps) {
  const { user, isInitialized } = useAuth();
  const mockOn = isMockDataEnabled();
  const snap = usePersonalizationSnapshot();

  const pack = useMemo(() => {
    if (!isInitialized || !mockOn) return null;
    const m = getMarketsRepository();
    const watched = m.getWatchlistSeed() ?? [];
    const port = m.getPortfolioIntelligenceBundle().portfolioSymbols;
    return getSocialRepository().getPersonalizedDiscussionRecommendations(
      {
        viewerId: user?.id ?? null,
        watchedSymbols: watched,
        portfolioSymbols: port,
        followedCreatorIds: [],
      },
      snap.affinity,
    );
  }, [isInitialized, mockOn, user?.id, snap.affinity]);

  if (!mockOn || !pack) return null;

  if (ambient) {
    const rows = [...pack.for_you, ...pack.watchlist, ...pack.portfolio].filter(Boolean).slice(0, 3);
    if (!rows.length) {
      if (snap.intel.coldStart) return null;
      return (
        <div>
          <p className="ms-home-rail-overline">Bugün konuşulanlar</p>
          <p className="line-clamp-2 text-[13px] font-medium leading-snug text-[var(--color-text-secondary)]">{snap.intel.subline}</p>
        </div>
      );
    }
    return (
      <div>
        <p className="ms-home-rail-overline">Bugün konuşulanlar</p>
        <ul className="m-0 list-none space-y-1 p-0">
          {rows.map((r) => (
            <li key={r.id}>
              <Link
                href={r.href}
                onClick={() => trackRecommendationClick("discussion_rail_ambient")}
                className="block rounded-md py-0.5 text-[13px] font-semibold leading-snug text-[var(--color-text)] transition-colors hover:text-[var(--color-primary)]"
              >
                <span className="line-clamp-2">{r.label}</span>
                <span className="mt-0.5 block line-clamp-1 text-[12px] font-medium text-[var(--color-meta)]">{r.sub}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const has =
    pack.for_you.length +
      pack.watchlist.length +
      pack.followed_creators.length +
      pack.portfolio.length +
      pack.topic_suggestions.length >
    0;
  if (!has) {
    const intel = snap.intel;
    return (
      <section className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-3 text-[12px] text-[var(--color-muted)]">
        <p className="font-semibold text-[var(--color-text-secondary)]">{intel.headline}</p>
        <p className="mt-1 leading-snug">{intel.subline}</p>
      </section>
    );
  }

  return (
    <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-text)_2%,var(--color-surface))] p-3 shadow-[var(--shadow-card)] sm:p-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-meta)]">Sana yakın tartışmalar</p>
          <p className="mt-0.5 text-[12px] font-medium text-[var(--color-text-secondary)]">İzleme, portföy ve takip grafiği — yüksek sinyal sıralama.</p>
        </div>
        <Link href="/discover" className="text-[11px] font-semibold text-[var(--color-primary-dark)] hover:underline">
          Keşfet
        </Link>
      </div>
      <div className="mt-3 flex flex-col gap-4 min-[640px]:flex-row min-[640px]:flex-wrap">
        {personalizedColumn("Öne çıkan", pack.for_you)}
        {personalizedColumn("İzleme listesi", pack.watchlist)}
        {personalizedColumn("Takip ettiklerin", pack.followed_creators)}
        {personalizedColumn("Portföy", pack.portfolio)}
      </div>
      {pack.topic_suggestions.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5 border-t border-[var(--color-divider)] pt-3">
          {pack.topic_suggestions.map((t) => (
            <Link
              key={t.id}
              href={t.href}
              className="inline-flex max-w-full truncate rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] px-2.5 py-1 text-[11px] font-semibold text-[var(--color-text)] hover:border-[var(--color-primary)]/35"
            >
              {t.label}
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}
