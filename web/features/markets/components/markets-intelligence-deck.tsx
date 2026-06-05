"use client";

import Link from "next/link";

import { MarketIntelSection } from "@/features/markets/components/market-intel-section";
import { changePercentTextClass, formatSignedChangePercent } from "@/features/markets/lib/market-display";
import type { MarketIntelMoverRow, MarketsIntelligenceSurface } from "@/features/markets/types/markets-intelligence";
import { cn } from "@/lib/cn";

type Props = {
  intelligence: MarketsIntelligenceSurface;
};

function MoverCol({ title, rows }: { title: string; rows: readonly MarketIntelMoverRow[] }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--color-meta)]">{title}</p>
      <ul className="mt-[var(--sp-2)] space-y-1.5">
        {rows.length === 0 ? (
          <li className="text-[12px] font-medium text-[var(--color-meta)]">—</li>
        ) : (
          rows.map((m) => (
            <li key={`${title}-${m.symbol}`} className="flex items-center justify-between gap-[var(--sp-2)] text-[12px] font-semibold">
              <Link href={`/markets/${encodeURIComponent(m.symbol)}`} className="min-w-0 truncate text-[var(--color-text)] hover:text-[var(--color-primary-dark)] hover:underline">
                {m.symbol}
              </Link>
              <span className={cn("markets-mono shrink-0 tabular-nums", changePercentTextClass(m.change_percent))}>
                {formatSignedChangePercent(m.change_percent)}
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export function MarketsIntelligenceDeck({ intelligence }: Props) {
  const { movers, signalHeat, analystAttention } = intelligence;
  const bias =
    signalHeat.marketBias === "bullish" ? "Alıcı bias" : signalHeat.marketBias === "bearish" ? "Satıcı bias" : "Dengeli bias";

  return (
    <div className="grid min-w-0 gap-[var(--sp-3)] min-[960px]:grid-cols-12">
      <div className="min-w-0 min-[960px]:col-span-7">
        <MarketIntelSection
          title="Hareket haritası"
          description="Gainer / loser, hacim, volatilite ve sinyal yoğunluğu — kompakt satırlar."
          bodyClassName="p-[var(--sp-3)]"
        >
          <div className="grid grid-cols-2 gap-[var(--sp-4)] min-[640px]:grid-cols-4">
            <MoverCol title="Yükselenler" rows={movers.gainers} />
            <MoverCol title="Düşenler" rows={movers.losers} />
            <MoverCol title="Hacim" rows={movers.highVolume} />
            <MoverCol title="Volatilite" rows={movers.highVolatility} />
            <MoverCol title="Sinyal ısısı" rows={movers.signalHeat} />
            <MoverCol title="Analist odağı" rows={movers.analystAttention} />
          </div>
        </MarketIntelSection>
      </div>

      <div className="flex min-w-0 flex-col gap-[var(--sp-3)] min-[960px]:col-span-5">
        <MarketIntelSection
          title="Sinyal istihbaratı"
          description="Sinyaller deposu ile hizalı özet — UI içinde tekrar hesap yok."
          headerAside={
            <Link href="/signals" className="text-[11px] font-bold text-[var(--color-primary-dark)] hover:underline">
              Sinyallere git
            </Link>
          }
          bodyClassName="p-[var(--sp-3)]"
        >
          <div className="flex flex-wrap items-center gap-[var(--sp-2)] text-[12px] font-semibold text-[var(--color-text-secondary)]">
            <span>{bias}</span>
            <span className="text-[var(--color-border)]">·</span>
            <span className="markets-mono text-[var(--color-text)]">Bull {signalHeat.bullPct}%</span>
            <span className="markets-mono text-[var(--color-text)]">Bear {signalHeat.bearPct}%</span>
            <span className="text-[var(--color-border)]">·</span>
            <span>{signalHeat.activeDebateAssetCount} tartışmalı varlık</span>
          </div>
          <p className="mt-2 text-[12px] font-medium leading-snug text-[var(--color-text-secondary)]">
            {signalHeat.momentumLabel} · {signalHeat.themeAcceleration}
          </p>
          <div className="mt-[var(--sp-3)] h-1.5 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--color-border)_55%,transparent)]">
            <div
              className="h-full rounded-full bg-[color-mix(in_srgb,var(--color-rise)_70%,var(--color-text)_10%)]"
              style={{ width: `${Math.min(100, Math.max(8, signalHeat.bullPct))}%` }}
            />
          </div>
          <ul className="mt-[var(--sp-3)] space-y-2">
            {signalHeat.topByActiveSignals.length === 0 ? (
              <li className="text-[12px] text-[var(--color-meta)]">Aktif sinyal yoğunluğu yok</li>
            ) : (
              signalHeat.topByActiveSignals.map((r) => (
                <li key={r.symbol} className="flex flex-wrap items-center gap-x-[var(--sp-3)] gap-y-1 text-[12px]">
                  <Link href={`/markets/${encodeURIComponent(r.symbol)}`} className="font-bold text-[var(--color-text)] hover:underline">
                    {r.symbol}
                  </Link>
                  <span className="text-[var(--color-text-secondary)]">{r.name}</span>
                  <span className="rounded-full bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-text)]">
                    {r.activeSignals} aktif
                  </span>
                  <span className="text-[var(--color-meta)]">Bull {r.bullPct}%</span>
                  <span className="text-[var(--color-meta)]">Güven {r.convictionScore}</span>
                  <span className="text-[var(--color-meta)]">Tartışma {r.discussionScore}</span>
                  <span className="text-[var(--color-meta)]">Kopya {r.copyScore}</span>
                  <span className="text-[var(--color-meta)]">Premium %{r.premiumAnalystPct}</span>
                  <Link href={`/signals?asset=${encodeURIComponent(r.symbol)}`} className="ml-auto text-[11px] font-bold text-[var(--color-primary-dark)] hover:underline">
                    Akış
                  </Link>
                </li>
              ))
            )}
          </ul>
        </MarketIntelSection>

        <MarketIntelSection title="Analist dikkati" description="Odağa alınan semboller ve segment liderleri." bodyClassName="p-[var(--sp-3)]">
          <div className="grid gap-[var(--sp-4)] min-[520px]:grid-cols-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-meta)]">Takip yoğunluğu</p>
              <ul className="mt-[var(--sp-2)] space-y-1.5">
                {analystAttention.analystFocusSymbols.length === 0 ? (
                  <li className="text-[12px] text-[var(--color-meta)]">—</li>
                ) : (
                  analystAttention.analystFocusSymbols.map((x) => (
                    <li key={x.symbol} className="flex items-center justify-between gap-[var(--sp-2)] text-[12px] font-semibold">
                      <Link href={`/markets/${encodeURIComponent(x.symbol)}`} className="truncate text-[var(--color-text)] hover:underline">
                        {x.symbol}
                      </Link>
                      <span className="shrink-0 text-[11px] font-semibold text-[var(--color-meta)]">
                        {x.analystTouches} dokunuş
                        {x.discussionRising ? " · ↑" : ""}
                      </span>
                    </li>
                  ))
                )}
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-meta)]">Tartışma artışı</p>
              <ul className="mt-[var(--sp-2)] space-y-1.5">
                {analystAttention.risingDiscussion.map((x) => (
                  <li key={x.symbol} className="flex items-center justify-between gap-[var(--sp-2)] text-[12px]">
                    <Link href={`/signals?asset=${encodeURIComponent(x.symbol)}`} className="truncate font-semibold text-[var(--color-text)] hover:underline">
                      {x.symbol}
                    </Link>
                    <span className="markets-mono shrink-0 text-[11px] text-[var(--color-meta)]">{x.score.toFixed(1)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-[var(--sp-3)] border-t border-[color-mix(in_srgb,var(--color-border)_70%,transparent)] pt-[var(--sp-3)]">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-meta)]">Üretici aktivitesi</p>
            <ul className="mt-[var(--sp-2)] flex flex-wrap gap-[var(--sp-2)]">
              {analystAttention.creatorHot.map((x) => (
                <li key={x.symbol}>
                  <Link
                    href={`/markets/${encodeURIComponent(x.symbol)}`}
                    className="rounded-full border border-[color-mix(in_srgb,var(--color-border)_80%,transparent)] px-[var(--sp-3)] py-1 text-[11px] font-semibold text-[var(--color-text)] hover:border-[var(--color-primary)]"
                  >
                    {x.symbol}{" "}
                    <span className="text-[var(--color-meta)]">({Math.round(x.activityScore)})</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-[var(--sp-3)] border-t border-[color-mix(in_srgb,var(--color-border)_70%,transparent)] pt-[var(--sp-3)]">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-meta)]">Segment liderleri</p>
            <div className="mt-[var(--sp-2)] grid gap-[var(--sp-3)] min-[640px]:grid-cols-2">
              {(["crypto", "stocks", "forex", "index", "commodity"] as const).map((seg) => {
                const leaders = analystAttention.segmentLeaders[seg];
                if (!leaders?.length) return null;
                const lab =
                  seg === "crypto"
                    ? "Kripto"
                    : seg === "stocks"
                      ? "Hisse"
                      : seg === "forex"
                        ? "Forex"
                        : seg === "index"
                          ? "Endeks"
                          : "Emtia";
                return (
                  <div key={seg} className="min-w-0">
                    <p className="text-[11px] font-semibold text-[var(--color-meta)]">{lab}</p>
                    <ul className="mt-1 space-y-1">
                      {leaders.map((L) => (
                        <li key={`${seg}-${L.display}`} className="text-[12px]">
                          <Link href={L.href} className="font-semibold text-[var(--color-text)] hover:underline">
                            {L.display}
                          </Link>
                          <span className="text-[var(--color-meta)]"> · {L.badge}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </MarketIntelSection>
      </div>
    </div>
  );
}
