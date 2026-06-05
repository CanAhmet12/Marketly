"use client";

import Link from "next/link";

import { EmptyState } from "@/components/states";
import { MarketIntelSection } from "@/features/markets/components/market-intel-section";
import type { AssetRelatedNetwork } from "@/features/markets/types/asset-intelligence";

type Props = { network: AssetRelatedNetwork };

export function AssetDetailRelatedNetwork({ network }: Props) {
  const empty =
    network.correlated.length === 0 &&
    network.themeClusters.length === 0 &&
    network.analystOverlap.length === 0 &&
    network.macroThemes.length === 0;

  return (
    <MarketIntelSection title="İlişkili tema & ağ" description="Korelasyon, tema kümeleri ve analist örtüşmesi — ağ etkisi." bodyClassName="px-0 pb-0 pt-0">
      <div className="px-[var(--sp-3)] py-[var(--sp-3)]">
        {empty ? (
          <EmptyState title="Ağ verisi yok" description="İlişkili sembol ve tema katmanı API ile dolar." tone="market" compact />
        ) : (
          <div className="grid gap-[var(--sp-4)] min-[720px]:grid-cols-2">
            {network.correlated.length ? (
              <div>
                <p className="text-[10px] font-bold uppercase text-[var(--color-meta)]">Korelasyon ızgarası</p>
                <ul className="mt-2 flex flex-wrap gap-[var(--sp-2)]">
                  {network.correlated.map((c) => (
                    <li key={c.symbol}>
                      <Link
                        href={c.href}
                        className="inline-flex flex-col rounded-lg border border-[color-mix(in_srgb,var(--color-border)_82%,transparent)] px-[var(--sp-3)] py-1.5 text-[12px] font-bold text-[var(--color-text)] hover:border-[var(--color-primary)]"
                      >
                        {c.symbol}
                        <span className="text-[10px] font-semibold text-[var(--color-meta)]">{c.correlationLabel}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {network.themeClusters.map((t) => (
              <div key={t.label}>
                <p className="text-[10px] font-bold uppercase text-[var(--color-meta)]">{t.label}</p>
                <p className="mt-1 text-[12px] font-semibold text-[var(--color-text)]">{t.symbols.join(" · ")}</p>
              </div>
            ))}
            {network.macroThemes.length ? (
              <div>
                <p className="text-[10px] font-bold uppercase text-[var(--color-meta)]">Makro temalar</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {network.macroThemes.map((m) => (
                    <span key={m} className="rounded-full bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-text-secondary)]">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
            {network.analystOverlap.length ? (
              <div className="min-[720px]:col-span-2">
                <p className="text-[10px] font-bold uppercase text-[var(--color-meta)]">Analist örtüşmesi</p>
                <ul className="mt-2 space-y-1">
                  {network.analystOverlap.map((a) => (
                    <li key={a.display} className="text-[12px] font-semibold text-[var(--color-text)]">
                      <Link href={a.href} className="text-[var(--color-primary-dark)] hover:underline">
                        {a.display}
                      </Link>
                      <span className="text-[var(--color-meta)]"> · {a.sharedSymbols}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div className="min-[720px]:col-span-2 rounded-lg border border-[color-mix(in_srgb,var(--color-border)_78%,transparent)] bg-[color-mix(in_srgb,var(--color-text)_2%,var(--color-surface))] p-[var(--sp-3)]">
              <p className="text-[11px] font-semibold text-[var(--color-text)]">{network.sentimentOverlap}</p>
              <p className="mt-1 text-[11px] font-medium text-[var(--color-text-secondary)]">{network.capitalRotationHint}</p>
            </div>
          </div>
        )}
      </div>
    </MarketIntelSection>
  );
}
