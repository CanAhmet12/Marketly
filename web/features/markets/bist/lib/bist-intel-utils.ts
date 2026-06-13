import type {
  BistBottomStripPayload,
  BistFxItem,
  BistGundemItem,
  BistMoverItem,
  BistMoversPayload,
  BistWatchlistItem,
} from "@/features/markets/bist/types";
import type { EconomicCalendarRow } from "@/features/markets/repository/markets-repository";
import type { MarketAssetView } from "@/features/markets/types";

import {
  sortByChangeAsc,
  sortByChangeDesc,
  sparkOrFlat,
  trendFromChange,
  findAsset,
} from "@/features/markets/lib/live-category/live-category-shared";

import { parseVolumeLabel } from "@/features/markets/lib/live-category/parse-volume-label";

function toMover(asset: MarketAssetView): BistMoverItem {
  return {
    symbol: asset.symbol.replace(".IS", ""),
    name: asset.name,
    change: asset.change_percent,
    price: `${asset.price.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL`,
    volume: asset.volume,
  };
}

export function buildBistMoversPayload(assets: readonly MarketAssetView[]): BistMoversPayload {
  const stocks = assets.filter((a) => !a.symbol.startsWith("XU") && !a.symbol.startsWith("BIST"));
  const gainers = sortByChangeDesc(stocks).slice(0, 5).map(toMover);
  const losers = sortByChangeAsc(stocks).slice(0, 5).map(toMover);
  const volume = [...stocks]
    .sort((a, b) => parseVolumeLabel(b.volume) - parseVolumeLabel(a.volume))
    .slice(0, 5)
    .map(toMover);
  const volatile = [...stocks]
    .sort((a, b) => Math.abs(b.change_percent) - Math.abs(a.change_percent))
    .slice(0, 5)
    .map((a) => ({
      ...toMover(a),
      volatility: `${Math.abs(a.change_percent).toFixed(2)}%`,
    }));

  return { gainers, losers, volume, volatile };
}

export function buildBistBottomStrip(
  assets: readonly MarketAssetView[],
  allAssets?: readonly MarketAssetView[],
): BistBottomStripPayload {
  const stocks = assets.filter((a) => !a.symbol.startsWith("XU") && !a.symbol.startsWith("BIST"));
  const fxPool = allAssets ?? assets;

  const watchlist: BistWatchlistItem[] = [...stocks]
    .sort((a, b) => parseVolumeLabel(b.volume) - parseVolumeLabel(a.volume))
    .slice(0, 5)
    .map((a) => ({
      symbol: a.symbol.replace(".IS", ""),
      name: a.name,
      price: a.price,
      changePercent: a.change_percent,
      sparkline: sparkOrFlat(a),
      trend: trendFromChange(a.change_percent),
    }));

  const gundem: BistGundemItem[] = [
    {
      id: "bist-live",
      time: "Bugün",
      title: "BIST seans özeti",
      impact: "medium",
      country: "TR",
    },
  ];

  const usd = findAsset(fxPool, "USDTRY") ?? findAsset(fxPool, "USD/TRY");
  const eur = findAsset(fxPool, "EURTRY") ?? findAsset(fxPool, "EUR/TRY");
  const fx: BistFxItem[] = [
    usd
      ? {
          symbol: "USD/TRY",
          price: usd.price,
          changePercent: usd.change_percent,
          trend: trendFromChange(usd.change_percent),
        }
      : { symbol: "USD/TRY", price: 0, changePercent: 0, trend: "flat" },
    eur
      ? {
          symbol: "EUR/TRY",
          price: eur.price,
          changePercent: eur.change_percent,
          trend: trendFromChange(eur.change_percent),
        }
      : { symbol: "EUR/TRY", price: 0, changePercent: 0, trend: "flat" },
  ];

  return { watchlist, gundem, fx };
}

function mapCalendarRow(row: EconomicCalendarRow): BistGundemItem {
  const date = new Date(row.at);
  const time = date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
  return {
    id: row.id,
    time,
    title: row.title,
    impact: row.impact >= 3 ? "high" : row.impact >= 2 ? "medium" : "low",
    country: row.country === "TR" ? "TR" : row.country === "US" ? "US" : "EU",
  };
}

export function mergeBistBottomStrip(
  strip: BistBottomStripPayload,
  calendarRows: readonly EconomicCalendarRow[],
): BistBottomStripPayload {
  const trEvents = calendarRows.filter((r) => r.country === "TR" || r.country === "US");
  const liveGundem = trEvents.slice(0, 4).map(mapCalendarRow);
  return {
    ...strip,
    gundem: liveGundem.length ? liveGundem : strip.gundem,
  };
}

export function enrichBistMockMovers(raw: BistMoversPayload): BistMoversPayload {
  const volatile =
    raw.volatile ??
    raw.gainers.map((item) => ({
      ...item,
      volatility: `${Math.abs(item.change).toFixed(2)}%`,
    }));

  return { ...raw, volatile };
}
