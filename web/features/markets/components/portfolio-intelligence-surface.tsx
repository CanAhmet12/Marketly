"use client";

import Link from "next/link";

import { MarketIntelSection } from "@/features/markets/components/market-intel-section";
import type { PortfolioIntelligenceBundle } from "@/features/markets/types/personal-market-intelligence";
import type { PersonalizedSignalRelevance } from "@/features/signals/repository/types";
import { cn } from "@/lib/cn";

type Props = {
  portfolio: PortfolioIntelligenceBundle;
  personalized: PersonalizedSignalRelevance;
  stripRows: readonly { label: string; value: string; hint?: string }[];
};

export function PortfolioIntelligenceSurface({ portfolio, personalized, stripRows }: Props) {
  const { risk, overlaps, holdings, strategyMix, headlineSentiment } = portfolio;

  return (
    <div className="space-y-[var(--sp-3)]">
      <div className="rounded-[14px] border border-[color-mix(in_srgb,var(--color-border)_88%,transparent)] bg-[var(--color-surface)] p-[var(--sp-3)] shadow-[var(--shadow-card)]">
        <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-meta)]">Portföy hissi</p>
        <p className="mt-1 text-[15px] font-bold text-[var(--color-text)]">{headlineSentiment}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {strategyMix.map((s) => (
            <span key={s.label} className="rounded-full border border-[color-mix(in_srgb,var(--color-border)_80%,transparent)] px-[var(--sp-3)] py-1 text-[11px] font-semibold text-[var(--color-text)]">
              {s.label} <span className="text-[var(--color-meta)]">%{s.pct}</span>
            </span>
          ))}
        </div>
      </div>

      {stripRows.length ? (
        <ul className="rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface)] p-[var(--sp-3)]">
          {stripRows.map((r) => (
            <li key={r.label} className="flex items-baseline justify-between gap-[var(--sp-2)] border-b border-[color-mix(in_srgb,var(--color-border)_60%,transparent)] py-2 text-[13px] font-semibold last:border-0">
              <span className="text-[var(--color-text-secondary)]">{r.label}</span>
              <span className="markets-mono text-[var(--color-text)]">{r.value}</span>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="grid min-w-0 gap-[var(--sp-3)] min-[800px]:grid-cols-2">
        <MarketIntelSection title="Ağırlıklar" description="Kompakt dağılım — mock kağıt portföy." bodyClassName="p-[var(--sp-3)]">
          <ul className="space-y-2">
            {holdings.map((h) => (
              <li key={h.symbol} className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
                <Link href={h.href} className="font-bold text-[var(--color-text)] hover:underline">
                  {h.symbol}
                </Link>
                <span className="text-[var(--color-meta)]">{h.category}</span>
                <span className="markets-mono font-semibold text-[var(--color-text)]">%{h.weightPct}</span>
                <span className="w-full text-[10px] text-[var(--color-text-secondary)]">{h.contributionLabel}</span>
              </li>
            ))}
          </ul>
        </MarketIntelSection>
        <MarketIntelSection title="Risk & tema" description="Konsantrasyon ve rejim hizası." bodyClassName="p-[var(--sp-3)]">
          <p className="text-[12px] font-semibold text-[var(--color-text)]">{risk.concentrationLabel}</p>
          <p className="mt-1 text-[11px] text-[var(--color-meta)]">Üst ağırlık %{risk.topWeightPct}</p>
          <p className="mt-2 text-[11px] font-medium text-[var(--color-text-secondary)]">{risk.macroSensitivity}</p>
          <p className="mt-1 text-[11px] text-[var(--color-meta)]">{risk.volCluster}</p>
          <p className="mt-1 text-[11px] text-[var(--color-meta)]">{risk.regimeAlignment}</p>
          <p className="mt-1 text-[11px] text-[var(--color-meta)]">{risk.momentumVsDefense}</p>
          <ul className="mt-2 space-y-1">
            {risk.sectorTop.map((s) => (
              <li key={s.label} className="flex justify-between text-[11px] font-semibold">
                <span className="text-[var(--color-text)]">{s.label}</span>
                <span className="text-[var(--color-meta)]">%{s.pct}</span>
              </li>
            ))}
          </ul>
          <ul className="mt-2 space-y-1">
            {risk.correlatedPairs.map((p, i) => (
              <li key={`${p.a}-${p.b}-${i}`} className="text-[11px] text-[var(--color-text-secondary)]">
                <span className="font-bold text-[var(--color-text)]">{p.a}</span> ↔ <span className="font-bold text-[var(--color-text)]">{p.b}</span>
                <span className="text-[var(--color-meta)]"> · {p.note}</span>
              </li>
            ))}
          </ul>
        </MarketIntelSection>
      </div>

      <MarketIntelSection title="Üretici & sinyal örtüşmesi" description="Portföy sembollerinde analist yoğunluğu." bodyClassName="p-[var(--sp-3)]">
        <p className="text-[12px] text-[var(--color-text-secondary)]">{overlaps.creatorConcentration}</p>
        <p className="mt-1 text-[11px] text-[var(--color-meta)]">{overlaps.signalThemeTop}</p>
        <ul className="mt-2 space-y-1">
          {overlaps.overlappingAnalysts.map((a) => (
            <li key={a.href} className="text-[11px]">
              <Link href={a.href} className="font-semibold text-[var(--color-text)] hover:underline">
                {a.display}
              </Link>
              <span className="text-[var(--color-meta)]"> · {a.count} çağrı</span>
            </li>
          ))}
        </ul>
      </MarketIntelSection>

      <MarketIntelSection
        title="Portföy için sinyaller"
        description="SignalsRepository — kesişen çağrılar."
        headerAside={
          <Link href="/signals" className="text-[11px] font-bold text-[var(--color-primary-dark)] hover:underline">
            Akış
          </Link>
        }
        bodyClassName="p-[var(--sp-3)]"
      >
        <p className={cn("text-[12px] font-medium text-[var(--color-text-secondary)]")}>{personalized.headline}</p>
        <ul className="mt-2 grid gap-2 min-[640px]:grid-cols-2">
          {personalized.rows.map((r) => (
            <li key={r.id} className="rounded-lg border border-[color-mix(in_srgb,var(--color-border)_82%,transparent)] px-[var(--sp-2)] py-[var(--sp-2)] text-[11px]">
              <Link href={r.href} className="font-bold text-[var(--color-text)] hover:underline">
                {r.symbol}
              </Link>
              <span className="text-[var(--color-meta)]"> {r.direction} · %{r.confidence}</span>
              <p className="mt-0.5 text-[10px] text-[var(--color-text-secondary)]">{r.analystDisplay}</p>
              <p className="text-[10px] font-semibold text-[var(--color-primary-dark)]">{r.reason}</p>
            </li>
          ))}
        </ul>
      </MarketIntelSection>
    </div>
  );
}
