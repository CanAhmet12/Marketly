import type {
  NasdaqRegimePayload,
  NasdaqRegimeType,
  NasdaqScreenerCategory,
  TechHeatLevel,
  TechSectorItem,
} from "@/features/markets/nasdaq/types";
import type { MarketAssetView } from "@/features/markets/types";

import {
  avgChange,
  findAsset,
  sparkOrFlat,
} from "@/features/markets/lib/live-category/live-category-shared";

import { sparkFromChange } from "./nasdaq-sparkline-utils";

const SECTOR_DEFS: { id: string; name: string; match: (symbol: string) => boolean }[] = [
  { id: "ai", name: "AI & Makine", match: (s) => /NVDA|AMD|SMCI|PLTR|AI\b|ARM/i.test(s) },
  { id: "semi", name: "Yarıiletken", match: (s) => /AVGO|QCOM|MU|AMAT|LRCX|KLAC|INTC|ASML/i.test(s) },
  { id: "ev", name: "EV & Temiz", match: (s) => /TSLA|RIVN|LCID|NIO|ENPH/i.test(s) },
  { id: "cloud", name: "Bulut Bilişim", match: (s) => /AMZN|SNOW|DDOG|NET|MDB/i.test(s) },
  { id: "software", name: "Yazılım", match: (s) => /MSFT|ADBE|CRM|ORCL|NOW|INTU/i.test(s) },
  { id: "security", name: "Siber Güvenlik", match: (s) => /CRWD|PANW|ZS|FTNT|OKTA/i.test(s) },
  { id: "biotech", name: "Biyoteknoloji", match: (s) => /BIIB|GILD|REGN|VRTX|MRNA/i.test(s) },
  { id: "media", name: "Dijital Eğlence", match: (s) => /NFLX|DIS|ROKU|SPOT|TTWO/i.test(s) },
];

export function resolveNasdaqScreenerSector(symbol: string): NasdaqScreenerCategory {
  const s = symbol.toUpperCase();
  if (/NVDA|AMD|SMCI|PLTR|AI\b|ARM/i.test(s)) return "ai-tech";
  if (/AVGO|QCOM|MU|AMAT|LRCX|KLAC|INTC|ASML/i.test(s)) return "yariletken";
  if (/AMZN|SNOW|DDOG|NET|MDB/i.test(s)) return "cloud";
  if (/BIIB|GILD|REGN|VRTX|MRNA/i.test(s)) return "biotech";
  if (/MSFT|ADBE|CRM|ORCL|NOW|INTU/i.test(s)) return "software";
  if (/NFLX|DIS|ROKU|SPOT/i.test(s)) return "media";
  return "diger";
}

function heatLevelFromChange(changePct: number): TechHeatLevel {
  if (changePct > 1) return "hot-strong";
  if (changePct > 0.2) return "hot-mild";
  if (changePct > -0.2) return "neutral";
  if (changePct > -1) return "cold-mild";
  return "cold-strong";
}

export function buildNasdaqSectorHeatmap(assets: readonly MarketAssetView[]): TechSectorItem[] {
  return SECTOR_DEFS.map((def) => {
    const pool = assets.filter((a) => def.match(a.symbol));
    const changePct =
      pool.length > 0
        ? Math.round((pool.reduce((s, a) => s + a.change_percent, 0) / pool.length) * 100) / 100
        : 0;
    const leader = pool.sort((a, b) => b.change_percent - a.change_percent)[0];
    const leaderLabel = leader
      ? `${leader.symbol} ${leader.change_percent >= 0 ? "+" : ""}${leader.change_percent.toFixed(2)}%`
      : "—";

    return {
      id: def.id,
      name: def.name,
      changePct,
      leader: leaderLabel,
      heatLevel: heatLevelFromChange(changePct),
      sparkline:
        leader && sparkOrFlat(leader).length > 1
          ? sparkOrFlat(leader)
          : sparkFromChange(changePct, 7),
    };
  });
}

function resolveRegime(avg: number, ndxChange: number): NasdaqRegimeType {
  if (ndxChange > 0.5 || avg > 0.4) return "tech-rally";
  if (avg > 0.15) return "growth-momentum";
  if (avg < -0.4) return "duzeltme";
  return "karisik";
}

const REGIME_HEADLINE: Record<NasdaqRegimeType, string> = {
  "tech-rally": "TECH RALLY",
  "growth-momentum": "GROWTH MOMENTUM",
  karisik: "KARIŞIK PİYASA",
  duzeltme: "DÜZELTME",
};

export function buildNasdaqRegime(assets: readonly MarketAssetView[]): NasdaqRegimePayload {
  const ndx = findAsset(assets, "NDX") ?? findAsset(assets, "QQQ") ?? assets[0];
  const avg = avgChange(assets);
  const regime = resolveRegime(avg, ndx?.change_percent ?? 0);
  const sectors = buildNasdaqSectorHeatmap(assets);

  const tech = sectors.find((s) => s.id === "ai")?.changePct ?? 0;
  const semi = sectors.find((s) => s.id === "semi")?.changePct ?? 0;
  const health = sectors.find((s) => s.id === "biotech")?.changePct ?? 0;
  const techCombined = (tech + semi) / 2;
  const other =
    sectors
      .filter((s) => !["ai", "semi", "biotech"].includes(s.id))
      .reduce((s, c) => s + c.changePct, 0) /
    Math.max(1, sectors.filter((s) => !["ai", "semi", "biotech"].includes(s.id)).length);

  const total = Math.abs(techCombined) + Math.abs(health) + Math.abs(other) || 1;

  return {
    regime,
    headline: REGIME_HEADLINE[regime],
    summary: `Canlı NASDAQ: ${assets.length} sembol. ${REGIME_HEADLINE[regime]} rejimi.`,
    ndxValue: ndx?.price ?? 0,
    ndxChange: ndx?.change_percent ?? 0,
    stats: {
      bigTechHareket: avg > 0 ? "Güçlü" : avg < 0 ? "Zayıf" : "Ilımlı",
      faizBeklentisi: avg > 0 ? "İndirim Var" : "Sabit",
      buyumeMomentu: avg > 0.2 ? "Güçlü" : "Nötr",
      teknik: avg > 0 ? "Yukarı" : avg < 0 ? "Aşağı" : "Yatay",
    },
    distribution: {
      tech: Math.round((Math.abs(techCombined) / total) * 100) || 40,
      health: Math.round((Math.abs(health) / total) * 100) || 30,
      other: Math.round((Math.abs(other) / total) * 100) || 30,
    },
  };
}

export function moodBandFromValue(value: number): "risk-on" | "neutral" | "risk-off" {
  if (value >= 70) return "risk-on";
  if (value >= 40) return "neutral";
  return "risk-off";
}
