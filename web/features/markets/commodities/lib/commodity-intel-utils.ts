import type {
  CommodityBottomStripPayload,
  CommodityCalendarItem,
  CommodityMoverItem,
  CommodityMoversPayload,
  CommodityWatchItem,
} from "@/features/markets/commodities/types";
import type { EconomicCalendarRow } from "@/features/markets/repository/markets-repository";
import type { MarketAssetView } from "@/features/markets/types";

import {
  sortByChangeAsc,
  sortByChangeDesc,
  sparkOrFlat,
  trendFromChange,
} from "@/features/markets/lib/live-category/live-category-shared";

import { parseVolumeLabel } from "@/features/markets/lib/live-category/parse-volume-label";

import { commodityDisplayLabel } from "./map-commodity-tickers";
import { resolveCommodityCategory } from "./commodity-regime-utils";

function unitFor(symbol: string): string {
  const cat = resolveCommodityCategory(symbol);
  if (cat === "degerli-metal") return "$/oz";
  if (cat === "enerji") return "$/bbl";
  if (cat === "tarim") return "c/bu";
  return "$/lb";
}

function toMover(asset: MarketAssetView): CommodityMoverItem {
  return {
    symbol: asset.symbol.toUpperCase(),
    name: commodityDisplayLabel(asset.symbol, asset.name),
    changePct: asset.change_percent,
    price: `$${asset.price.toFixed(2)}`,
    volume: asset.volume,
  };
}

export function buildCommodityMoversPayload(assets: readonly MarketAssetView[]): CommodityMoversPayload {
  const gainers = sortByChangeDesc(assets).slice(0, 5).map(toMover);
  const losers = sortByChangeAsc(assets).slice(0, 5).map(toMover);
  const volume = [...assets]
    .sort((a, b) => parseVolumeLabel(b.volume) - parseVolumeLabel(a.volume))
    .slice(0, 5)
    .map(toMover);
  const volatile = [...assets]
    .sort((a, b) => Math.abs(b.change_percent) - Math.abs(a.change_percent))
    .slice(0, 5)
    .map((a) => ({
      ...toMover(a),
      volatility: `${Math.abs(a.change_percent).toFixed(2)}%`,
    }));

  return { gainers, losers, volume, volatile };
}

export function buildCommodityBottomStrip(assets: readonly MarketAssetView[]): CommodityBottomStripPayload {
  const watchlist: CommodityWatchItem[] = [...assets]
    .sort((a, b) => parseVolumeLabel(b.volume) - parseVolumeLabel(a.volume))
    .slice(0, 5)
    .map((a) => ({
      symbol: commodityDisplayLabel(a.symbol, a.name),
      price: a.price,
      unit: unitFor(a.symbol),
      changePct: a.change_percent,
      sparkline: sparkOrFlat(a),
      trend: trendFromChange(a.change_percent),
    }));

  const correlation = [...assets]
    .slice(0, 4)
    .map((a) => ({
      symbol: `${commodityDisplayLabel(a.symbol, a.name)}/USD`,
      correlation: a.change_percent >= 0 ? -0.65 : -0.42,
      label: "Ters",
      changePct: a.change_percent,
    }));

  const calendar: CommodityCalendarItem[] = [
    {
      id: "opec-live",
      date: "Yakında",
      title: "OPEC+ üretim kararı",
      impact: "high",
      type: "opec",
    },
  ];

  return { watchlist, calendar, correlation };
}

function mapCalendarRow(row: EconomicCalendarRow): CommodityCalendarItem {
  const date = new Date(row.at);
  const day = date.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
  const titleLower = row.title.toLowerCase();
  const type: CommodityCalendarItem["type"] =
    titleLower.includes("opec") || titleLower.includes("petrol")
      ? "opec"
      : titleLower.includes("tahıl") || titleLower.includes("hasat")
        ? "harvest"
        : titleLower.includes("stok") || titleLower.includes("envanter")
          ? "report"
          : "macro";

  return {
    id: row.id,
    date: day,
    title: row.title,
    impact: row.impact >= 3 ? "high" : row.impact >= 2 ? "medium" : "low",
    type,
  };
}

export function mergeCommodityBottomStrip(
  strip: CommodityBottomStripPayload,
  calendarRows: readonly EconomicCalendarRow[],
): CommodityBottomStripPayload {
  const liveCalendar = calendarRows.slice(0, 4).map(mapCalendarRow);
  return {
    ...strip,
    calendar: liveCalendar.length ? liveCalendar : strip.calendar,
  };
}

export function enrichCommodityMockMovers(raw: CommodityMoversPayload): CommodityMoversPayload {
  const volatile =
    raw.volatile ??
    raw.gainers.map((item) => ({
      ...item,
      volatility: `${Math.abs(item.changePct).toFixed(2)}%`,
    }));

  return { ...raw, volatile };
}
