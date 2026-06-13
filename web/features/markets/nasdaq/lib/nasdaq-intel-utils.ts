import type {
  EarningsItem,
  MacroFedItem,
  NasdaqBottomStripPayload,
  NasdaqMoverItem,
  NasdaqMoversPayload,
  NasdaqWatchItem,
} from "@/features/markets/nasdaq/types";
import type { EconomicCalendarRow } from "@/features/markets/repository/markets-repository";
import type { MarketAssetView } from "@/features/markets/types";

import {
  sortByChangeAsc,
  sortByChangeDesc,
  sparkOrFlat,
  trendFromChange,
} from "@/features/markets/lib/live-category/live-category-shared";

import { parseVolumeLabel } from "@/features/markets/lib/live-category/parse-volume-label";

function toMover(asset: MarketAssetView): NasdaqMoverItem {
  return {
    symbol: asset.symbol.toUpperCase(),
    name: asset.name,
    changePct: asset.change_percent,
    price: `$${asset.price.toFixed(2)}`,
    volume: asset.volume,
  };
}

export function buildNasdaqMoversPayload(assets: readonly MarketAssetView[]): NasdaqMoversPayload {
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

export function buildNasdaqBottomStrip(assets: readonly MarketAssetView[]): NasdaqBottomStripPayload {
  const watchlist: NasdaqWatchItem[] = [...assets]
    .sort((a, b) => parseVolumeLabel(b.volume) - parseVolumeLabel(a.volume))
    .slice(0, 5)
    .map((a) => ({
      symbol: a.symbol.toUpperCase(),
      price: a.price,
      changePct: a.change_percent,
      sparkline: sparkOrFlat(a),
      trend: trendFromChange(a.change_percent),
    }));

  const earnings: EarningsItem[] = [...assets]
    .slice(0, 4)
    .map((a, i) => ({
      id: `earn-${a.symbol}`,
      ticker: a.symbol.toUpperCase(),
      name: a.name,
      date: "Yakında",
      epsEst: "—",
      timing: i % 2 === 0 ? ("AMC" as const) : ("BMO" as const),
    }));

  const macroFed: MacroFedItem[] = [
    {
      id: "fed-live",
      date: "Yakında",
      title: "FOMC faiz kararı",
      impact: "high",
    },
  ];

  return { watchlist, earnings, macroFed };
}

function mapCalendarRow(row: EconomicCalendarRow): MacroFedItem {
  const date = new Date(row.at);
  const day = date.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
  return {
    id: row.id,
    date: day,
    title: row.title,
    impact: row.impact >= 3 ? "high" : row.impact >= 2 ? "medium" : "low",
  };
}

export function mergeNasdaqBottomStrip(
  strip: NasdaqBottomStripPayload,
  calendarRows: readonly EconomicCalendarRow[],
): NasdaqBottomStripPayload {
  const liveMacro = calendarRows.slice(0, 4).map(mapCalendarRow);
  return {
    ...strip,
    macroFed: liveMacro.length ? liveMacro : strip.macroFed,
  };
}

export function enrichNasdaqMockMovers(raw: NasdaqMoversPayload): NasdaqMoversPayload {
  const volatile =
    raw.volatile ??
    raw.gainers.map((item) => ({
      ...item,
      volatility: `${Math.abs(item.changePct).toFixed(2)}%`,
    }));

  return { ...raw, volatile };
}
