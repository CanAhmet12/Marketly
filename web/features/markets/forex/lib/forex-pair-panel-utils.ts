import type { ForexPairPanel } from "@/features/markets/forex/types";
import type { MarketAssetView } from "@/features/markets/types";

import {
  pairLabel,
  sparkOrFlat,
  trendFromChange,
} from "@/features/markets/lib/live-category/live-category-shared";

import { formatForexTickerPrice } from "./map-forex-tickers";

function normalizeSymbol(symbol: string): string {
  return symbol.toUpperCase().replace("/", "");
}

function fmtPanelRate(n: number, pair: string): string {
  if (!n) return "—";
  return formatForexTickerPrice(n, pair.replace("/", ""));
}

function pipRange(dayHigh: number, dayLow: number, pair: string): string {
  const diff = Math.abs(dayHigh - dayLow);
  if (pair.includes("JPY")) return String(Math.round(diff * 100));
  if (pair.includes("TRY")) return String(Math.round(diff * 100));
  return String(Math.round(diff * 10000));
}

export function buildForexPairPanel(asset: MarketAssetView): ForexPairPanel {
  const pair = pairLabel(asset.symbol);
  const [base, quote] = pair.includes("/") ? pair.split("/") : [pair.slice(0, 3), pair.slice(3)];
  const dayHigh = asset.price * 1.01;
  const dayLow = asset.price * 0.99;
  const spread =
    pair.includes("JPY") ? 2.0 : pair.includes("TRY") ? 3.5 : 1.8;

  return {
    symbol: normalizeSymbol(asset.symbol),
    pair,
    base: base ?? pair,
    quote: quote ?? "USD",
    rate: asset.price,
    changePct: asset.change_percent,
    bid: asset.price * 0.9999,
    ask: asset.price * 1.0001,
    spread,
    sparkline: sparkOrFlat(asset),
    trend: trendFromChange(asset.change_percent),
    stats: {
      dayHigh: fmtPanelRate(dayHigh, pair),
      dayLow: fmtPanelRate(dayLow, pair),
      pipRange: pipRange(dayHigh, dayLow, pair),
      weeklyChange: "—",
    },
  };
}

export function emptyForexPairPanel(pair: string, symbol: string): ForexPairPanel {
  const [base, quote] = pair.includes("/") ? pair.split("/") : [pair.slice(0, 3), pair.slice(3)];
  return {
    symbol,
    pair,
    base: base ?? "USD",
    quote: quote ?? "USD",
    rate: 0,
    changePct: 0,
    bid: 0,
    ask: 0,
    spread: 0,
    sparkline: [],
    trend: "flat",
    stats: { dayHigh: "—", dayLow: "—", pipRange: "—", weeklyChange: "—" },
  };
}

/** Fallback panel — majör parite yoksa genel fmt */
export function fmtPairStatPrice(n: number, pair: string): string {
  return fmtPanelRate(n, pair);
}
