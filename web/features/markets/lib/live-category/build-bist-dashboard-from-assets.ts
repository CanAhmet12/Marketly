import type { BistCategoryDashboard } from "@/features/markets/repository/markets-repository";
import type { MarketAssetView } from "@/features/markets/types";

import { buildBistSignalsPayload } from "@/features/markets/bist/lib/build-bist-signals";
import { buildBistTreemapCells } from "@/features/markets/bist/lib/build-bist-treemap";
import {
  buildBistBottomStrip,
  buildBistMoversPayload,
} from "@/features/markets/bist/lib/bist-intel-utils";
import {
  buildBistIndexPanel,
  emptyBistIndexPanel,
} from "@/features/markets/bist/lib/bist-panel-utils";
import { buildBistPulseMetrics } from "@/features/markets/bist/lib/bist-pulse-utils";
import {
  buildBistMarketState,
  buildBistSectorHeatmap,
  resolveBistScreenerSector,
} from "@/features/markets/bist/lib/bist-regime-utils";

import {
  filterBistAssets,
  findAsset,
  sparkOrFlat,
  trendFromChange,
} from "./live-category-shared";
import { parseVolumeLabel } from "./parse-volume-label";
import type { LiveCategoryBuildResult } from "./live-category-zones";
import { LIVE_ZONES_NONE } from "./live-category-zones";

export function buildBistDashboardFromAssets(
  allAssets: readonly MarketAssetView[],
): LiveCategoryBuildResult<BistCategoryDashboard> | null {
  const assets = filterBistAssets(allAssets);
  if (!assets.length) return null;

  const xu100 = findAsset(assets, "XU100") ?? findAsset(assets, "BIST100") ?? assets[0]!;
  const xu030 = findAsset(assets, "XU030") ?? findAsset(assets, "BIST30") ?? assets[1] ?? assets[0]!;
  const xubank = findAsset(assets, "XUBANK") ?? findAsset(assets, "XBANK");

  const sectors = buildBistSectorHeatmap(assets);
  const movers = buildBistMoversPayload(assets);
  const bottom = buildBistBottomStrip(assets, allAssets);
  const signals = buildBistSignalsPayload(assets);
  const hasSignals = assets.some((a) => a.signal_active_count > 0);

  const stocks = assets.filter((a) => !a.symbol.startsWith("XU") && !a.symbol.startsWith("BIST"));
  const screenerAssets = [...stocks]
    .sort((a, b) => parseVolumeLabel(b.volume) - parseVolumeLabel(a.volume))
    .slice(0, 24)
    .map((a, i) => ({
      rank: i + 1,
      symbol: a.symbol.replace(".IS", ""),
      name: a.name,
      sector: resolveBistScreenerSector(a.symbol),
      price: a.price,
      changeDay: a.change_percent,
      changeWeek: a.change_percent * 1.4,
      volume: a.volume ?? "—",
      marketCap: a.marketCapLabel ?? "—",
      sparkline: sparkOrFlat(a),
      trend: trendFromChange(a.change_percent),
    }));

  const dashboard: BistCategoryDashboard = {
    pulse: buildBistPulseMetrics(assets),
    marketState: buildBistMarketState(assets),
    sectors: { sectors },
    panels: {
      bist100: buildBistIndexPanel(xu100, "BIST100"),
      bist30: buildBistIndexPanel(xu030, "BIST30"),
      bistBanka: xubank
        ? buildBistIndexPanel(xubank, "BISTBANK")
        : emptyBistIndexPanel("BIST Banka", "BISTBANK"),
    },
    movers,
    bottom,
    signals,
    screener: { assets: screenerAssets },
    treemap:
      screenerAssets.length >= 4
        ? { cells: buildBistTreemapCells(screenerAssets) }
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
