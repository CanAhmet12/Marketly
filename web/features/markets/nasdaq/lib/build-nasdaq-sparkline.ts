import { fetchYahooChart } from "@/features/markets/commodities/lib/commodity-yahoo";
import type {
  NasdaqSparklineRange,
  NasdaqSparklineResponse,
} from "@/features/markets/nasdaq/lib/nasdaq-chart-types";
import { formatNasdaqTickerPrice } from "@/features/markets/nasdaq/lib/map-nasdaq-tickers";
import { yahooTickerFor } from "@/features/markets/nasdaq/lib/nasdaq-symbol-meta";

function signedPct(v: number): string {
  return `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;
}

function rangeConfig(range: NasdaqSparklineRange): { interval: "15m" | "1d" | "1wk"; yahooRange: string } {
  switch (range) {
    case "1d":
      return { interval: "15m", yahooRange: "5d" };
    case "1mo":
      return { interval: "1d", yahooRange: "1mo" };
    case "3mo":
      return { interval: "1wk", yahooRange: "3mo" };
  }
}

export async function fetchNasdaqSparkline(
  symbol: string,
  range: NasdaqSparklineRange = "1mo",
): Promise<NasdaqSparklineResponse | null> {
  const sym = symbol.trim().toUpperCase();
  const ticker = yahooTickerFor(sym);
  if (!ticker) return null;

  const { interval, yahooRange } = rangeConfig(range);
  const klines = await fetchYahooChart(ticker, interval, yahooRange);
  if (!klines?.length) return null;

  const closes = klines.map((k) => k.close);
  const sparkline = closes.length >= 2 ? closes : closes;
  const first = klines[0]!;
  const last = klines[klines.length - 1]!;
  const changePct = first.open > 0 ? ((last.close - first.open) / first.open) * 100 : 0;

  const recent = klines.slice(-Math.min(14, klines.length));
  const support = Math.min(...recent.map((k) => k.low));
  const resistance = Math.max(...recent.map((k) => k.high));

  const weekSlice = klines.slice(-Math.min(5, klines.length));
  const weekFirst = weekSlice[0]?.open ?? first.open;
  const weekChange = weekFirst > 0 ? ((last.close - weekFirst) / weekFirst) * 100 : changePct;

  const monthChange = changePct;

  return {
    symbol: sym,
    ticker,
    source: "yahoo",
    range,
    price: last.close,
    changePct,
    sparkline,
    stats: {
      destek: formatNasdaqTickerPrice(support, sym),
      direnc: formatNasdaqTickerPrice(resistance, sym),
      haftalik: signedPct(weekChange),
      aylik: signedPct(monthChange),
    },
  };
}
