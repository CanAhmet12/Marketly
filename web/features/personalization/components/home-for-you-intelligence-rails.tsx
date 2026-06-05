"use client";

import Link from "next/link";
import { useMemo } from "react";

import { cn } from "@/lib/cn";
import { getMarketsRepository } from "@/features/markets/repository";
import { usePersonalizationSnapshot } from "@/features/personalization/hooks/use-personalization-snapshot";
import { getSignalsRepository } from "@/features/signals/repository";
import { getSocialRepository } from "@/features/social/repository";
import { isMockDataEnabled } from "@/mock/config";

type Props = {
  viewerId: string | null;
  /** Sağ şerit: alt çizgi yok — slot ayırıcıları yeter */
  embedded?: boolean;
  /** Phase 1C — düz liste, chip yok */
  minimal?: boolean;
  /** Tartışma ayrı rayda gösteriliyorsa aynı başlıkları tekrarlama */
  omitDiscussions?: boolean;
};

function humanSub(sub: string): string {
  const m: Record<string, string> = {
    Tartışma: "toplulukta",
    İzleme: "izleme listende",
    Sinyal: "sinyal",
    Çağrı: "çağrı",
  };
  return m[sub] ?? sub;
}

/** Kompakt “Senin için” — tartışma + sinyal + tema; repository kaynaklı */
export function HomeForYouIntelligenceRails({
  viewerId,
  embedded = false,
  minimal = false,
  omitDiscussions = false,
}: Props) {
  const mockOn = isMockDataEnabled();
  const snap = usePersonalizationSnapshot();

  const bundle = useMemo(() => {
    if (!mockOn) return null;
    void snap.affinity.meta.eventCount;
    void snap.intel.coldStart;
    void snap.feedbackRev;
    void snap.explorationRev;
    void snap.watchRev;
    void snap.recommendRev;
    void snap.adaptiveRev;
    const m = getMarketsRepository();
    const watched = m.getWatchlistSeed() ?? [];
    const port = m.getPortfolioIntelligenceBundle().portfolioSymbols;
    const disc = getSocialRepository().getPersonalizedDiscussionRecommendations(
      {
        viewerId,
        watchedSymbols: watched,
        portfolioSymbols: port,
        followedCreatorIds: [],
      },
      snap.affinity,
    );
    const sig = getSignalsRepository().getPersonalizedSignalRelevance(watched, port, snap.affinity);
    return { disc, sig, intel: snap.intel };
  }, [
    mockOn,
    viewerId,
    snap.affinity,
    snap.intel,
    snap.feedbackRev,
    snap.explorationRev,
    snap.watchRev,
    snap.recommendRev,
    snap.adaptiveRev,
  ]);

  if (!mockOn || !bundle) return null;

  const links: { href: string; label: string; sub: string }[] = [];
  if (!omitDiscussions) {
    const d0 = bundle.disc.for_you[0];
    const d1 = bundle.disc.watchlist[0];
    if (d0) links.push({ href: d0.href, label: d0.label, sub: "Tartışma" });
    if (d1 && d1.href !== d0?.href) links.push({ href: d1.href, label: d1.label, sub: "İzleme" });
  }
  const s0 = bundle.sig.rows[0];
  const s1 = bundle.sig.rows[1];
  if (s0) links.push({ href: s0.href, label: `${s0.symbol} · ${s0.analystDisplay}`, sub: "Sinyal" });
  if (s1 && s1.id !== s0?.id) links.push({ href: s1.href, label: `${s1.symbol}`, sub: "Çağrı" });

  if (!links.length) {
    return null;
  }

  if (minimal) {
    return (
      <ul className="m-0 mt-1.5 list-none space-y-1 border-0 p-0">
        {links.slice(0, 2).map((x) => (
          <li key={`${x.href}-${x.sub}`}>
            <Link href={x.href} className="block text-[13px] font-medium leading-snug text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-primary)]">
              <span className="font-semibold text-[var(--color-text)]">{x.label}</span>
              <span className="text-[12px] font-normal text-[var(--color-meta)]"> · {humanSub(x.sub)}</span>
            </Link>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div
      className={cn(
        "flex min-w-0 flex-wrap gap-1.5 pb-[var(--sp-2)]",
        embedded ? "" : "border-b border-[var(--color-divider)]",
      )}
    >
      {links.slice(0, 4).map((x) => (
        <Link
          key={`${x.href}-${x.sub}`}
          href={x.href}
          className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1 text-[11px] font-semibold text-[var(--color-text)] transition hover:border-[color-mix(in_srgb,var(--color-primary)_35%,var(--color-border))]"
        >
          <span className="shrink-0 text-[9px] font-bold uppercase tracking-wide text-[var(--color-meta)]">{x.sub}</span>
          <span className="truncate">{x.label}</span>
        </Link>
      ))}
    </div>
  );
}
