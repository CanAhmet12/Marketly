import type { BistPulseMetrics } from "@/features/markets/bist/types";
import type { MarketAssetView } from "@/features/markets/types";

import {
  avgChange,
  findAsset,
  sparkOrFlat,
} from "@/features/markets/lib/live-category/live-category-shared";

function indexItem(label: string, asset: MarketAssetView | undefined, fallbackValue = 0) {
  if (!asset) {
    return { label, value: fallbackValue, changePercent: 0, sparkline: [] as number[] };
  }
  return {
    label,
    value: asset.price,
    changePercent: asset.change_percent,
    sparkline: sparkOrFlat(asset),
  };
}

function moodLabel(score: number): string {
  if (score >= 70) return "Yükseliş";
  if (score >= 45) return "Yatay";
  return "Satış";
}

export function buildBistPulseMetrics(assets: readonly MarketAssetView[]): BistPulseMetrics {
  const xu100 = findAsset(assets, "XU100") ?? findAsset(assets, "BIST100") ?? assets[0];
  const xu030 = findAsset(assets, "XU030") ?? findAsset(assets, "BIST30");
  const xubank = findAsset(assets, "XUBANK") ?? findAsset(assets, "XBANK");
  const xusin = findAsset(assets, "XUSIN") ?? findAsset(assets, "XUSINAI");
  const avg = avgChange(assets);

  const moodScore = Math.min(100, Math.max(0, Math.round(50 + avg * 10)));
  const foreignRatio = Math.min(60, Math.max(20, Math.round(36 + avg * 2)));

  return {
    bist100: indexItem("BIST 100", xu100),
    bist30: indexItem("BIST 30", xu030),
    bistBanka: indexItem("BIST Banka", xubank),
    bistSinai: indexItem("BIST Sanayi", xusin),
    toplamHacim: assets[0]?.volume ?? "—",
    yabancıOran: {
      value: foreignRatio,
      change: Math.round(avg * 10) / 10,
      label: "Günlük",
    },
    piyasaDurumu: { value: moodScore, label: moodLabel(moodScore) },
  };
}

export function formatBistIndexPrice(value: number): string {
  if (!value) return "—";
  return value.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function activeBistSessionLabel(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Istanbul",
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(now);

  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "Mon";
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  const dayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  const day = dayMap[weekday] ?? 1;
  const mins = hour * 60 + minute;

  if (day === 0 || day === 6) return "BIST kapalı";
  if (mins >= 9 * 60 + 55 && mins < 10 * 60) return "Tek fiyat açılış";
  if (mins >= 10 * 60 && mins < 17 * 60 + 55) return "Sürekli işlem";
  if (mins >= 17 * 60 + 55 && mins < 18 * 60) return "Kapanış seansı";
  return "Seans dışı";
}
