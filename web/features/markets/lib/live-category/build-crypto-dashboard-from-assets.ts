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
import { parseVolumeLabel } from "./parse-volume-label";
import type { LiveCategoryBuildResult } from "./live-category-zones";
import { LIVE_ZONES_NONE } from "./live-category-zones";
import { buildCryptoTreemapCells } from "@/features/markets/crypto/lib/build-crypto-treemap";
import { buildCryptoSegmentHeatmap } from "@/features/markets/crypto/lib/crypto-segment-utils";

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
  const sol = findAsset(assets, "SOL");
  const avg = avgChange(assets);
  const fg = fearGreedFromAvgChange(avg);

  const regimeType = avg > 1 ? "bull" as const : avg < -1 ? "bear" as const : "chop" as const;

  const capTotal = assets.reduce((s, a) => s + parseVolumeLabel(a.marketCapLabel), 0);
  const btcCap = btc ? parseVolumeLabel(btc.marketCapLabel) : 0;
  const ethCap = eth ? parseVolumeLabel(eth.marketCapLabel) : 0;
  const btcDom =
    capTotal > 0 && btcCap > 0
      ? Math.round((btcCap / capTotal) * 1000) / 10
      : 52.4;
  const ethDom =
    capTotal > 0 && ethCap > 0
      ? Math.round((ethCap / capTotal) * 1000) / 10
      : 16.8;
  const btcDomChange = btc ? Math.round(btc.change_percent * 0.06 * 100) / 100 : null;
  const ethBtc =
    btc && eth && btc.price > 0 ? (eth.price / btc.price).toFixed(4) : "—";
  const totalCapLabel =
    capTotal >= 1e12
      ? `$${(capTotal / 1e12).toFixed(2)}T`
      : capTotal >= 1e9
        ? `$${(capTotal / 1e9).toFixed(1)}B`
        : "—";

  const gainers = sortByChangeDesc(assets).slice(0, 5);
  const losers = sortByChangeAsc(assets).slice(0, 5);
  const volatile = [...assets].sort((a, b) => Math.abs(b.change_percent) - Math.abs(a.change_percent)).slice(0, 5);
  const volumeLeaders = [...assets]
    .sort((a, b) => parseVolumeLabel(b.volume) - parseVolumeLabel(a.volume))
    .slice(0, 5);
  const topVolumeAsset = volumeLeaders[0];

  const screenerAssets = [...assets]
    .sort((a, b) => parseVolumeLabel(b.marketCapLabel) - parseVolumeLabel(a.marketCapLabel))
    .slice(0, 20)
    .map((a, i) => ({
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
  const segments = buildCryptoSegmentHeatmap(assets);

  const dashboard: CryptoCategoryDashboard = {
    phase1: {
      pulse: {
        btc: {
          price: btc?.price ?? assets[0]!.price,
          change24h: btc?.change_percent ?? assets[0]!.change_percent,
          marketCapLabel: btc?.marketCapLabel ?? "—",
          sparkline: btc ? sparkOrFlat(btc) : undefined,
        },
        eth: {
          price: eth?.price ?? assets[1]?.price ?? 0,
          change24h: eth?.change_percent ?? assets[1]?.change_percent ?? 0,
          marketCapLabel: eth?.marketCapLabel ?? "—",
          sparkline: eth ? sparkOrFlat(eth) : undefined,
        },
        btcDominance: `${btcDom}%`,
        ethDominance: `${ethDom}%`,
        ethBtcRatio: ethBtc,
        totalMarketCap: totalCapLabel,
        totalMarketCapChange24h: avg,
        volume24h: assets[0]?.volume ?? "—",
        fearGreed: fg,
        altcoinSeasonIndex: Math.min(100, Math.max(0, Math.round(50 - avg * 5))),
        volumeSparkline: topVolumeAsset ? sparkOrFlat(topVolumeAsset) : undefined,
      },
      regime: {
        regime: regimeType,
        summary: `Canlı kripto kümesi: ${assets.length} sembol, ortalama 24s değişim ${avg.toFixed(2)}%.`,
        volatilityBand: volatile[0] && Math.abs(volatile[0].change_percent) > 5 ? "high" : avg > 2 ? "medium" : "low",
        volatilityLabel: volatile[0] && Math.abs(volatile[0].change_percent) > 5 ? "Yüksek" : "Orta",
        riskBias: Math.min(100, Math.max(0, Math.round(50 + avg * 10))),
        riskBiasLabel: avg > 0 ? "Risk-on" : avg < 0 ? "Risk-off" : "Nötr",
        stablecoinFlowLabel: avg > 0.5 ? "Risk varlıklara akış" : avg < -0.5 ? "Defansif akış" : "Nötr akış",
        btcDominanceNumeric: btcDom,
        ethDominanceNumeric: ethDom,
        btcDominanceChange24h: btcDomChange,
        momentumLabel: regimeType === "bull" ? "Güçlü" : regimeType === "bear" ? "Zayıf" : "Nötr",
        momentumSubLabel: regimeType === "bull" ? "Yükseliş" : regimeType === "bear" ? "Düşüş" : "Yatay",
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
      sol: {
        symbol: "SOL",
        name: sol?.name ?? "Solana",
        price: sol?.price ?? 0,
        change24h: sol?.change_percent ?? 0,
        change7d: sol?.change_percent ?? 0,
        marketCap: sol?.marketCapLabel ?? "—",
        volume24h: sol?.volume ?? "—",
        sparkline7d: sol ? sparkOrFlat(sol) : [],
        trend: trendFromChange(sol?.change_percent ?? 0),
      },
    },
    movers: {
      gainers: gainers.map((a) => ({ symbol: a.symbol, change: a.change_percent, price: fmtPrice(a.price), volume: a.volume })),
      losers: losers.map((a) => ({ symbol: a.symbol, change: a.change_percent, price: fmtPrice(a.price), volume: a.volume })),
      volume: volumeLeaders.map((a) => ({ symbol: a.symbol, change: a.change_percent, volume: a.volume })),
      volatile: volatile.map((a) => ({ symbol: a.symbol, change: a.change_percent, volatility: `${Math.abs(a.change_percent).toFixed(2)}%` })),
    },
    segments: { segments },
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
              biasLabel: a.signal_bull_pct >= 58 ? "Bull bias" : a.signal_bull_pct <= 42 ? "Bear bias" : "Nötr",
              assetName: a.name,
              avgConfidence: Math.min(92, Math.max(38, Math.round(48 + Math.abs(a.signal_bull_pct - 50) * 0.9))),
              dominantDirection:
                a.signal_bull_pct >= 58 ? "BUY" as const : a.signal_bull_pct <= 42 ? "SELL" as const : "HOLD" as const,
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
    treemap: screenerAssets.length >= 4 ? { cells: buildCryptoTreemapCells(screenerAssets) } : undefined,
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
      panels: Boolean(btc || eth || sol),
      movers: gainers.length > 0 || losers.length > 0,
      screener: screenerAssets.length > 0,
      signals: hasSignals,
      bottomStrip: gainers.length > 0,
      segments: segments.length >= 4,
      treemap: screenerAssets.length >= 4,
      intelDeck: gainers.length > 0 || losers.length > 0 || volumeLeaders.length > 0 || volatile.length > 0,
    },
  };
}
