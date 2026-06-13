import type { CommodityPulseMetrics } from "@/features/markets/commodities/types";
import type { MarketAssetView } from "@/features/markets/types";

import {
  avgChange,
  findAsset,
  sparkOrFlat,
} from "@/features/markets/lib/live-category/live-category-shared";

import {
  commodityDisplayLabel,
  formatCommodityTickerPrice,
} from "./map-commodity-tickers";
import { resolveCommoditySparkline, sparkFromChange } from "./commodity-sparkline-utils";

const UNIT_BY_SYMBOL: Record<string, string> = {
  XAU: "$/oz",
  XAUUSD: "$/oz",
  XAG: "$/oz",
  XAGUSD: "$/oz",
  WTI: "$/bbl",
  BRENT: "$/bbl",
  NGAS: "$/mmbtu",
  NATGAS: "$/mmbtu",
  COPPER: "$/lb",
  WHEAT: "c/bu",
};

function unitFor(symbol: string): string {
  const key = symbol.toUpperCase().replace("/", "");
  for (const [k, u] of Object.entries(UNIT_BY_SYMBOL)) {
    if (key.includes(k.replace("USD", ""))) return u;
  }
  return "$";
}

function pulseItem(asset: MarketAssetView | undefined, fallbackSymbol: string) {
  if (!asset) {
    return {
      symbol: fallbackSymbol,
      price: 0,
      unit: unitFor(fallbackSymbol),
      changePct: 0,
      sparkline: [] as number[],
    };
  }
  return {
    symbol: commodityDisplayLabel(asset.symbol, asset.name),
    price: asset.price,
    unit: unitFor(asset.symbol),
    changePct: asset.change_percent,
    sparkline: sparkOrFlat(asset),
  };
}

export function computeCommodityVolatility(assets: readonly MarketAssetView[]): {
  value: number;
  label: string;
} {
  if (!assets.length) return { value: 35, label: "Düşük" };
  const avgAbs = assets.reduce((s, a) => s + Math.abs(a.change_percent), 0) / assets.length;
  const value = Math.min(100, Math.max(8, Math.round(avgAbs * 18 + 12)));
  const label = value >= 65 ? "Yüksek" : value >= 38 ? "Orta" : "Düşük";
  return { value, label };
}

function trendLabel(score: number): string {
  if (score >= 70) return "Güçlü";
  if (score >= 45) return "Olumlu";
  return "Zayıf";
}

export function buildCommodityPulseMetrics(assets: readonly MarketAssetView[]): CommodityPulseMetrics {
  const gold = findAsset(assets, "XAU") ?? findAsset(assets, "XAUUSD") ?? assets[0];
  const silver = findAsset(assets, "XAG") ?? findAsset(assets, "XAGUSD");
  const oil = findAsset(assets, "WTI") ?? findAsset(assets, "BRENT");
  const gas = findAsset(assets, "NGAS") ?? findAsset(assets, "NATGAS");
  const copper = findAsset(assets, "COPPER");
  const wheat = findAsset(assets, "WHEAT");

  const avg = avgChange(assets);
  const endSpark = assets.length
    ? resolveCommoditySparkline(avg, assets[0] ? sparkOrFlat(assets[0]) : [])
    : sparkFromChange(avg);

  const trendScore = Math.min(100, Math.max(0, Math.round(50 + avg * 10)));

  return {
    altin: pulseItem(gold, "ALTIN"),
    gumus: pulseItem(silver, "GUMUS"),
    petrol: pulseItem(oil, "WTI"),
    dogalgaz: pulseItem(gas, "GAZ"),
    bakir: pulseItem(copper, "BAKIR"),
    bugday: pulseItem(wheat, "BUGDAY"),
    endeks: {
      value: Math.round((100 + avg) * 10) / 10,
      changePct: avg,
      label: "Bloomberg CCI",
      sparkline: endSpark,
    },
    trendScore: { value: trendScore, label: trendLabel(trendScore) },
    volatility: computeCommodityVolatility(assets),
  };
}

export function formatCommodityPulsePrice(price: number, unit: string): string {
  if (!price) return "—";
  if (unit === "c/bu") return `${price.toFixed(0)}`;
  return formatCommodityTickerPrice(price, unit.includes("oz") ? "XAU" : "WTI");
}
