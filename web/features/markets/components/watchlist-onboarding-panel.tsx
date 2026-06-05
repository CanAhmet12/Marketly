"use client";

import Link from "next/link";

import { MarketIntelSection } from "@/features/markets/components/market-intel-section";
import type { WatchlistOnboardingIntel } from "@/features/markets/types/personal-market-intelligence";

type Props = { onboarding: WatchlistOnboardingIntel };

export function WatchlistOnboardingPanel({ onboarding }: Props) {
  return (
    <div className="space-y-[var(--sp-3)]">
      <div className="rounded-[14px] border border-[color-mix(in_srgb,var(--color-primary)_22%,var(--color-border))] bg-[color-mix(in_srgb,var(--color-primary)_6%,var(--color-surface))] p-[var(--sp-4)]">
        <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-meta)]">Başlangıç istihbaratı</p>
        <p className="mt-2 text-[14px] font-bold text-[var(--color-text)]">{onboarding.starterLabel}</p>
        <p className="mt-2 text-[12px] font-medium text-[var(--color-text-secondary)]">
          Aşağıdaki sembol ve üreticilerle ilk komuta düzeninizi kurun; veri repository üzerinden gelir.
        </p>
      </div>

      <MarketIntelSection title="Önerilen semboller" description="Trend mock kümesi — tek tıkla piyasa sayfası." bodyClassName="p-[var(--sp-3)]">
        {onboarding.suggestedSymbols.length === 0 ? (
          <p className="text-[12px] text-[var(--color-meta)]">Öneri listesi API ile dolduğunda görünür.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {onboarding.suggestedSymbols.map((s) => (
              <li key={s.symbol}>
                <Link
                  href={s.href}
                  className="inline-flex flex-col rounded-full border border-[color-mix(in_srgb,var(--color-border)_82%,transparent)] px-[var(--sp-3)] py-1.5 text-[12px] font-bold text-[var(--color-text)] hover:border-[var(--color-primary)]"
                >
                  {s.symbol}
                  <span className="text-[10px] font-medium text-[var(--color-meta)]">{s.hint}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </MarketIntelSection>

      <div className="grid min-w-0 gap-[var(--sp-3)] min-[640px]:grid-cols-2">
        <MarketIntelSection title="Trend temalar" description="Piyasalar ile hizalı makro başlıklar." bodyClassName="p-[var(--sp-3)]">
          <ul className="flex flex-wrap gap-1.5">
            {onboarding.trendingThemes.map((t) => (
              <li key={t}>
                <span className="rounded-md bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-text-secondary)]">{t}</span>
              </li>
            ))}
          </ul>
        </MarketIntelSection>
        <MarketIntelSection title="Üretici seçkisi" description="Takip başlangıcı için yoğun profiller." bodyClassName="p-[var(--sp-3)]">
          <ul className="space-y-2">
            {onboarding.creatorPicks.map((c) => (
              <li key={c.href} className="text-[12px]">
                <Link href={c.href} className="font-bold text-[var(--color-text)] hover:underline">
                  {c.display}
                </Link>
                <p className="text-[11px] text-[var(--color-meta)]">{c.reason}</p>
              </li>
            ))}
          </ul>
        </MarketIntelSection>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/markets" className="rounded-full bg-[var(--color-primary)] px-5 py-2 text-[13px] font-bold text-white hover:bg-[var(--color-primary-dark)]">
          Piyasalara git
        </Link>
        <Link href="/discover" className="rounded-full border border-[var(--color-border)] px-5 py-2 text-[13px] font-semibold text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]">
          Keşfet
        </Link>
        <Link href="/signals" className="rounded-full border border-[var(--color-border)] px-5 py-2 text-[13px] font-semibold text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]">
          Sinyaller
        </Link>
      </div>
    </div>
  );
}
