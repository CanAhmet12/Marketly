import type { NasdaqPulseMetrics } from "@/features/markets/nasdaq/types";
import type { MarketAssetView } from "@/features/markets/types";

import {
  avgChange,
  findAsset,
  sparkOrFlat,
} from "@/features/markets/lib/live-category/live-category-shared";

function indexItem(label: string, asset: MarketAssetView | undefined, fallbackValue = 0) {
  if (!asset) {
    return { label, value: fallbackValue, changePct: 0, sparkline: [] as number[] };
  }
  return {
    label,
    value: asset.price,
    changePct: asset.change_percent,
    sparkline: sparkOrFlat(asset),
  };
}

function moodLabel(score: number): string {
  if (score >= 70) return "Risk-On";
  if (score >= 45) return "Nötr";
  return "Risk-Off";
}

function fedPivotLabel(score: number): string {
  if (score >= 65) return "Yaklaşan";
  if (score >= 40) return "Belirsiz";
  return "Uzak";
}

export function buildNasdaqPulseMetrics(assets: readonly MarketAssetView[]): NasdaqPulseMetrics {
  const ndx = findAsset(assets, "NDX") ?? findAsset(assets, "QQQ") ?? assets[0];
  const composite = findAsset(assets, "COMP") ?? ndx;
  const spx = findAsset(assets, "SPX") ?? findAsset(assets, "SP500");
  const vix = findAsset(assets, "VIX");
  const avg = avgChange(assets);

  const moodScore = Math.min(100, Math.max(0, Math.round(50 + avg * 10)));
  const fedScore = Math.min(100, Math.max(0, Math.round(55 + avg * 6)));

  return {
    ndx: indexItem("NASDAQ 100", ndx),
    composite: indexItem("NASDAQ Composite", composite),
    sp500: indexItem("S&P 500", spx),
    vix: {
      value: vix?.price ?? 0,
      changePct: vix?.change_percent ?? 0,
    },
    totalVolume: assets[0]?.volume ?? "—",
    marketMood: { value: moodScore, label: moodLabel(moodScore) },
    fedPivot: { value: fedScore, label: fedPivotLabel(fedScore) },
  };
}

export function formatNasdaqIndexPrice(value: number): string {
  if (!value) return "—";
  return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
}
