"use client";

import Link from "next/link";

import { EmptyState } from "@/components/states";
import { MarketIntelSection } from "@/features/markets/components/market-intel-section";
import type { AssetMarketNewsItem } from "@/features/markets/types/asset-intelligence";
import { cn } from "@/lib/cn";

type Props = { items: AssetMarketNewsItem[]; symbol: string };

export function AssetDetailNewsIntel({ items, symbol }: Props) {
  const headerAside = (
    <Link href="/market-news" className="text-[12px] font-bold text-[var(--color-primary-dark)] hover:underline">
      Akış
    </Link>
  );

  return (
    <MarketIntelSection
      title="Piyasa haberi"
      description="Kaynak, etki ve duygu — haber merkezi ile aynı ton."
      headerAside={headerAside}
      bodyClassName="px-0 pb-0 pt-0"
    >
      {items.length === 0 ? (
        <div className="px-[var(--sp-3)] py-[var(--sp-3)]">
          <EmptyState title="Haber yok" description="Bu sembol için mock haber akışı boş." tone="market" compact />
        </div>
      ) : (
        <ul className="m-0 divide-y divide-[color-mix(in_srgb,var(--color-border)_80%,transparent)] p-0">
          {items.map((n) => (
            <li key={n.id} className="px-[var(--sp-3)] py-[var(--sp-2)]">
              <div className="flex flex-wrap items-start justify-between gap-[var(--sp-2)]">
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold leading-snug text-[var(--color-text)]">{n.headline}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold text-[var(--color-meta)]">
                    <span>{n.source}</span>
                    <span>·</span>
                    <span>{n.minutesAgo} dk</span>
                    <span>·</span>
                    <span className="uppercase">{n.category}</span>
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <ImpactDots impact={n.impact} />
                  <span className={cn("text-[10px] font-bold uppercase", sentimentClass(n.sentiment))}>{n.sentiment}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="border-t border-[color-mix(in_srgb,var(--color-border)_80%,transparent)] px-[var(--sp-3)] py-[var(--sp-2)] text-[11px] font-medium text-[var(--color-text-tertiary)]">
        Sembol: <span className="font-bold text-[var(--color-text)]">{symbol}</span>
      </div>
    </MarketIntelSection>
  );
}

function ImpactDots({ impact }: { impact: 1 | 2 | 3 }) {
  return (
    <div className="flex gap-0.5" title={`Etki ${impact}/3`}>
      {[1, 2, 3].map((i) => (
        <span key={i} className={cn("h-1.5 w-1.5 rounded-full", i <= impact ? "bg-[var(--color-text)]" : "bg-[color-mix(in_srgb,var(--color-text)_12%,transparent)]")} />
      ))}
    </div>
  );
}

function sentimentClass(s: AssetMarketNewsItem["sentiment"]) {
  if (s === "positive") return "text-[color-mix(in_srgb,var(--color-rise)_85%,var(--color-text)_15%)]";
  if (s === "negative") return "text-[color-mix(in_srgb,var(--color-fall)_85%,var(--color-text)_15%)]";
  if (s === "mixed") return "text-[var(--color-primary-dark)]";
  return "text-[var(--color-meta)]";
}
