import type {
  CentralBankEvent,
  ForexBottomStripPayload,
  ForexMoverItem,
  ForexMoversPayload,
} from "@/features/markets/forex/types";
import type { EconomicCalendarRow } from "@/features/markets/repository/markets-repository";
import type { MarketAssetView } from "@/features/markets/types";

import {
  filterCommodityAssets,
  filterForexAssets,
  pairLabel,
  sortByChangeAsc,
  sortByChangeDesc,
  sparkOrFlat,
  trendFromChange,
} from "@/features/markets/lib/live-category/live-category-shared";

import { parseVolumeLabel } from "@/features/markets/lib/live-category/parse-volume-label";

function normalizeSymbol(symbol: string): string {
  return symbol.toUpperCase().replace("/", "");
}

function pipEstimate(changePct: number, pair: string): number {
  const scale = pair.includes("JPY") || pair.includes("TRY") ? 100 : 10_000;
  return Math.round((changePct / 100) * scale);
}

function toMover(asset: MarketAssetView): ForexMoverItem {
  const pair = pairLabel(asset.symbol);
  return {
    pair,
    symbol: normalizeSymbol(asset.symbol),
    changePct: asset.change_percent,
    volume: asset.volume,
    pip: pipEstimate(asset.change_percent, pair),
  };
}

export function buildForexMoversPayload(assets: readonly MarketAssetView[]): ForexMoversPayload {
  const gainers = sortByChangeDesc(assets).slice(0, 5).map(toMover);
  const losers = sortByChangeAsc(assets).slice(0, 5).map(toMover);
  const volumeLeaders = [...assets]
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

  return {
    gainers,
    losers,
    volume: volumeLeaders,
    volatile,
    active: volumeLeaders.slice(0, 3),
  };
}

const COMMODITY_UNITS: Record<string, string> = {
  XAUUSD: "$/oz",
  XAU: "$/oz",
  XAGUSD: "$/oz",
  XAG: "$/oz",
  WTI: "$/bbl",
  BRENT: "$/bbl",
};

function commodityLabel(symbol: string): string {
  const s = symbol.toUpperCase();
  if (s.includes("XAU")) return "ALTIN/USD";
  if (s.includes("XAG")) return "GUMUS/USD";
  if (s.includes("WTI") || s.includes("BRENT")) return "PETROL/USD";
  return pairLabel(symbol);
}

function commodityUnit(symbol: string): string {
  const s = symbol.toUpperCase();
  for (const [key, unit] of Object.entries(COMMODITY_UNITS)) {
    if (s.includes(key.replace("USD", ""))) return unit;
  }
  return "";
}

export function buildForexBottomStrip(
  forexAssets: readonly MarketAssetView[],
  allAssets: readonly MarketAssetView[],
): ForexBottomStripPayload {
  const watchlist = [...forexAssets]
    .sort((a, b) => parseVolumeLabel(b.volume) - parseVolumeLabel(a.volume))
    .slice(0, 4)
    .map((a) => ({
      pair: pairLabel(a.symbol),
      rate: a.price,
      changePct: a.change_percent,
      sparkline: sparkOrFlat(a),
      trend: trendFromChange(a.change_percent),
    }));

  const commodities = filterCommodityAssets(allAssets)
    .slice(0, 4)
    .map((a) => ({
      symbol: commodityLabel(a.symbol),
      price: a.price,
      changePct: a.change_percent,
      trend: trendFromChange(a.change_percent),
      unit: commodityUnit(a.symbol),
    }));

  return {
    watchlist,
    centralBanks: [],
    commodities,
  };
}

const COUNTRY_BANK: Record<string, string> = {
  US: "Fed",
  EU: "ECB",
  TR: "TCMB",
  GB: "BoE",
  JP: "BoJ",
  CH: "SNB",
  AU: "RBA",
  CA: "BoC",
};

export function mapCalendarToCentralBankEvents(rows: readonly EconomicCalendarRow[]): CentralBankEvent[] {
  return rows.slice(0, 4).map((row) => {
    const country = row.country.slice(0, 2).toUpperCase();
    const at = new Date(row.at);
    const time = Number.isNaN(at.getTime())
      ? "—"
      : at.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });

    return {
      id: row.id,
      time,
      bank: COUNTRY_BANK[country] ?? row.country,
      title: row.title,
      impact: row.impact === 3 ? "high" : row.impact === 2 ? "medium" : "low",
      country,
    };
  });
}

export function mergeForexBottomStrip(
  base: ForexBottomStripPayload,
  calendarRows: readonly EconomicCalendarRow[],
): ForexBottomStripPayload {
  if (base.centralBanks.length > 0) return base;
  const mapped = mapCalendarToCentralBankEvents(calendarRows);
  return mapped.length ? { ...base, centralBanks: mapped } : base;
}

/** Canlı modda forex asset havuzu */
export function resolveForexAssetPool(
  mockOn: boolean,
  dashboardAssets: readonly MarketAssetView[] | undefined,
  liveAssets: readonly MarketAssetView[],
): MarketAssetView[] {
  const pool = mockOn ? (dashboardAssets ?? []) : liveAssets;
  return filterForexAssets(pool);
}
