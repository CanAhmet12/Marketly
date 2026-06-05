import type { CryptoCategoryDashboard } from "@/features/markets/repository/markets-repository";
import type { MarketAssetView } from "@/features/markets/types";

import {
  avgChange,
  filterCategory,
  findAsset,
  fmtPrice,
  sortByChangeAsc,
  sortByChangeDesc,
  sparkOrFlat,
  trendFromChange,
} from "./live-category-shared";
import type { LiveCategoryBuildResult } from "./live-category-zones";
import { LIVE_ZONES_NONE } from "./live-category-zones";

function fearGreedFromAvgChange(avg: number): { value: number; label: string } {
  const value = Math.min(100, Math.max(0, Math.round(50 + avg * 8)));
  const label =
    value <= 25 ? "Aşırı Korku" : value <= 45 ? "Korku" : value <= 55 ? "Nötr" : value <= 75 ? "Açgözlülük" : "Aşırı Açgözlülük";
  return { value, label };
}

export function buildCryptoDashboardFromAssets(
  allAssets: readonly MarketAssetView[],
): LiveCategoryBuildResult<CryptoCategoryDashboard> | null {
  const assets = filterCategory(allAssets, "crypto");
  if (!assets.length) return null;

  const btc = findAsset(assets, "BTC");
  const eth = findAsset(assets, "ETH");
  const avg = avgChange(assets);
  const fg = fearGreedFromAvgChange(avg);

  const regimeType = avg > 1 ? "bull" as const : avg < -1 ? "bear" as const : "chop" as const;

  const gainers = sortByChangeDesc(assets).slice(0, 5);
  const losers = sortByChangeAsc(assets).slice(0, 5);
  const volatile = [...assets].sort((a, b) => Math.abs(b.change_percent) - Math.abs(a.change_percent)).slice(0, 5);

  const screenerAssets = sortByChangeDesc(assets).slice(0, 20).map((a, i) => ({
    rank: i + 1,
    symbol: a.symbol,
    name: a.name,
    price: a.price,
    change24h: a.change_percent,
    change7d: a.change_percent,
    marketCap: a.marketCapLabel,
    volume24h: a.volume,
    sparkline: sparkOrFlat(a),
    trend: trendFromChange(a.change_percent),
  }));

  const hasSignals = assets.some((a) => a.signal_active_count > 0);

  const dashboard: CryptoCategoryDashboard = {
    phase1: {
      pulse: {
        btc: {
          price: btc?.price ?? assets[0]!.price,
          change24h: btc?.change_percent ?? assets[0]!.change_percent,
          marketCapLabel: btc?.marketCapLabel ?? "—",
        },
        eth: {
          price: eth?.price ?? assets[1]?.price ?? 0,
          change24h: eth?.change_percent ?? assets[1]?.change_percent ?? 0,
          marketCapLabel: eth?.marketCapLabel ?? "—",
        },
        btcDominance: "—",
        ethDominance: "—",
        ethBtcRatio: "—",
        totalMarketCap: "—",
        totalMarketCapChange24h: avg,
        volume24h: assets[0]?.volume ?? "—",
        fearGreed: fg,
        altcoinSeasonIndex: Math.min(100, Math.max(0, Math.round(50 - avg * 5))),
      },
      regime: {
        regime: regimeType,
        summary: `Canlı kripto kümesi: ${assets.length} sembol, ortalama 24s değişim ${avg.toFixed(2)}%.`,
        volatilityBand: volatile[0] && Math.abs(volatile[0].change_percent) > 5 ? "high" : avg > 2 ? "medium" : "low",
        volatilityLabel: volatile[0] && Math.abs(volatile[0].change_percent) > 5 ? "Yüksek" : "Orta",
        riskBias: Math.min(100, Math.max(0, Math.round(50 + avg * 10))),
        riskBiasLabel: avg > 0 ? "Risk-on" : avg < 0 ? "Risk-off" : "Nötr",
        stablecoinFlowLabel: "—",
        btcDominanceNumeric: 0,
        ethDominanceNumeric: 0,
      },
      btc: {
        symbol: "BTC",
        name: btc?.name ?? "Bitcoin",
        price: btc?.price ?? 0,
        change24h: btc?.change_percent ?? 0,
        change7d: btc?.change_percent ?? 0,
        marketCap: btc?.marketCapLabel ?? "—",
        volume24h: btc?.volume ?? "—",
        sparkline7d: btc ? sparkOrFlat(btc) : [],
        trend: trendFromChange(btc?.change_percent ?? 0),
      },
      eth: {
        symbol: "ETH",
        name: eth?.name ?? "Ethereum",
        price: eth?.price ?? 0,
        change24h: eth?.change_percent ?? 0,
        change7d: eth?.change_percent ?? 0,
        marketCap: eth?.marketCapLabel ?? "—",
        volume24h: eth?.volume ?? "—",
        sparkline7d: eth ? sparkOrFlat(eth) : [],
        trend: trendFromChange(eth?.change_percent ?? 0),
      },
    },
    movers: {
      gainers: gainers.map((a) => ({ symbol: a.symbol, change: a.change_percent, price: fmtPrice(a.price), volume: a.volume })),
      losers: losers.map((a) => ({ symbol: a.symbol, change: a.change_percent, price: fmtPrice(a.price), volume: a.volume })),
      volume: volatile.map((a) => ({ symbol: a.symbol, change: a.change_percent, volume: a.volume })),
      volatile: volatile.map((a) => ({ symbol: a.symbol, change: a.change_percent, volatility: `${Math.abs(a.change_percent).toFixed(2)}%` })),
    },
    segments: { segments: [] },
    signals: hasSignals
      ? {
          totalActiveSignals: assets.reduce((s, a) => s + a.signal_active_count, 0),
          bullPct: Math.round(assets.reduce((s, a) => s + a.signal_bull_pct, 0) / assets.length),
          bearPct: 100 - Math.round(assets.reduce((s, a) => s + a.signal_bull_pct, 0) / assets.length),
          marketBiasLabel: "Canlı sinyal özeti",
          topAssets: assets
            .filter((a) => a.signal_active_count > 0)
            .slice(0, 6)
            .map((a) => ({
              symbol: a.symbol,
              activeSignals: a.signal_active_count,
              bullPct: a.signal_bull_pct,
              biasLabel: a.signal_bull_pct >= 50 ? "Bull" : "Bear",
            })),
        }
      : {
          totalActiveSignals: 0,
          bullPct: 50,
          bearPct: 50,
          marketBiasLabel: "—",
          topAssets: [],
        },
    screener: { assets: screenerAssets },
    bottomStrip: {
      watchlist: gainers.slice(0, 4).map((a) => ({
        symbol: a.symbol,
        name: a.name,
        price: a.price,
        change24h: a.change_percent,
        sparkline: sparkOrFlat(a),
        trend: trendFromChange(a.change_percent),
      })),
      news: [],
      calendar: [],
    },
  };

  return {
    dashboard,
    zones: {
      ...LIVE_ZONES_NONE,
      pulse: true,
      regime: true,
      panels: Boolean(btc || eth),
      movers: gainers.length > 0 || losers.length > 0,
      screener: screenerAssets.length > 0,
      signals: hasSignals,
      bottomStrip: gainers.length > 0,
      segments: false,
    },
  };
}
