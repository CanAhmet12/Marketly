"use client";

import Link from "next/link";

import { MarketIntelSection } from "@/features/markets/components/market-intel-section";
import type { AssetIntelligenceBundle } from "@/features/markets/types/asset-intelligence";

type Props = { bundle: AssetIntelligenceBundle };

function consensusLabel(c: AssetIntelligenceBundle["assetSignalCommunity"]["analystConsensus"]) {
  if (c === "bullish") return "Boğa eğilimli";
  if (c === "bearish") return "Ayı eğilimli";
  return "Karışık konsensüs";
}

export function AssetDetailSignalCommunity({ bundle }: Props) {
  const { asset, assetSignalCommunity: p, signals } = bundle;
  const sym = asset.symbol;
  const sp = p.sentimentParticipation;
  const tot = Math.max(1, sp.bull + sp.bear + sp.neutral);

  return (
    <MarketIntelSection
      title="Sinyal topluluğu"
      description="Thread yoğunluğu, yanıt hızı ve analist konsensüsü — varlık merkezli tartışma hissi."
      bodyClassName="px-0 pb-0 pt-0"
    >
      <div className="flex min-w-0 flex-col gap-[var(--sp-3)] px-[var(--sp-3)] py-[var(--sp-3)]">
        <p className="text-[12px] font-semibold leading-snug text-[var(--color-text)]">{p.trendingSnippet}</p>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-[color-mix(in_srgb,var(--color-rise)_12%,transparent)] px-2 py-0.5 text-[10px] font-bold tabular-nums text-[color-mix(in_srgb,var(--color-rise)_88%,var(--color-text)_12%)] ring-1 ring-[color-mix(in_srgb,var(--color-rise)_35%,transparent)]">
            Boğa {sp.bull}
          </span>
          <span className="rounded-full bg-[color-mix(in_srgb,var(--color-fall)_12%,transparent)] px-2 py-0.5 text-[10px] font-bold tabular-nums text-[color-mix(in_srgb,var(--color-fall)_88%,var(--color-text)_12%)] ring-1 ring-[color-mix(in_srgb,var(--color-fall)_35%,transparent)]">
            Ayı {sp.bear}
          </span>
          <span className="rounded-full bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] px-2 py-0.5 text-[10px] font-semibold tabular-nums text-[var(--color-text-secondary)] ring-1 ring-[var(--ms-border-hairline)]">
            Nötr {sp.neutral}
          </span>
          <span className="rounded-full bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] px-2 py-0.5 text-[10px] font-bold text-[var(--color-primary-dark)] ring-1 ring-[var(--color-primary)]/25">
            {consensusLabel(p.analystConsensus)}
          </span>
        </div>
        <div className="grid gap-2 text-[11px] font-semibold text-[var(--color-text-secondary)] min-[480px]:grid-cols-3">
          <div className="rounded-lg border border-[var(--ms-border-hairline)] bg-[color-mix(in_srgb,var(--color-text)_3%,var(--color-surface))] px-2 py-1.5">
            <p className="text-[9px] font-bold uppercase tracking-wide text-[var(--color-meta)]">Thread satırı</p>
            <p className="mt-0.5 tabular-nums text-[var(--color-text)]">{p.activeThreadPosts}</p>
          </div>
          <div className="rounded-lg border border-[var(--ms-border-hairline)] bg-[color-mix(in_srgb,var(--color-text)_3%,var(--color-surface))] px-2 py-1.5">
            <p className="text-[9px] font-bold uppercase tracking-wide text-[var(--color-meta)]">Sıcak çağrı</p>
            <p className="mt-0.5 tabular-nums text-[var(--color-text)]">{p.hotSignalsCount}</p>
          </div>
          <div className="rounded-lg border border-[var(--ms-border-hairline)] bg-[color-mix(in_srgb,var(--color-text)_3%,var(--color-surface))] px-2 py-1.5">
            <p className="text-[9px] font-bold uppercase tracking-wide text-[var(--color-meta)]">24s yanıt hızı</p>
            <p className="mt-0.5 tabular-nums text-[var(--color-text)]">{p.replyVelocity24h}</p>
          </div>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)]">
          <div className="flex h-full w-full">
            <div className="h-full bg-[color-mix(in_srgb,var(--color-rise)_62%,var(--color-rise))]" style={{ width: `${(sp.bull / tot) * 100}%` }} />
            <div className="h-full bg-[color-mix(in_srgb,var(--color-fall)_58%,var(--color-fall))]" style={{ width: `${(sp.bear / tot) * 100}%` }} />
            <div className="h-full bg-[color-mix(in_srgb,var(--color-meta)_45%,var(--color-surface))]" style={{ width: `${(sp.neutral / tot) * 100}%` }} />
          </div>
        </div>
        {signals.length ? (
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--ms-border-hairline)] pt-2">
            <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-meta)]">Öne çıkan çağrılar</p>
            <Link href={`/signals?asset=${encodeURIComponent(sym)}`} className="text-[11px] font-bold text-[var(--color-primary-dark)] hover:underline">
              Tümü →
            </Link>
          </div>
        ) : null}
        <ul className="m-0 flex max-h-[140px] list-none flex-col gap-1.5 overflow-y-auto overflow-x-hidden p-0">
          {signals.slice(0, 4).map((r) => (
            <li key={r.id} className="min-w-0">
              <Link
                href={`/signals?asset=${encodeURIComponent(sym)}`}
                className="flex min-w-0 flex-wrap items-center gap-2 rounded-lg border border-transparent px-1 py-0.5 text-[11px] font-semibold text-[var(--color-text)] hover:border-[var(--ms-border-hairline)] hover:bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]"
              >
                <span className="truncate">{r.analyst.display}</span>
                <span className="shrink-0 tabular-nums text-[var(--color-meta)]">%{r.confidence}</span>
                {r.discussion_active ? (
                  <span className="shrink-0 rounded bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] px-1 text-[9px] font-bold text-[var(--color-primary-dark)]">
                    Tartışma
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </MarketIntelSection>
  );
}
