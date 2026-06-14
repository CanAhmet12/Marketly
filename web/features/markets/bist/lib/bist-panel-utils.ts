import type { BistIndexPanel } from "@/features/markets/bist/types";
import type { MarketAssetView } from "@/features/markets/types";

import { formatBistTickerPrice } from "@/features/markets/bist/lib/map-bist-tickers";
import { normalizeBistSymbol } from "@/features/markets/bist/lib/bist-symbol-meta";
import { signedPct } from "@/features/markets/bist/lib/bist-sparkline-utils";
import {
  sparkOrFlat,
  trendFromChange,
} from "@/features/markets/lib/live-category/live-category-shared";

export type BistDetailPanel = {
  value: number;
  changePct: number;
  sparkline: number[];
  stats: {
    destek: string;
    direnc: string;
    haftalik: string;
    aylik: string;
  };
};

export function buildBistDetailPanel(asset: MarketAssetView, symbol?: string): BistDetailPanel {
  const sym = normalizeBistSymbol(symbol ?? asset.symbol);
  const highDay = asset.price * 1.012;
  const lowDay = asset.price * 0.988;

  return {
    value: asset.price,
    changePct: asset.change_percent,
    sparkline: sparkOrFlat(asset),
    stats: {
      destek: formatBistTickerPrice(lowDay, sym),
      direnc: formatBistTickerPrice(highDay, sym),
      haftalik: signedPct(asset.change_percent * 1.4),
      aylik: signedPct(asset.change_percent * 3.2),
    },
  };
}

export function buildBistIndexPanel(
  asset: MarketAssetView,
  symbol: BistIndexPanel["symbol"],
): BistIndexPanel {
  const highDay = asset.price * 1.005;
  const lowDay = asset.price * 0.995;

  return {
    symbol,
    name: asset.name,
    value: asset.price,
    changePercent: asset.change_percent,
    changeDay: (asset.price * asset.change_percent) / 100,
    sparkline: sparkOrFlat(asset),
    trend: trendFromChange(asset.change_percent),
    stats: {
      marketCap: asset.marketCapLabel ?? "—",
      volume: asset.volume ?? "—",
      highDay: highDay.toLocaleString("tr-TR", { maximumFractionDigits: 2 }),
      lowDay: lowDay.toLocaleString("tr-TR", { maximumFractionDigits: 2 }),
    },
  };
}

export function emptyBistIndexPanel(name: string, symbol: BistIndexPanel["symbol"]): BistIndexPanel {
  return {
    symbol,
    name,
    value: 0,
    changePercent: 0,
    changeDay: 0,
    sparkline: [],
    trend: "flat",
    stats: { marketCap: "—", volume: "—", highDay: "—", lowDay: "—" },
  };
}
