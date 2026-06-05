"use client";

import type { ReactNode } from "react";
import Link from "next/link";

import type { MarketHeroPayload } from "@/features/markets/types";
import { changePercentTextClass, formatSignedChangePercent } from "@/features/markets/lib/market-display";
import { cn } from "@/lib/cn";

type Props = {
  hero: MarketHeroPayload;
};

function IntelPill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex max-w-full items-center rounded-full border border-[color-mix(in_srgb,var(--color-border)_70%,transparent)] bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)] px-[var(--sp-3)] py-1 text-[11px] font-semibold text-[var(--color-text-secondary)]">
      <span className="truncate">{children}</span>
    </span>
  );
}

export function MarketsHero({ hero }: Props) {
  return (
    <section className="markets-hero-sheen relative overflow-hidden rounded-3xl px-[var(--sp-4)] py-[var(--sp-5)] min-[640px]:px-[var(--sp-5)] min-[640px]:py-[var(--sp-6)]">
      <div
        className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,color-mix(in_srgb,var(--color-primary)_12%,transparent)_0%,transparent_70%)] opacity-80"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.42)_0%,transparent_42%)]"
        aria-hidden
      />

      <div className="relative flex flex-col gap-[var(--sp-5)] min-[900px]:flex-row min-[900px]:items-start min-[900px]:justify-between">
        <div className="max-w-xl min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-meta)]">Piyasa komuta merkezi</p>
          <h2 className="mt-2 text-[clamp(1.2rem,2.1vw,1.5rem)] font-bold leading-snug tracking-[-0.028em] text-[var(--color-text)]">
            Piyasalar
          </h2>
          <p className="mt-[var(--sp-4)] text-[15px] font-medium leading-[1.65] text-[var(--color-text-secondary)]">{hero.moodDetail}</p>
          <div className="mt-[var(--sp-3)] flex flex-wrap gap-[var(--sp-2)]">
            <IntelPill>{hero.regimeSummary}</IntelPill>
            <IntelPill>{hero.volatilityLabel}</IntelPill>
            <IntelPill>{hero.signalActivityCount} aktif sinyal</IntelPill>
            <IntelPill>{hero.activeAnalystCount} analist odağı</IntelPill>
            <IntelPill>{hero.strongestAssetTheme}</IntelPill>
          </div>
          <div className="mt-[var(--sp-4)] flex flex-wrap items-baseline gap-x-[var(--sp-3)] gap-y-1">
            <span className="text-[14px] font-semibold text-[var(--color-text)]">{hero.moodLabel}</span>
            <span className="text-[13px] font-medium text-[var(--color-meta)]">{hero.openMarketsLabel}</span>
          </div>
          <p className="mt-2 text-[12px] font-medium text-[var(--color-text-secondary)]">{hero.sentimentPulseLabel}</p>
        </div>

        <div className="grid w-full grid-cols-2 gap-[var(--sp-4)] min-[520px]:grid-cols-3 min-[900px]:max-w-[520px] min-[900px]:flex-1 min-[900px]:grid-cols-3">
          <HeroStat label="BTC hakimiyeti" value={hero.btcDominance} />
          <HeroStat
            label="Korku / Açgözlülük"
            value={`${hero.fearGreed.value}`}
            sub={hero.fearGreed.label}
            valueClassName="text-[var(--color-text)]"
          />
          <HeroStat label="Hacim (rollup)" value={hero.totalVolumeLabel} />
          <HeroStat label="Yükselen" value={`${hero.advancers}`} sub="varlık" />
          <HeroStat label="Düşen" value={`${hero.decliners}`} sub="varlık" />
          <div className="col-span-2 min-[520px]:col-span-3 min-[900px]:col-span-3">
            <div className="ms-metric-block h-full">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--color-meta)]">Öne çıkan hareket</p>
              <div className="mt-[var(--sp-3)] flex flex-wrap gap-[var(--sp-5)]">
                <MoverPill label="Yükselenler" items={hero.topGainers} />
                <MoverPill label="Düşenler" items={hero.topLosers} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroStat({
  label,
  value,
  sub,
  valueClassName,
}: {
  label: string;
  value: string;
  sub?: string;
  valueClassName?: string;
}) {
  return (
    <div className="ms-hero-stat">
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--color-meta)]">{label}</p>
      <p className={cn("markets-mono ms-num-strong mt-2 text-[20px] leading-none text-[var(--color-text)]", valueClassName)}>{value}</p>
      {sub ? <p className="mt-1 text-[12px] font-semibold text-[var(--color-text-secondary)]">{sub}</p> : null}
    </div>
  );
}

function MoverPill({ label, items }: { label: string; items: { symbol: string; change_percent: number }[] }) {
  return (
    <div className="min-w-0 flex-1">
      <p className="text-[12px] font-semibold text-[var(--color-meta)]">{label}</p>
      <ul className="mt-2 space-y-1.5">
        {items.map((m) => (
          <li key={m.symbol} className="flex items-center justify-between gap-[var(--sp-2)] text-[13px] font-semibold">
            <Link href={`/markets/${encodeURIComponent(m.symbol)}`} className="truncate text-[var(--color-text)] hover:text-[var(--color-primary-dark)] hover:underline">
              {m.symbol}
            </Link>
            <span className={cn("markets-mono tabular-nums", changePercentTextClass(m.change_percent))}>
              {formatSignedChangePercent(m.change_percent)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
