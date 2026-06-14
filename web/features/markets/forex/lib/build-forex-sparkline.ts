import { fetchYahooChart } from "@/features/markets/commodities/lib/commodity-yahoo";
import type {
  ForexSparklineRange,
  ForexSparklineResponse,
} from "@/features/markets/forex/lib/forex-chart-types";
import { formatForexTickerPrice } from "@/features/markets/forex/lib/map-forex-tickers";
import { formatPipCount, pipsBetween } from "@/features/markets/forex/lib/forex-pip-utils";
import { yahooTickerFor } from "@/features/markets/forex/lib/forex-symbol-meta";

function signedPct(v: number): string {
  return `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;
}

function rangeConfig(range: ForexSparklineRange): { interval: "15m" | "1d" | "1wk"; yahooRange: string } {
  switch (range) {
    case "1d":
      return { interval: "15m", yahooRange: "5d" };
    case "1mo":
      return { interval: "1d", yahooRange: "1mo" };
    case "3mo":
      return { interval: "1wk", yahooRange: "3mo" };
  }
}

export async function fetchForexSparkline(
  symbol: string,
  range: ForexSparklineRange = "1mo",
): Promise<ForexSparklineResponse | null> {
  const sym = symbol.trim().toUpperCase().replace("/", "");
  const ticker = yahooTickerFor(sym);
  if (!ticker) return null;

  const { interval, yahooRange } = rangeConfig(range);
  const klines = await fetchYahooChart(ticker, interval, yahooRange);
  if (!klines?.length) return null;

  const closes = klines.map((k) => k.close);
  const first = klines[0]!;
  const last = klines[klines.length - 1]!;
  const changePct = first.open > 0 ? ((last.close - first.open) / first.open) * 100 : 0;

  const daySlice = klines.slice(-Math.min(24, klines.length));
  const dayHigh = Math.max(...daySlice.map((k) => k.high));
  const dayLow = Math.min(...daySlice.map((k) => k.low));

  const weekSlice = klines.slice(-Math.min(5, klines.length));
  const weekFirst = weekSlice[0]?.open ?? first.open;
  const weekChange = weekFirst > 0 ? ((last.close - weekFirst) / weekFirst) * 100 : changePct;

  return {
    symbol: sym,
    ticker,
    source: "yahoo",
    range,
    price: last.close,
    changePct,
    sparkline: closes,
    stats: {
      dayHigh: formatForexTickerPrice(dayHigh, sym),
      dayLow: formatForexTickerPrice(dayLow, sym),
      pipRange: formatPipCount(pipsBetween(dayHigh, dayLow, sym)),
      weekly: signedPct(weekChange),
    },
  };
}
