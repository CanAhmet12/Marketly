import { buildSparklineSeries } from "@/features/markets/lib/sparkline-series";

export type SparklineSource = "live" | "synthetic";

export type ResolvedSparkline = {
  series: number[];
  source: SparklineSource;
  /** UI etiketi — sentetik seride "tahmini" */
  label?: string;
};

/** asset_prices.spark varsa canlı; yoksa deterministik fallback */
export function resolveSparkline(opts: {
  symbol: string;
  spark?: readonly number[] | null;
  price?: number;
  changePct?: number;
  length?: number;
}): ResolvedSparkline {
  const spark = opts.spark?.filter((v) => Number.isFinite(v) && v > 0) ?? [];
  if (spark.length > 1) {
    return { series: [...spark], source: "live" };
  }

  const cp = opts.changePct ?? 0;
  const trend = cp > 0 ? "up" : cp < 0 ? "down" : "flat";
  const price = opts.price ?? 0;
  const base =
    price > 0
      ? [price * (1 - cp / 200), price * (1 - cp / 400), price]
      : buildSparklineSeries(opts.symbol, trend, 3);

  const series =
    price > 0 && base.length >= 2
      ? expandPriceSeries(base, opts.length ?? 28)
      : buildSparklineSeries(opts.symbol, trend, opts.length ?? 28);

  return { series, source: "synthetic", label: "tahmini" };
}

function expandPriceSeries(seed: number[], length: number): number[] {
  if (seed.length >= length) return seed.slice(-length);
  const out = [...seed];
  while (out.length < length) {
    const prev = out[out.length - 1] ?? out[0] ?? 1;
    const drift = (seed[seed.length - 1]! - seed[0]!) / Math.max(seed.length - 1, 1);
    out.push(Math.max(prev + drift * 0.35, 0.0001));
  }
  return out;
}

export function sparklineOrResolved(asset: {
  symbol: string;
  sparkline?: readonly number[];
  price: number;
  change_percent: number;
}): number[] {
  return resolveSparkline({
    symbol: asset.symbol,
    spark: asset.sparkline,
    price: asset.price,
    changePct: asset.change_percent,
  }).series;
}
