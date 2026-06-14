"use client";

import Link from "next/link";

import { MiniSparkline } from "@/features/markets/components/mini-sparkline";
import {
  formatSignedChangePercent,
  marketMovementTone,
} from "@/features/markets/lib/market-display";
import { marketSymbolPath } from "@/features/markets/markets-routes";
import { searchAssetToMarketView } from "@/features/search/adapters/search-asset-to-market-view";
import type { SearchAssetHit } from "@/features/search/types";
import { cn } from "@/lib/cn";

type Props = { asset: SearchAssetHit };

function categoryLabel(symbol: string, category: string): string {
  const m: Record<string, string> = {
    crypto: "Kripto",
    stocks: "Hisse",
    forex: "Döviz",
    commodity: "Emtia",
    index: "Endeks",
  };
  return m[category] ?? symbol.slice(0, 6);
}

export function SearchMarketHit({ asset }: Props) {
  const view = searchAssetToMarketView(asset);
  const change = asset.change_pct ?? 0;
  const tone = marketMovementTone(change);

  return (
    <Link href={marketSymbolPath(asset.symbol)} className="srch-hit srch-hit--market">
      <div className="srch-hit__lead">
        <span className="srch-hit__symbol">{asset.symbol}</span>
        <span className="srch-hit__tag">{categoryLabel(asset.symbol, view.category)}</span>
      </div>
      <div className="srch-hit__copy">
        <span className="srch-hit__name">{asset.name?.trim() || asset.symbol}</span>
        <span className={cn("srch-hit__change", `srch-hit__change--${tone}`)}>
          {formatSignedChangePercent(change)}
        </span>
      </div>
      <div className="srch-hit__spark-wrap" aria-hidden>
        <MiniSparkline series={view.sparkline} trend={view.trend} className="srch-hit__spark" height={28} />
      </div>
    </Link>
  );
}
