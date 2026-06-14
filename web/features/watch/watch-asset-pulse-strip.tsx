"use client";

import Link from "next/link";
import { useMemo } from "react";

import { getMarketsRepository } from "@/features/markets/repository";
import { changePercentTextClass, formatSignedChangePercent } from "@/features/markets/lib/market-display";
import { marketSymbolPath } from "@/features/markets/markets-routes";

type Props = { assetTag: string };

function formatPrice(n: number): string {
  if (n >= 1000) return n.toLocaleString("tr-TR", { maximumFractionDigits: 2 });
  if (n >= 1) return n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return n.toLocaleString("tr-TR", { minimumFractionDigits: 4, maximumFractionDigits: 6 });
}

/** İzleme sidebar — tek satır varlık pulse (fiyat + linkler). */
export function WatchAssetPulseStrip({ assetTag }: Props) {
  const clean = assetTag.replace(/^#/, "").trim().toUpperCase();

  const quote = useMemo(() => {
    const bundle = getMarketsRepository().getAssetIntelligenceBundle(clean);
    if (!bundle) return null;
    return {
      price: bundle.asset.price,
      change: bundle.asset.change_percent,
    };
  }, [clean]);

  const up = (quote?.change ?? 0) >= 0;

  return (
    <div className="mb-3 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 rounded-[10px] border border-[color-mix(in_srgb,var(--color-border)_88%,transparent)] bg-[color-mix(in_srgb,var(--color-text)_2%,var(--color-surface))] px-2.5 py-2">
      <Link
        href={marketSymbolPath(clean)}
        className="shrink-0 text-[11px] font-bold tracking-wide text-[var(--color-primary-dark)] hover:underline"
      >
        {clean}
      </Link>
      {quote ? (
        <>
          <span className="shrink-0 text-[11px] font-bold tabular-nums text-[var(--color-text)]">{formatPrice(quote.price)}</span>
          <span
            className={`markets-mono shrink-0 rounded px-1.5 py-px text-[10px] font-bold tabular-nums ${
              up
                ? "bg-[color-mix(in_srgb,var(--color-rise)_12%,transparent)]"
                : "bg-[color-mix(in_srgb,var(--color-fall)_12%,transparent)]"
            } ${changePercentTextClass(quote.change)}`}
          >
            {formatSignedChangePercent(quote.change)}
          </span>
        </>
      ) : null}
      <span className="hidden h-3 w-px shrink-0 bg-[var(--color-divider)] sm:block" aria-hidden />
      <div className="flex min-w-0 flex-wrap items-center gap-x-2 text-[10px] font-semibold">
        <Link href={marketSymbolPath(clean)} className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary-dark)] hover:underline">
          Piyasa
        </Link>
        <span className="text-[var(--color-divider)]" aria-hidden>
          ·
        </span>
        <Link
          href={`/signals?asset=${encodeURIComponent(clean)}`}
          className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary-dark)] hover:underline"
        >
          Sinyaller
        </Link>
      </div>
    </div>
  );
}
