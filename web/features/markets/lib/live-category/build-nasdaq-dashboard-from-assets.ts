import type { NasdaqCategoryDashboard } from "@/features/markets/repository/markets-repository";
import type { MarketAssetView } from "@/features/markets/types";

import { buildNasdaqSignalsPayload } from "@/features/markets/nasdaq/lib/build-nasdaq-signals";
import { buildNasdaqTreemapCells } from "@/features/markets/nasdaq/lib/build-nasdaq-treemap";
import {
  buildNasdaqBottomStrip,
  buildNasdaqMoversPayload,
} from "@/features/markets/nasdaq/lib/nasdaq-intel-utils";
import {
  buildNasdaqIndexPanel,
  emptyNasdaqIndexPanel,
} from "@/features/markets/nasdaq/lib/nasdaq-panel-utils";
import { buildNasdaqPulseMetrics } from "@/features/markets/nasdaq/lib/nasdaq-pulse-utils";
import {
  buildNasdaqSectorHeatmap,
  buildNasdaqRegime,
  resolveNasdaqScreenerSector,
} from "@/features/markets/nasdaq/lib/nasdaq-regime-utils";

import {
  filterNasdaqAssets,
  findAsset,
  sparkOrFlat,
  trendFromChange,
} from "./live-category-shared";
import { parseVolumeLabel } from "./parse-volume-label";
import type { LiveCategoryBuildResult } from "./live-category-zones";
import { LIVE_ZONES_NONE } from "./live-category-zones";

export function buildNasdaqDashboardFromAssets(
  allAssets: readonly MarketAssetView[],
): LiveCategoryBuildResult<NasdaqCategoryDashboard> | null {
  const assets = filterNasdaqAssets(allAssets);
  if (!assets.length) return null;

  const ndxAsset = findAsset(assets, "NDX") ?? findAsset(assets, "QQQ") ?? assets[0]!;
  const compAsset = findAsset(assets, "COMP") ?? ndxAsset;
  const spxAsset = findAsset(assets, "SPX") ?? findAsset(assets, "SP500") ?? assets[1] ?? assets[0]!;

  const sectors = buildNasdaqSectorHeatmap(assets);
  const movers = buildNasdaqMoversPayload(assets);
  const bottom = buildNasdaqBottomStrip(assets);
  const signals = buildNasdaqSignalsPayload(assets);
  const hasSignals = assets.some((a) => a.signal_active_count > 0);

  const screenerAssets = [...assets]
    .sort((a, b) => parseVolumeLabel(b.volume) - parseVolumeLabel(a.volume))
    .slice(0, 24)
    .map((a, i) => ({
      rank: i + 1,
      symbol: a.symbol.toUpperCase(),
      name: a.name,
      sector: resolveNasdaqScreenerSector(a.symbol),
      price: a.price,
      changeDay: a.change_percent,
      changeWeek: a.change_percent * 1.4,
      marketCap: a.marketCapLabel ?? a.volume ?? "—",
      pe: null,
      sparkline: sparkOrFlat(a),
      trend: trendFromChange(a.change_percent),
    }));

  const dashboard: NasdaqCategoryDashboard = {
    pulse: buildNasdaqPulseMetrics(assets),
    regime: buildNasdaqRegime(assets),
    sectors: { sectors },
    panels: {
      ndx: buildNasdaqIndexPanel(ndxAsset),
      composite: compAsset ? buildNasdaqIndexPanel(compAsset) : emptyNasdaqIndexPanel("NASDAQ Composite", "COMP"),
      sp500: spxAsset ? buildNasdaqIndexPanel(spxAsset) : emptyNasdaqIndexPanel("S&P 500", "SPX"),
    },
    movers,
    bottom,
    signals,
    screener: { assets: screenerAssets },
    treemap:
      screenerAssets.length >= 4
        ? { cells: buildNasdaqTreemapCells(screenerAssets) }
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
      segments: sectors.length >= 4,
      treemap: screenerAssets.length >= 4,
      intelDeck: movers.gainers.length > 0 || movers.losers.length > 0,
      bottomStrip: bottom.watchlist.length > 0,
      signals: hasSignals || signals.totalActiveSignals > 0,
    },
  };
}
