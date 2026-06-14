import { fetchYahooChart } from "@/features/markets/commodities/lib/commodity-yahoo";
import type {
  BistSparklineRange,
  BistSparklineResponse,
} from "@/features/markets/bist/lib/bist-chart-types";
import { formatBistTickerPrice } from "@/features/markets/bist/lib/map-bist-tickers";
import { normalizeBistSymbol, yahooTickerFor } from "@/features/markets/bist/lib/bist-symbol-meta";
import { signedPct } from "@/features/markets/bist/lib/bist-sparkline-utils";

function rangeConfig(range: BistSparklineRange): { interval: "15m" | "1d" | "1wk"; yahooRange: string } {
  switch (range) {
    case "1d":
      return { interval: "15m", yahooRange: "5d" };
    case "1mo":
      return { interval: "1d", yahooRange: "1mo" };
    case "3mo":
      return { interval: "1wk", yahooRange: "3mo" };
  }
}

export async function fetchBistSparkline(
  symbol: string,
  range: BistSparklineRange = "1mo",
): Promise<BistSparklineResponse | null> {
  const sym = normalizeBistSymbol(symbol);
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
      destek: formatBistTickerPrice(support, sym),
      direnc: formatBistTickerPrice(resistance, sym),
      haftalik: signedPct(weekChange),
      aylik: signedPct(monthChange),
    },
  };
}
