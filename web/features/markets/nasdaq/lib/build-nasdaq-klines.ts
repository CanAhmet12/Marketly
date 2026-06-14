import type {
  NasdaqChartTimeframe,
  NasdaqKlinesResponse,
} from "@/features/markets/nasdaq/lib/nasdaq-chart-types";
import { NASDAQ_KLINE_CONFIG } from "@/features/markets/nasdaq/lib/nasdaq-chart-types";
import { yahooTickerFor } from "@/features/markets/nasdaq/lib/nasdaq-symbol-meta";
import { fetchYahooChart, type YahooChartInterval } from "@/features/markets/commodities/lib/commodity-yahoo";

export async function fetchNasdaqKlines(
  symbol: string,
  timeframe: NasdaqChartTimeframe,
): Promise<NasdaqKlinesResponse | null> {
  const sym = symbol.trim().toUpperCase();
  const ticker = yahooTickerFor(sym);
  if (!ticker) return null;

  const config = NASDAQ_KLINE_CONFIG[timeframe];
  const candles = await fetchYahooChart(
    ticker,
    config.interval as YahooChartInterval,
    config.range,
  );

  if (!candles?.length) return null;

  return {
    symbol: sym,
    ticker,
    interval: config.interval,
    source: "yahoo",
    candles,
  };
}
