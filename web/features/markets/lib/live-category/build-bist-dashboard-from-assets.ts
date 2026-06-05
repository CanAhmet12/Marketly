import type { BistCategoryDashboard } from "@/features/markets/repository/markets-repository";
import type { MarketAssetView } from "@/features/markets/types";

import {
  avgChange,
  filterBistAssets,
  findAsset,
  fmtPrice,
  sortByChangeAsc,
  sortByChangeDesc,
  sparkOrFlat,
  trendFromChange,
} from "./live-category-shared";
import type { LiveCategoryBuildResult } from "./live-category-zones";
import { LIVE_ZONES_NONE } from "./live-category-zones";

function indexPanel(symbol: "BIST100" | "BIST30", asset: MarketAssetView) {
  return {
    symbol,
    name: asset.name,
    value: asset.price,
    changePercent: asset.change_percent,
    changeDay: asset.change_percent,
    sparkline: sparkOrFlat(asset),
    trend: trendFromChange(asset.change_percent),
    stats: { marketCap: asset.marketCapLabel, volume: asset.volume, highDay: fmtPrice(asset.price), lowDay: fmtPrice(asset.price) },
  };
}

export function buildBistDashboardFromAssets(
  allAssets: readonly MarketAssetView[],
): LiveCategoryBuildResult<BistCategoryDashboard> | null {
  const assets = filterBistAssets(allAssets);
  if (!assets.length) return null;

  const xu100 = findAsset(assets, "XU100") ?? findAsset(assets, "BIST100") ?? assets[0]!;
  const xu030 = findAsset(assets, "XU030") ?? findAsset(assets, "BIST30") ?? assets[1] ?? assets[0]!;
  const avg = avgChange(assets);
  const gainers = sortByChangeDesc(assets).slice(0, 5);
  const losers = sortByChangeAsc(assets).slice(0, 5);

  const dashboard: BistCategoryDashboard = {
    pulse: {
      bist100: { label: "BIST 100", value: xu100.price, changePercent: xu100.change_percent, sparkline: sparkOrFlat(xu100) },
      bist30: { label: "BIST 30", value: xu030.price, changePercent: xu030.change_percent, sparkline: sparkOrFlat(xu030) },
      bistBanka: { label: "Banka", value: 0, changePercent: 0, sparkline: [] },
      bistSinai: { label: "Sanayi", value: 0, changePercent: 0, sparkline: [] },
      toplamHacim: assets[0]?.volume ?? "—",
      yabancıOran: { value: 0, change: 0, label: "—" },
      piyasaDurumu: { value: Math.min(100, Math.max(0, 50 + avg * 10)), label: avg > 0 ? "Yükseliş" : avg < 0 ? "Satış" : "Yatay" },
    },
    marketState: {
      trend: avg > 0.5 ? "bull" : avg < -0.5 ? "bear" : "yatay",
      headline: avg > 0.5 ? "YÜKSELİŞ PİYASASI" : avg < -0.5 ? "DÜŞÜŞ PİYASASI" : "YATAY SEYİR",
      summary: `Canlı BIST kümesi: ${assets.length} sembol.`,
      bist100Value: xu100.price,
      bist100Change: xu100.change_percent,
      stats: { volatilite: "—", yabancıNetAlım: "—", teknikGorunum: "—", momentum: "—" },
      sectorDistribution: { mali: 0, sanayi: 0, diger: 100 },
    },
    sectors: { sectors: [] },
    panels: { bist100: indexPanel("BIST100", xu100), bist30: indexPanel("BIST30", xu030) },
    movers: {
      gainers: gainers.map((a) => ({ symbol: a.symbol, name: a.name, change: a.change_percent, price: fmtPrice(a.price), volume: a.volume })),
      losers: losers.map((a) => ({ symbol: a.symbol, name: a.name, change: a.change_percent, price: fmtPrice(a.price), volume: a.volume })),
      volume: gainers.map((a) => ({ symbol: a.symbol, name: a.name, change: a.change_percent, volume: a.volume })),
    },
    bottom: { watchlist: [], gundem: [], fx: [] },
    screener: {
      assets: assets.slice(0, 20).map((a, i) => ({
        rank: i + 1,
        symbol: a.symbol,
        name: a.name,
        sector: "—",
        price: a.price,
        changeDay: a.change_percent,
        changeWeek: a.change_percent,
        volume: a.volume,
        marketCap: a.marketCapLabel,
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
