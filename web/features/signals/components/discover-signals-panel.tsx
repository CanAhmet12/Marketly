"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { UnifiedSignalCompactCard } from "@/features/signals/components/unified-signal-primitives";
import { SignalsAnalystLeaderboards } from "@/features/signals/components/signals-analyst-leaderboards";
import { SignalsMarketIntelStrip } from "@/features/signals/components/signals-market-intel-strip";
import { SignalsMarketplaceRails } from "@/features/signals/components/signals-marketplace-rails";
import { useSignalsCatalog } from "@/features/signals/hooks/use-signals-catalog";

const COMMUNITY_RAIL_IDS = new Set([
  "active_discussions",
  "most_debated_signals",
  "creator_thread_updates",
  "community_sentiment_split",
]);

/** Keşfet `tab=signals` — pazar ile aynı görsel dil; tam filtre için `/signals` */
export function DiscoverSignalsPanel() {
  const router = useRouter();
  const { rows, rails, leaderboardSections, marketIntel, mockOn } = useSignalsCatalog();

  const orderedRows = useMemo(() => rows.slice(0, 18), [rows]);

  const spotlightRails = useMemo(() => {
    const community = rails.filter((rail) => COMMUNITY_RAIL_IDS.has(rail.id));
    if (community.length >= 2) return community.slice(0, 2);
    return rails.slice(0, 2);
  }, [rails]);

  const leaderboardPreview = useMemo(() => leaderboardSections.slice(0, 2), [leaderboardSections]);

  return (
    <div className="mt-[var(--sp-3)] space-y-[var(--sp-4)]">
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-[var(--sp-3)] py-[var(--sp-3)]">
        <p className="text-[13px] font-semibold text-[var(--color-text)]">Trend sinyaller</p>
        <p className="mt-1 text-[12px] font-medium leading-relaxed text-[var(--color-text-secondary)]">
          Keşfet — yoğun özet. Filtreler, kopyala/kaydet ve tam liste için sinyal pazarına geçin.
        </p>
        <div className="mt-[var(--sp-3)] flex flex-wrap gap-[var(--sp-2)]">
          <Link
            href="/signals"
            className="rounded-full bg-[var(--color-primary)] px-[var(--sp-4)] py-[var(--sp-2)] text-[12px] font-bold text-[var(--color-chip-active-text)]"
          >
            Sinyal pazarı
          </Link>
          <Link
            href="/discover?tab=trending"
            className="rounded-full border border-[var(--color-border)] px-[var(--sp-4)] py-[var(--sp-2)] text-[12px] font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
          >
            Genel trend
          </Link>
        </div>
      </div>

      <SignalsMarketIntelStrip intel={marketIntel} className="mt-[var(--sp-3)]" />

      {leaderboardPreview.length ? (
        <div className="mt-[var(--sp-3)]">
          <SignalsAnalystLeaderboards sections={leaderboardPreview} maxSections={2} />
        </div>
      ) : null}

      {spotlightRails.length ? (
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] px-[var(--sp-2)] py-[var(--sp-3)]">
          <SignalsMarketplaceRails
            rails={spotlightRails}
            onOpen={(row) => {
              void router.push(`/signals?asset=${encodeURIComponent(row.symbol)}`);
            }}
          />
        </div>
      ) : null}

      {orderedRows.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-[var(--sp-4)] py-[var(--sp-6)] text-center">
          <p className="text-[14px] font-semibold text-[var(--color-text)]">Sinyal önizlemesi yok</p>
          <p className="mt-1 text-[13px] font-medium text-[var(--color-muted)]">
            {mockOn ? "Mock kapalı veya katalog boş." : "Canlı sinyal verisi bağlandığında burada listelenir."}
          </p>
          <Link href="/signals" className="mt-3 inline-block text-[13px] font-bold text-[var(--color-primary-dark)] hover:underline">
            Pazara git
          </Link>
        </div>
      ) : (
      <ul className="m-0 flex list-none flex-col gap-[var(--sp-3)] p-0">
        {orderedRows.map((row) => (
          <li key={row.id} className="min-w-0">
            <UnifiedSignalCompactCard
              row={row}
              onActivate={() => {
                void router.push(`/signals?asset=${encodeURIComponent(row.symbol)}`);
              }}
              footerRight={
                <Link
                  href={`/signals?asset=${encodeURIComponent(row.symbol)}`}
                  className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] px-[var(--sp-3)] py-2 text-[12px] font-bold text-[var(--color-primary-dark)]"
                  onClick={(e) => e.stopPropagation()}
                >
                  Pazarda aç
                </Link>
              }
            />
          </li>
        ))}
      </ul>
      )}
    </div>
  );
}
