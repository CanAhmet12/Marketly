import type { NasdaqIndexPanel } from "@/features/markets/nasdaq/types";
import type { MarketAssetView } from "@/features/markets/types";

import {
  sparkOrFlat,
  trendFromChange,
} from "@/features/markets/lib/live-category/live-category-shared";

export function buildNasdaqIndexPanel(asset: MarketAssetView): NasdaqIndexPanel {
  const support = asset.price * 0.98;
  const resistance = asset.price * 1.02;

  return {
    symbol: asset.symbol.toUpperCase(),
    name: asset.name,
    value: asset.price,
    changePct: asset.change_percent,
    changePoint: (asset.price * asset.change_percent) / 100,
    sparkline: sparkOrFlat(asset),
    trend: trendFromChange(asset.change_percent),
    stats: {
      haftalik: "—",
      aylik: "—",
      destek: support.toLocaleString("en-US", { maximumFractionDigits: 0 }),
      direnc: resistance.toLocaleString("en-US", { maximumFractionDigits: 0 }),
    },
  };
}

export function emptyNasdaqIndexPanel(name: string, symbol: string): NasdaqIndexPanel {
  return {
    symbol,
    name,
    value: 0,
    changePct: 0,
    changePoint: 0,
    sparkline: [],
    trend: "flat",
    stats: { haftalik: "—", aylik: "—", destek: "—", direnc: "—" },
  };
}
