import type { CommoditiesCategoryDashboard } from "@/features/markets/repository/markets-repository";
import type { MarketAssetView } from "@/features/markets/types";

import {
  avgChange,
  filterCommodityAssets,
  findAsset,
  fmtPrice,
  sortByChangeAsc,
  sortByChangeDesc,
  sparkOrFlat,
  trendFromChange,
} from "./live-category-shared";
import type { LiveCategoryBuildResult } from "./live-category-zones";
import { LIVE_ZONES_NONE } from "./live-category-zones";

function commodityPanel(symbol: string, name: string, asset: MarketAssetView, unit: string) {
  return {
    symbol,
    name,
    price: asset.price,
    unit,
    changePct: asset.change_percent,
    sparkline: sparkOrFlat(asset),
    trend: trendFromChange(asset.change_percent),
    stats: { haftalik: fmtPrice(asset.change_percent), aylik: "—", destek: "—", direnc: "—" },
  };
}

export function buildCommoditiesDashboardFromAssets(
  allAssets: readonly MarketAssetView[],
): LiveCategoryBuildResult<CommoditiesCategoryDashboard> | null {
  const assets = filterCommodityAssets(allAssets);
  if (!assets.length) return null;

  const gold = findAsset(assets, "XAU") ?? findAsset(assets, "XAUUSD") ?? assets[0]!;
  const silver = findAsset(assets, "XAG") ?? findAsset(assets, "XAGUSD");
  const oil = findAsset(assets, "WTI") ?? findAsset(assets, "BRENT") ?? assets[1] ?? assets[0]!;
  const avg = avgChange(assets);
  const gainers = sortByChangeDesc(assets).slice(0, 5);
  const losers = sortByChangeAsc(assets).slice(0, 5);

  const dashboard: CommoditiesCategoryDashboard = {
    pulse: {
      altin: { symbol: "ALTIN", price: gold.price, unit: "$/oz", changePct: gold.change_percent, sparkline: sparkOrFlat(gold) },
      gumus: silver
        ? { symbol: "GÜMÜŞ", price: silver.price, unit: "$/oz", changePct: silver.change_percent, sparkline: sparkOrFlat(silver) }
        : { symbol: "GÜMÜŞ", price: 0, unit: "$/oz", changePct: 0, sparkline: [] },
      petrol: { symbol: "PETROL", price: oil.price, unit: "$/bbl", changePct: oil.change_percent, sparkline: sparkOrFlat(oil) },
      dogalgaz: { symbol: "GAZ", price: 0, unit: "$/mmbtu", changePct: 0, sparkline: [] },
      bakir: { symbol: "BAKIR", price: 0, unit: "$/lb", changePct: 0, sparkline: [] },
      bugday: { symbol: "BUĞDAY", price: 0, unit: "c/bu", changePct: 0, sparkline: [] },
      endeks: { value: avg, changePct: avg, label: "Canlı emtia ort.", sparkline: [] },
      trendScore: { value: Math.min(100, Math.max(0, 50 + avg * 10)), label: avg > 0 ? "Güçlü" : "Zayıf" },
    },
    regime: {
      regime: avg > 0.3 ? "altin-sezonu" : avg < -0.3 ? "enerji-lider" : "karma",
      headline: avg > 0.3 ? "METAL GÜÇLÜ" : avg < -0.3 ? "ENERJİ LİDER" : "KARMA",
      summary: `Canlı emtia: ${assets.length} sembol.`,
      altinValue: gold.price,
      altinChange: gold.change_percent,
      stats: { usdKorelasyon: "—", talepGorunumu: "—", enflasyonBekl: "—", trendGucu: "—" },
      distribution: { metal: 50, enerji: 30, tarim: 20 },
    },
    classes: { classes: [] },
    panels: { altin: commodityPanel("XAU", gold.name, gold, "$/oz"), petrol: commodityPanel("WTI", oil.name, oil, "$/bbl") },
    movers: {
      gainers: gainers.map((a) => ({ symbol: a.symbol, name: a.name, changePct: a.change_percent, price: fmtPrice(a.price), volume: a.volume })),
      losers: losers.map((a) => ({ symbol: a.symbol, name: a.name, changePct: a.change_percent, price: fmtPrice(a.price), volume: a.volume })),
      volume: gainers.map((a) => ({ symbol: a.symbol, name: a.name, changePct: a.change_percent, volume: a.volume })),
    },
    bottom: { watchlist: [], calendar: [], correlation: [] },
    screener: {
      assets: assets.slice(0, 20).map((a, i) => ({
        rank: i + 1,
        symbol: a.symbol,
        name: a.name,
        category: "degerli-metal" as const,
        price: a.price,
        unit: "—",
        changeDay: a.change_percent,
        changeWeek: a.change_percent,
        changeMonth: a.change_percent,
        volume: a.volume,
        sparkline: sparkOrFlat(a),
        trend: trendFromChange(a.change_percent),
      })),
    },
  };

  return {
    dashboard,
    zones: {
      ...LIVE_ZONES_NONE,
      pulse: true,
      regime: true,
      panels: true,
      movers: true,
      screener: assets.length > 0,
      segments: false,
      signals: false,
      bottomStrip: false,
    },
  };
}
