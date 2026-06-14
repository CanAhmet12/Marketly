import type {
  CommodityChartTimeframe,
  CommodityKlinesResponse,
} from "@/features/markets/commodities/lib/commodity-chart-types";
import { COMMODITY_KLINE_CONFIG } from "@/features/markets/commodities/lib/commodity-chart-types";
import { yahooTickerFor } from "@/features/markets/commodities/lib/commodity-symbol-meta";
import { fetchYahooChart, type YahooChartInterval } from "@/features/markets/commodities/lib/commodity-yahoo";

export async function fetchCommodityKlines(
  symbol: string,
  timeframe: CommodityChartTimeframe,
): Promise<CommodityKlinesResponse | null> {
  const sym = symbol.trim().toUpperCase();
  const ticker = yahooTickerFor(sym);
  if (!ticker) return null;

  const config = COMMODITY_KLINE_CONFIG[timeframe];
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
