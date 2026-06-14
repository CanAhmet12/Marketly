import type {
  ForexChartTimeframe,
  ForexKlinesResponse,
} from "@/features/markets/forex/lib/forex-chart-types";
import { FOREX_KLINE_CONFIG } from "@/features/markets/forex/lib/forex-chart-types";
import { yahooTickerFor } from "@/features/markets/forex/lib/forex-symbol-meta";
import { fetchYahooChart, type YahooChartInterval } from "@/features/markets/commodities/lib/commodity-yahoo";

export async function fetchForexKlines(
  symbol: string,
  timeframe: ForexChartTimeframe,
): Promise<ForexKlinesResponse | null> {
  const sym = symbol.trim().toUpperCase().replace("/", "");
  const ticker = yahooTickerFor(sym);
  if (!ticker) return null;

  const config = FOREX_KLINE_CONFIG[timeframe];
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
