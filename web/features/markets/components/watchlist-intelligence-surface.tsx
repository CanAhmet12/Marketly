"use client";

import Link from "next/link";

import { MarketIntelSection } from "@/features/markets/components/market-intel-section";
import type { WatchlistIntelligenceBundle } from "@/features/markets/types/personal-market-intelligence";
import { changePercentTextClass, formatSignedChangePercent } from "@/features/markets/lib/market-display";
import type { PersonalizedSignalRelevance } from "@/features/signals/repository/types";
import { cn } from "@/lib/cn";

type Props = {
  bundle: WatchlistIntelligenceBundle;
  personalized: PersonalizedSignalRelevance;
};

export function WatchlistIntelligenceSurface({ bundle, personalized }: Props) {
  const { signalPulse, personal, network, movers, creatorPulse, discussionFeed, volatility } = bundle;

  return (
    <div className="space-y-[var(--sp-3)]">
      <div className="grid min-w-0 gap-[var(--sp-3)] min-[720px]:grid-cols-2">
        <MarketIntelSection title="Sinyal nabzı" description="Takipteki aktif çağrılar ve kopya aktivitesi." bodyClassName="p-[var(--sp-3)]">
          <p className="text-[12px] font-semibold text-[var(--color-text)]">{signalPulse.summaryLabel}</p>
          <div className="mt-2 flex flex-wrap gap-x-[var(--sp-2)] gap-y-1 text-[11px] font-medium text-[var(--color-text-secondary)]">
            <span>{signalPulse.activeOnWatch} aktif</span>
            <span className="text-[var(--color-border)]">·</span>
            <span>{signalPulse.new24hLabel}</span>
            <span className="text-[var(--color-border)]">·</span>
            <span>premium {signalPulse.premiumOnWatch}</span>
            <span className="text-[var(--color-border)]">·</span>
            <span>kopya 24s {signalPulse.copies24h}</span>
          </div>
        </MarketIntelSection>
        <MarketIntelSection title="Kişisel bağlam" description="Dikkat artışı, makro ve tez kümesi." bodyClassName="p-[var(--sp-3)]">
          <p className="text-[12px] font-medium text-[var(--color-text-secondary)]">{personal.heatLabel}</p>
          <p className="mt-1 text-[11px] text-[var(--color-meta)]">{personal.convictionCluster}</p>
          {personal.sentimentShifts.length ? (
            <ul className="mt-2 space-y-1">
              {personal.sentimentShifts.map((s) => (
                <li key={s.symbol} className="text-[11px]">
                  <Link href={s.href} className="font-semibold text-[var(--color-text)] hover:underline">
                    {s.symbol}
                  </Link>
                  <span className="text-[var(--color-meta)]"> · {s.label}</span>
                </li>
              ))}
            </ul>
          ) : null}
          {personal.newPremiumSignals.length ? (
            <ul className="mt-2 space-y-1">
              {personal.newPremiumSignals.map((x) => (
                <li key={x.symbol} className="text-[11px]">
                  <Link href={x.href} className="font-semibold text-[var(--color-primary-dark)] hover:underline">
                    {x.symbol}
                  </Link>
                  <span className="text-[var(--color-meta)]"> · {x.count} premium çağrı</span>
                </li>
              ))}
            </ul>
          ) : null}
          {personal.macroEventsForWatch.length ? (
            <ul className="mt-2 space-y-1">
              {personal.macroEventsForWatch.map((e) => (
                <li key={e.id} className="text-[11px]">
                  <Link href={e.href} className="font-semibold text-[var(--color-text)] hover:underline">
                    {e.title}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </MarketIntelSection>
      </div>

      <MarketIntelSection title="Ağ etkileri" description="Piyasa anlatısı ve konsensus ipucu." bodyClassName="p-[var(--sp-3)]">
        <p className="text-[12px] text-[var(--color-text-secondary)]">{network.narrative}</p>
        <p className="mt-1 text-[11px] text-[var(--color-meta)]">{network.communityOverlap}</p>
        <p className="mt-1 text-[11px] text-[var(--color-meta)]">{network.consensusShiftNote}</p>
      </MarketIntelSection>

      <div className="grid min-w-0 gap-[var(--sp-3)] min-[900px]:grid-cols-3">
        <MarketIntelSection title="Hareket" description="Takipteki volatil sıralama." bodyClassName="p-[var(--sp-3)]">
          <ul className="space-y-1.5">
            {movers.length === 0 ? (
              <li className="text-[12px] text-[var(--color-meta)]">—</li>
            ) : (
              movers.map((m) => (
                <li key={m.symbol} className="flex items-center justify-between gap-2 text-[12px] font-semibold">
                  <Link href={m.href} className="min-w-0 truncate text-[var(--color-text)] hover:underline">
                    {m.symbol}
                  </Link>
                  <span className={cn("markets-mono shrink-0 tabular-nums", changePercentTextClass(m.change_percent))}>{formatSignedChangePercent(m.change_percent)}</span>
                </li>
              ))
            )}
          </ul>
        </MarketIntelSection>
        <MarketIntelSection title="Üretici & tartışma" description="Takip varlıklarında canlı başlıklar." bodyClassName="p-[var(--sp-3)]">
          <ul className="space-y-2">
            {discussionFeed.slice(0, 5).map((d) => (
              <li key={d.id} className="text-[11px]">
                <Link href={d.href} className="font-bold text-[var(--color-text)] hover:underline">
                  {d.headline}
                </Link>
                <span className="text-[var(--color-meta)]"> · {d.meta}</span>
                {d.live ? <span className="ml-1 text-[9px] font-bold uppercase text-[var(--color-primary-dark)]">canlı</span> : null}
              </li>
            ))}
          </ul>
        </MarketIntelSection>
        <MarketIntelSection title="Volatilite" description="Son hareket bantları." bodyClassName="p-[var(--sp-3)]">
          <ul className="space-y-1.5">
            {volatility.map((v) => (
              <li key={v.symbol} className="flex justify-between gap-2 text-[11px] font-semibold">
                <Link href={v.href} className="text-[var(--color-text)] hover:underline">
                  {v.symbol}
                </Link>
                <span className="text-[var(--color-meta)]">{v.label}</span>
              </li>
            ))}
          </ul>
        </MarketIntelSection>
      </div>

      <div className="grid min-w-0 gap-[var(--sp-3)] min-[720px]:grid-cols-2">
        <MarketIntelSection title="Üretici nabzı" description="Takip varlıklarında dokunuş." bodyClassName="p-[var(--sp-3)]">
          <ul className="space-y-1.5">
            {creatorPulse.map((c) => (
              <li key={`${c.href}-${c.symbol}`} className="text-[11px]">
                <Link href={c.href} className="font-semibold text-[var(--color-text)] hover:underline">
                  {c.display}
                </Link>
                <span className="text-[var(--color-meta)]"> · {c.symbol}</span>
                <span className="text-[var(--color-text-secondary)]"> — {c.note}</span>
              </li>
            ))}
          </ul>
        </MarketIntelSection>
        <MarketIntelSection title="Dikkat artışı" description="Takip listenizde öne çıkanlar." bodyClassName="p-[var(--sp-3)]">
          <ul className="space-y-1.5">
            {personal.risingAttention.map((x) => (
              <li key={x.symbol} className="flex justify-between gap-2 text-[11px]">
                <Link href={x.href} className="font-semibold text-[var(--color-text)] hover:underline">
                  {x.symbol}
                </Link>
                <span className="text-[var(--color-meta)]">{x.deltaLabel}</span>
              </li>
            ))}
          </ul>
        </MarketIntelSection>
      </div>

      <MarketIntelSection
        title="Kişiselleştirilmiş sinyaller"
        description="İzleme ve portföy kesişimi — SignalsRepository."
        headerAside={
          <Link href="/signals" className="text-[11px] font-bold text-[var(--color-primary-dark)] hover:underline">
            Tüm sinyaller
          </Link>
        }
        bodyClassName="p-[var(--sp-3)]"
      >
        <p className="text-[12px] font-medium text-[var(--color-text-secondary)]">{personalized.headline}</p>
        <ul className="mt-2 space-y-2">
          {personalized.rows.length === 0 ? (
            <li className="text-[12px] text-[var(--color-meta)]">Kesişen çağrı yok.</li>
          ) : (
            personalized.rows.map((r) => (
              <li key={r.id} className="rounded-lg border border-[color-mix(in_srgb,var(--color-border)_82%,transparent)] px-[var(--sp-2)] py-[var(--sp-2)] text-[11px]">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={r.href} className="font-bold text-[var(--color-text)] hover:underline">
                    {r.symbol}
                  </Link>
                  <span className="rounded bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] px-1 py-px text-[10px] font-bold uppercase text-[var(--color-meta)]">{r.direction}</span>
                  <span className="text-[var(--color-meta)]">%{r.confidence}</span>
                  <span className="text-[var(--color-meta)]">{r.analystDisplay}</span>
                </div>
                <p className="mt-0.5 text-[10px] font-semibold text-[var(--color-primary-dark)]">{r.reason}</p>
              </li>
            ))
          )}
        </ul>
      </MarketIntelSection>
    </div>
  );
}
