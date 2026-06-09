"use client";

import Link from "next/link";
import { useMemo } from "react";

import { getMarketsRepository } from "@/features/markets/repository";

type Props = { marketSymbols: readonly string[] };

/** Arama — piyasa sekmesinde tartışma ağı ipucu (repository). */
export function ResultsMarketsCommunityHint({ marketSymbols }: Props) {
  const bundle = useMemo(() => getMarketsRepository().getMarketCommunityNetwork(), []);
  const set = new Set(marketSymbols.map((s) => s.trim().toUpperCase()).filter(Boolean));
  const debates = bundle.community.hottestDebates.filter((d) => set.has(d.symbol.toUpperCase())).slice(0, 3);
  const chains = bundle.crossAssetChains.filter((c) => set.has(c.leftSymbol) || set.has(c.rightSymbol)).slice(0, 2);

  if (!debates.length && !chains.length) {
    return (
      <div className="mb-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] px-[var(--sp-3)] py-[var(--sp-2)]">
        <p className="text-[12px] font-medium text-[var(--color-meta)]">Bu sonuçlar için tartışma özeti henüz yok.</p>
        <Link href="/markets" className="mt-1 inline-block text-[12px] font-bold text-[var(--color-primary-dark)] hover:underline">
          Piyasalar →
        </Link>
      </div>
    );
  }

  return (
    <div className="mb-4 rounded-[var(--radius-lg)] border border-[color-mix(in_srgb,var(--color-border)_85%,transparent)] bg-[color-mix(in_srgb,var(--color-text)_2%,var(--color-surface))] px-[var(--sp-3)] py-[var(--sp-2)]">
      <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-meta)]">Tartışma ağı</p>
      {debates.length ? (
        <ul className="mt-1 space-y-1">
          {debates.map((d) => (
            <li key={d.symbol} className="text-[12px] font-semibold text-[var(--color-text)]">
              <Link href={d.href} className="hover:text-[var(--color-primary-dark)] hover:underline">
                {d.symbol}
              </Link>
              <span className="font-normal text-[var(--color-meta)]"> · skor {d.score} · {d.stanceSplitLabel}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {chains.length ? (
        <ul className="mt-2 space-y-1">
          {chains.map((c) => (
            <li key={c.id} className="text-[11px] text-[var(--color-text-secondary)]">
              <Link href={c.href} className="font-bold text-[var(--color-primary-dark)] hover:underline">
                {c.leftSymbol} ↔ {c.rightSymbol}
              </Link>
              <span> · {c.theme}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
