"use client";

import Link from "next/link";
import { useMemo } from "react";

import { getMarketsRepository } from "@/features/markets/repository";

type Props = { symbol: string };

function formatLivePrice(n: number): string {
  if (n >= 1000) return n.toLocaleString("tr-TR", { maximumFractionDigits: 2 });
  if (n >= 1) return n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return n.toLocaleString("tr-TR", { minimumFractionDigits: 4, maximumFractionDigits: 6 });
}

export function LiveMarketTicker({ symbol }: Props) {
  const clean = symbol.replace(/^#/, "").trim();

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
    <div className="live-watch__dock-ticker">
      <span className="live-watch__dock-ticker-label">CANLI PİYASA</span>
      <Link href={`/markets/${encodeURIComponent(clean)}`} className="live-watch__dock-ticker-symbol">
        {clean}
      </Link>
      {quote ? (
        <>
          <span className="live-watch__dock-ticker-price">{formatLivePrice(quote.price)}</span>
          <span className="live-watch__dock-ticker-change" data-up={up ? "true" : "false"}>
            {up ? "+" : ""}
            {quote.change.toFixed(2)}%
          </span>
        </>
      ) : null}
    </div>
  );
}
