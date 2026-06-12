import type { ForexCategoryDashboard } from "@/features/markets/repository/markets-repository";
import type { MarketAssetView } from "@/features/markets/types";

import { buildForexSignalsPayload, resolveForexScreenerSession } from "@/features/markets/forex/lib/build-forex-signals";
import { buildForexTreemapCells } from "@/features/markets/forex/lib/build-forex-treemap";
import { buildForexCurrencyHeatmap } from "@/features/markets/forex/lib/forex-currency-utils";
import {
  buildForexBottomStrip,
  buildForexMoversPayload,
} from "@/features/markets/forex/lib/forex-intel-utils";
import {
  buildForexPairPanel,
  emptyForexPairPanel,
} from "@/features/markets/forex/lib/forex-pair-panel-utils";
import { buildForexPulseMetrics, resolveForexDxy } from "@/features/markets/forex/lib/forex-pulse-utils";
import { buildForexRegime } from "@/features/markets/forex/lib/forex-regime-utils";

import {
  filterForexAssets,
  findAsset,
  pairLabel,
  sparkOrFlat,
  trendFromChange,
} from "./live-category-shared";
import { parseVolumeLabel } from "./parse-volume-label";
import type { LiveCategoryBuildResult } from "./live-category-zones";
import { LIVE_ZONES_NONE } from "./live-category-zones";

const MAJOR_PAIRS = new Set([
  "EURUSD",
  "GBPUSD",
  "USDJPY",
  "USDCHF",
  "AUDUSD",
  "USDCAD",
  "NZDUSD",
]);

function resolveForexScreenerCategory(symbol: string): "major" | "minor" | "exotic" {
  const s = symbol.toUpperCase().replace("/", "");
  if (MAJOR_PAIRS.has(s)) return "major";
  const exotic = ["TRY", "ZAR", "MXN", "HUF", "PLN", "CZK", "SEK", "NOK", "SGD", "HKD"];
  if (exotic.some((c) => s.includes(c))) return "exotic";
  return "minor";
}

export function buildForexDashboardFromAssets(
  allAssets: readonly MarketAssetView[],
): LiveCategoryBuildResult<ForexCategoryDashboard> | null {
  const assets = filterForexAssets(allAssets);
  if (!assets.length) return null;

  const eurusdAsset = findAsset(assets, "EURUSD") ?? assets[0]!;
  const gbpusdAsset = findAsset(assets, "GBPUSD") ?? assets[1] ?? assets[0]!;
  const usdjpyAsset = findAsset(assets, "USDJPY");
  const dxy = resolveForexDxy(assets);
  const currencies = buildForexCurrencyHeatmap(assets);

  const movers = buildForexMoversPayload(assets);
  const bottom = buildForexBottomStrip(assets, allAssets);
  const signals = buildForexSignalsPayload(assets);
  const hasSignals = assets.some((a) => a.signal_active_count > 0);
  const session = resolveForexScreenerSession();

  const screenerAssets = [...assets]
    .sort((a, b) => parseVolumeLabel(b.volume) - parseVolumeLabel(a.volume))
    .slice(0, 20)
    .map((a, i) => ({
      rank: i + 1,
      symbol: a.symbol.toUpperCase().replace("/", ""),
      pair: pairLabel(a.symbol),
      category: resolveForexScreenerCategory(a.symbol),
      bid: a.price * 0.9999,
      ask: a.price * 1.0001,
      spread: 1,
      pipChange: a.change_percent,
      changePct: a.change_percent,
      dayHigh: a.price * 1.01,
      dayLow: a.price * 0.99,
      session,
      sparkline: sparkOrFlat(a),
      trend: trendFromChange(a.change_percent),
      volume: a.volume,
    }));

  const dashboard: ForexCategoryDashboard = {
    pulse: buildForexPulseMetrics(assets),
    regime: buildForexRegime(assets, dxy),
    currencies: { currencies },
    panels: {
      eurusd: buildForexPairPanel(eurusdAsset),
      gbpusd: buildForexPairPanel(gbpusdAsset),
      usdjpy: usdjpyAsset ? buildForexPairPanel(usdjpyAsset) : emptyForexPairPanel("USD/JPY", "USDJPY"),
    },
    movers,
    bottom,
    signals,
    screener: { assets: screenerAssets },
    treemap:
      screenerAssets.length >= 4
        ? { cells: buildForexTreemapCells(screenerAssets) }
        : undefined,
  };

  return {
    dashboard,
    zones: {
      ...LIVE_ZONES_NONE,
      pulse: true,
      regime: true,
      panels: true,
      movers: true,
      screener: screenerAssets.length > 0,
      segments: currencies.length >= 4,
      treemap: screenerAssets.length >= 4,
      intelDeck: movers.gainers.length > 0 || movers.losers.length > 0,
      bottomStrip: bottom.watchlist.length > 0,
      signals: hasSignals,
    },
  };
}
