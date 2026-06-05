import type { ForexCategoryDashboard } from "@/features/markets/repository/markets-repository";
import type { MarketAssetView } from "@/features/markets/types";

import {
  avgChange,
  filterForexAssets,
  findAsset,
  fmtPrice,
  pairLabel,
  sortByChangeAsc,
  sortByChangeDesc,
  sparkOrFlat,
  trendFromChange,
} from "./live-category-shared";
import type { LiveCategoryBuildResult } from "./live-category-zones";
import { LIVE_ZONES_NONE } from "./live-category-zones";

function pairPanel(asset: MarketAssetView) {
  const pair = pairLabel(asset.symbol);
  const [base, quote] = pair.includes("/") ? pair.split("/") : [pair.slice(0, 3), pair.slice(3)];
  return {
    pair,
    base: base ?? pair,
    quote: quote ?? "USD",
    rate: asset.price,
    changePct: asset.change_percent,
    bid: asset.price * 0.9999,
    ask: asset.price * 1.0001,
    spread: 1,
    sparkline: sparkOrFlat(asset),
    trend: trendFromChange(asset.change_percent),
    stats: { dayHigh: fmtPrice(asset.price * 1.01), dayLow: fmtPrice(asset.price * 0.99), pipRange: "—", weeklyChange: fmtPrice(asset.change_percent) },
  };
}

export function buildForexDashboardFromAssets(
  allAssets: readonly MarketAssetView[],
): LiveCategoryBuildResult<ForexCategoryDashboard> | null {
  const assets = filterForexAssets(allAssets);
  if (!assets.length) return null;

  const eurusd = findAsset(assets, "EURUSD") ?? assets[0]!;
  const gbpusd = findAsset(assets, "GBPUSD") ?? assets[1] ?? assets[0]!;
  const usdtry = findAsset(assets, "USDTRY");
  const usdjpy = findAsset(assets, "USDJPY");
  const avg = avgChange(assets);

  const gainers = sortByChangeDesc(assets).slice(0, 5);
  const losers = sortByChangeAsc(assets).slice(0, 5);

  const dashboard: ForexCategoryDashboard = {
    pulse: {
      eurusd: { pair: pairLabel(eurusd.symbol), rate: eurusd.price, changePct: eurusd.change_percent, sparkline: sparkOrFlat(eurusd) },
      gbpusd: { pair: pairLabel(gbpusd.symbol), rate: gbpusd.price, changePct: gbpusd.change_percent, sparkline: sparkOrFlat(gbpusd) },
      usdtry: usdtry
        ? { pair: pairLabel(usdtry.symbol), rate: usdtry.price, changePct: usdtry.change_percent, sparkline: sparkOrFlat(usdtry) }
        : { pair: "USD/TRY", rate: 0, changePct: 0, sparkline: [] },
      usdjpy: usdjpy
        ? { pair: pairLabel(usdjpy.symbol), rate: usdjpy.price, changePct: usdjpy.change_percent, sparkline: sparkOrFlat(usdjpy) }
        : { pair: "USD/JPY", rate: 0, changePct: 0, sparkline: [] },
      dxy: { value: 0, changePct: avg, sparkline: [] },
      sessions: [],
      volatility: { value: Math.min(100, Math.abs(avg) * 20), label: Math.abs(avg) > 2 ? "Yüksek" : "Orta" },
    },
    regime: {
      regime: avg > 0.3 ? "usd-dominant" : avg < -0.3 ? "risk-on" : "range",
      headline: avg > 0.3 ? "USD BASKIN" : avg < -0.3 ? "RISK-ON" : "YATAY",
      summary: `Canlı FX: ${assets.length} parite, ortalama değişim ${avg.toFixed(2)}%.`,
      dxyValue: 0,
      dxyChange: avg,
      stats: { fedTutumu: "—", riskIstahi: "—", carryTrade: "—", trendGucu: "—" },
      distribution: { safe: 33, risky: 33, em: 34 },
    },
    currencies: { currencies: [] },
    panels: { eurusd: pairPanel(eurusd), gbpusd: pairPanel(gbpusd) },
    movers: {
      gainers: gainers.map((a) => ({ pair: pairLabel(a.symbol), changePct: a.change_percent })),
      losers: losers.map((a) => ({ pair: pairLabel(a.symbol), changePct: a.change_percent })),
      active: gainers.slice(0, 3).map((a) => ({ pair: pairLabel(a.symbol), changePct: a.change_percent })),
    },
    bottom: { watchlist: [], centralBanks: [], commodities: [] },
    screener: {
      assets: assets.slice(0, 20).map((a, i) => ({
        rank: i + 1,
        pair: pairLabel(a.symbol),
        category: "major" as const,
        bid: a.price * 0.9999,
        ask: a.price * 1.0001,
        spread: 1,
        pipChange: a.change_percent,
        changePct: a.change_percent,
        dayHigh: a.price * 1.01,
        dayLow: a.price * 0.99,
        session: "ALL" as const,
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
