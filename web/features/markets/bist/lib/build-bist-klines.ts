import type {
  BistChartTimeframe,
  BistKlinesResponse,
} from "@/features/markets/bist/lib/bist-chart-types";
import { BIST_KLINE_CONFIG } from "@/features/markets/bist/lib/bist-chart-types";
import {
  computeXu100CorrelationFromYahoo,
  xu100CorrelationLabel,
} from "@/features/markets/bist/lib/bist-correlation-utils";
import { isBistIndexSymbol, normalizeBistSymbol, yahooTickerFor } from "@/features/markets/bist/lib/bist-symbol-meta";
import { fetchYahooChart, type YahooChartInterval } from "@/features/markets/commodities/lib/commodity-yahoo";

export async function fetchBistKlines(
  symbol: string,
  timeframe: BistChartTimeframe,
): Promise<BistKlinesResponse | null> {
  const sym = normalizeBistSymbol(symbol);
  const ticker = yahooTickerFor(sym);
  if (!ticker) return null;

  const config = BIST_KLINE_CONFIG[timeframe];
  const candles = await fetchYahooChart(
    ticker,
    config.interval as YahooChartInterval,
    config.range,
  );

  if (!candles?.length) return null;

  const isIndex = isBistIndexSymbol(sym);
  let xu100Correlation: number | null = null;
  let correlationLabel: string | null = null;

  if (isIndex) {
    xu100Correlation = 0.95;
    correlationLabel = xu100CorrelationLabel(0.95);
  } else {
    const corr = await computeXu100CorrelationFromYahoo(sym, 60);
    xu100Correlation = corr.correlation;
    correlationLabel = corr.label;
  }

  return {
    symbol: sym,
    ticker,
    interval: config.interval,
    source: "yahoo",
    candles,
    xu100Correlation,
    correlationLabel,
  };
}
