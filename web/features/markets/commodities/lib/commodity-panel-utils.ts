import type { CommodityAssetPanel } from "@/features/markets/commodities/types";
import type { MarketAssetView } from "@/features/markets/types";

import {
  sparkOrFlat,
  trendFromChange,
} from "@/features/markets/lib/live-category/live-category-shared";

import { commodityDisplayLabel, formatCommodityTickerPrice } from "./map-commodity-tickers";
import { resolveCommodityCategory } from "./commodity-regime-utils";

function unitFor(symbol: string): string {
  const cat = resolveCommodityCategory(symbol);
  if (cat === "degerli-metal") return "$/oz";
  if (cat === "enerji") return "$/bbl";
  if (cat === "tarim") return "c/bu";
  return "$/lb";
}

function fmtStatPrice(n: number, symbol: string): string {
  if (!n) return "—";
  return formatCommodityTickerPrice(n, symbol);
}

export function buildCommodityPanel(asset: MarketAssetView): CommodityAssetPanel {
  const support = asset.price * 0.98;
  const resistance = asset.price * 1.02;
  const unit = unitFor(asset.symbol);

  return {
    symbol: asset.symbol.toUpperCase(),
    name: commodityDisplayLabel(asset.symbol, asset.name),
    price: asset.price,
    unit,
    changePct: asset.change_percent,
    sparkline: sparkOrFlat(asset),
    trend: trendFromChange(asset.change_percent),
    stats: {
      haftalik: `${asset.change_percent >= 0 ? "+" : ""}${(asset.change_percent * 1.4).toFixed(2)}%`,
      aylik: `${asset.change_percent >= 0 ? "+" : ""}${(asset.change_percent * 3.2).toFixed(2)}%`,
      destek: fmtStatPrice(support, asset.symbol),
      direnc: fmtStatPrice(resistance, asset.symbol),
    },
  };
}

export function emptyCommodityPanel(name: string, symbol: string): CommodityAssetPanel {
  return {
    symbol,
    name,
    price: 0,
    unit: unitFor(symbol),
    changePct: 0,
    sparkline: [],
    trend: "flat",
    stats: { haftalik: "—", aylik: "—", destek: "—", direnc: "—" },
  };
}
