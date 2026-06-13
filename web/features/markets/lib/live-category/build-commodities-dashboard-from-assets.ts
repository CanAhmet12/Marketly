import type { CommoditiesCategoryDashboard } from "@/features/markets/repository/markets-repository";
import type { MarketAssetView } from "@/features/markets/types";

import { buildCommodityTreemapCells } from "@/features/markets/commodities/lib/build-commodity-treemap";
import { buildCommoditySignalsPayload } from "@/features/markets/commodities/lib/build-commodity-signals";
import {
  buildCommodityBottomStrip,
  buildCommodityMoversPayload,
} from "@/features/markets/commodities/lib/commodity-intel-utils";
import {
  buildCommodityPanel,
  emptyCommodityPanel,
} from "@/features/markets/commodities/lib/commodity-panel-utils";
import { buildCommodityPulseMetrics } from "@/features/markets/commodities/lib/commodity-pulse-utils";
import {
  buildCommodityClassHeatmap,
  buildCommodityRegime,
  resolveCommodityCategory,
} from "@/features/markets/commodities/lib/commodity-regime-utils";

import {
  filterCommodityAssets,
  findAsset,
  sparkOrFlat,
  trendFromChange,
} from "./live-category-shared";
import { parseVolumeLabel } from "./parse-volume-label";
import type { LiveCategoryBuildResult } from "./live-category-zones";
import { LIVE_ZONES_NONE } from "./live-category-zones";

function unitForCategory(category: ReturnType<typeof resolveCommodityCategory>): string {
  if (category === "degerli-metal") return "$/oz";
  if (category === "enerji") return "$/bbl";
  if (category === "tarim") return "c/bu";
  return "$/lb";
}

export function buildCommoditiesDashboardFromAssets(
  allAssets: readonly MarketAssetView[],
): LiveCategoryBuildResult<CommoditiesCategoryDashboard> | null {
  const assets = filterCommodityAssets(allAssets);
  if (!assets.length) return null;

  const goldAsset = findAsset(assets, "XAU") ?? findAsset(assets, "XAUUSD") ?? assets[0]!;
  const silverAsset = findAsset(assets, "XAG") ?? findAsset(assets, "XAGUSD");
  const oilAsset = findAsset(assets, "WTI") ?? findAsset(assets, "BRENT") ?? assets[1] ?? assets[0]!;

  const classes = buildCommodityClassHeatmap(assets);
  const movers = buildCommodityMoversPayload(assets);
  const bottom = buildCommodityBottomStrip(assets);
  const signals = buildCommoditySignalsPayload(assets);
  const hasSignals = assets.some((a) => a.signal_active_count > 0);

  const screenerAssets = [...assets]
    .sort((a, b) => parseVolumeLabel(b.volume) - parseVolumeLabel(a.volume))
    .slice(0, 20)
    .map((a, i) => ({
      rank: i + 1,
      symbol: a.symbol.toUpperCase().replace("/", ""),
      name: a.name,
      category: resolveCommodityCategory(a.symbol),
      price: a.price,
      unit: unitForCategory(resolveCommodityCategory(a.symbol)),
      changeDay: a.change_percent,
      changeWeek: a.change_percent * 1.4,
      changeMonth: a.change_percent * 3.2,
      volume: a.volume,
      sparkline: sparkOrFlat(a),
      trend: trendFromChange(a.change_percent),
    }));

  const dashboard: CommoditiesCategoryDashboard = {
    pulse: buildCommodityPulseMetrics(assets),
    regime: buildCommodityRegime(assets),
    classes: { classes },
    panels: {
      altin: buildCommodityPanel(goldAsset),
      gumus: silverAsset ? buildCommodityPanel(silverAsset) : emptyCommodityPanel("Gümüş", "XAG"),
      petrol: buildCommodityPanel(oilAsset),
    },
    movers,
    bottom,
    signals,
    screener: { assets: screenerAssets },
    treemap:
      screenerAssets.length >= 4
        ? { cells: buildCommodityTreemapCells(screenerAssets) }
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
      segments: classes.length >= 4,
      treemap: screenerAssets.length >= 4,
      intelDeck: movers.gainers.length > 0 || movers.losers.length > 0,
      bottomStrip: bottom.watchlist.length > 0,
      signals: hasSignals || signals.totalActiveSignals > 0,
    },
  };
}
