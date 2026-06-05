import type { NasdaqCategoryDashboard } from "@/features/markets/repository/markets-repository";
import type { MarketAssetView } from "@/features/markets/types";

import {
  avgChange,
  filterNasdaqAssets,
  findAsset,
  fmtPrice,
  sortByChangeAsc,
  sortByChangeDesc,
  sparkOrFlat,
  trendFromChange,
} from "./live-category-shared";
import type { LiveCategoryBuildResult } from "./live-category-zones";
import { LIVE_ZONES_NONE } from "./live-category-zones";

function indexPanel(symbol: string, asset: MarketAssetView) {
  return {
    symbol,
    name: asset.name,
    value: asset.price,
    changePct: asset.change_percent,
    changePoint: asset.change_percent,
    sparkline: sparkOrFlat(asset),
    trend: trendFromChange(asset.change_percent),
    stats: { haftalik: fmtPrice(asset.change_percent), aylik: "—", destek: "—", direnc: "—" },
  };
}

export function buildNasdaqDashboardFromAssets(
  allAssets: readonly MarketAssetView[],
): LiveCategoryBuildResult<NasdaqCategoryDashboard> | null {
  const assets = filterNasdaqAssets(allAssets);
  if (!assets.length) return null;

  const ndx = findAsset(assets, "NDX") ?? findAsset(assets, "QQQ") ?? assets[0]!;
  const spx = findAsset(assets, "SPX") ?? assets[1] ?? assets[0]!;
  const avg = avgChange(assets);
  const gainers = sortByChangeDesc(assets).slice(0, 5);
  const losers = sortByChangeAsc(assets).slice(0, 5);

  const dashboard: NasdaqCategoryDashboard = {
    pulse: {
      ndx: { label: "NASDAQ 100", value: ndx.price, changePct: ndx.change_percent, sparkline: sparkOrFlat(ndx) },
      composite: { label: "NASDAQ Composite", value: ndx.price, changePct: ndx.change_percent, sparkline: sparkOrFlat(ndx) },
      sp500: { label: "S&P 500", value: spx.price, changePct: spx.change_percent, sparkline: sparkOrFlat(spx) },
      vix: { value: 0, changePct: 0 },
      totalVolume: assets[0]?.volume ?? "—",
      marketMood: { value: Math.min(100, Math.max(0, 50 + avg * 10)), label: avg > 0 ? "Risk-On" : avg < 0 ? "Risk-Off" : "Nötr" },
      fedPivot: { value: 50, label: "—" },
    },
    regime: {
      regime: avg > 0.5 ? "tech-rally" : avg < -0.5 ? "duzeltme" : "karisik",
      headline: avg > 0.5 ? "TECH RALLY" : avg < -0.5 ? "DÜZELTME" : "KARIŞIK",
      summary: `Canlı NASDAQ kümesi: ${assets.length} sembol.`,
      ndxValue: ndx.price,
      ndxChange: ndx.change_percent,
      stats: { bigTechHareket: "—", faizBeklentisi: "—", buyumeMomentu: "—", teknik: "—" },
      distribution: { tech: 0, health: 0, other: 100 },
    },
    sectors: { sectors: [] },
    panels: { ndx: indexPanel("NDX", ndx), sp500: indexPanel("SPX", spx) },
    movers: {
      gainers: gainers.map((a) => ({ symbol: a.symbol, name: a.name, changePct: a.change_percent, price: fmtPrice(a.price), volume: a.volume })),
      losers: losers.map((a) => ({ symbol: a.symbol, name: a.name, changePct: a.change_percent, price: fmtPrice(a.price), volume: a.volume })),
      volume: gainers.map((a) => ({ symbol: a.symbol, name: a.name, changePct: a.change_percent, volume: a.volume })),
    },
    bottom: { watchlist: [], earnings: [], macroFed: [] },
    screener: {
      assets: assets.slice(0, 20).map((a, i) => ({
        rank: i + 1,
        symbol: a.symbol,
        name: a.name,
        sector: "diger" as const,
        price: a.price,
        changeDay: a.change_percent,
        changeWeek: a.change_percent,
        marketCap: a.marketCapLabel,
        pe: null,
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
