import type {
  BistHeatLevel,
  BistMarketStatePayload,
  BistSectorItem,
  BistScreenerCategory,
  BistTrend,
} from "@/features/markets/bist/types";
import type { MarketAssetView } from "@/features/markets/types";

import {
  avgChange,
  findAsset,
  sparkOrFlat,
} from "@/features/markets/lib/live-category/live-category-shared";

import { sparkFromChange } from "./bist-sparkline-utils";

const SECTOR_DEFS: { id: string; name: string; match: (symbol: string) => boolean }[] = [
  { id: "bankacilik", name: "Bankacılık", match: (s) => /GARAN|AKBNK|ISCTR|YKBNK|HALKB|VAKBN/i.test(s) },
  { id: "holding", name: "Holding", match: (s) => /KCHOL|SAHOL|DOHOL|ECZYT/i.test(s) },
  { id: "sanayi", name: "Sanayi", match: (s) => /EREGL|ARCLK|VESTL|TUPRS|PETKM|SISE/i.test(s) },
  { id: "ulasim", name: "Ulaşım", match: (s) => /THYAO|TOASO|FROTO|PGSUS/i.test(s) },
  { id: "enerji", name: "Enerji", match: (s) => /AYDEM|AKSEN|ZOREN|ENJSA/i.test(s) },
  { id: "perakende", name: "Perakende", match: (s) => /BIMAS|MGROS|SOKM|BIZIM/i.test(s) },
  { id: "insaat", name: "İnşaat", match: (s) => /ENKAI|TKFEN|YYAPI|ORGE/i.test(s) },
  { id: "teknoloji", name: "Teknoloji", match: (s) => /ASELS|LOGO|NETAS|KAREL/i.test(s) },
];

const BANK_SYMBOLS = /GARAN|AKBNK|ISCTR|YKBNK|HALKB|VAKBN|SKBNK|TSKB/i;
const INDUSTRIAL_SYMBOLS = /EREGL|TUPRS|ARCLK|VESTL|PETKM|SISE|THYAO|TOASO|FROTO|ASELS/i;

export function resolveBistScreenerSector(symbol: string): BistScreenerCategory {
  const s = symbol.toUpperCase().replace(".IS", "");
  for (const def of SECTOR_DEFS) {
    if (def.match(s)) return def.id as BistScreenerCategory;
  }
  return "diger";
}

function heatLevelFromChange(changePct: number): BistHeatLevel {
  if (changePct > 1.5) return "hot-strong";
  if (changePct > 0.3) return "hot-mild";
  if (changePct > -0.3) return "neutral";
  if (changePct > -1.5) return "cold-mild";
  return "cold-strong";
}

export function buildBistSectorHeatmap(assets: readonly MarketAssetView[]): BistSectorItem[] {
  return SECTOR_DEFS.map((def) => {
    const pool = assets.filter((a) => def.match(a.symbol));
    const changePercent =
      pool.length > 0
        ? Math.round((pool.reduce((s, a) => s + a.change_percent, 0) / pool.length) * 100) / 100
        : 0;
    const leader = pool.sort((a, b) => b.change_percent - a.change_percent)[0];
    const leaderLabel = leader
      ? `${leader.symbol.replace(".IS", "")} ${leader.change_percent >= 0 ? "+" : ""}${leader.change_percent.toFixed(2)}%`
      : "—";

    return {
      id: def.id,
      name: def.name,
      changePercent,
      leader: leaderLabel,
      heatLevel: heatLevelFromChange(changePercent),
      sparkline:
        leader && sparkOrFlat(leader).length > 1
          ? sparkOrFlat(leader)
          : sparkFromChange(changePercent, 7),
    };
  });
}

function resolveTrend(avg: number, bist100Change: number): BistTrend {
  if (bist100Change > 0.5 || avg > 0.4) return "bull";
  if (bist100Change < -0.4 || avg < -0.4) return "bear";
  return "yatay";
}

const TREND_HEADLINE: Record<BistTrend, string> = {
  bull: "YÜKSELİŞ PİYASASI",
  bear: "SATIŞ PİYASASI",
  yatay: "YATAY SEYİR",
};

export function buildBistMarketState(assets: readonly MarketAssetView[]): BistMarketStatePayload {
  const xu100 = findAsset(assets, "XU100") ?? findAsset(assets, "BIST100") ?? assets[0];
  const avg = avgChange(assets);
  const trend = resolveTrend(avg, xu100?.change_percent ?? 0);

  const bankPool = assets.filter((a) => BANK_SYMBOLS.test(a.symbol));
  const industrialPool = assets.filter((a) => INDUSTRIAL_SYMBOLS.test(a.symbol));
  const maliAvg =
    bankPool.length > 0
      ? bankPool.reduce((s, a) => s + Math.abs(a.change_percent), 0) / bankPool.length
      : 0;
  const sanayiAvg =
    industrialPool.length > 0
      ? industrialPool.reduce((s, a) => s + Math.abs(a.change_percent), 0) / industrialPool.length
      : 0;
  const otherAvg = Math.max(0, avgChange(assets) || 0.1);
  const total = maliAvg + sanayiAvg + otherAvg || 1;

  return {
    trend,
    headline: TREND_HEADLINE[trend],
    summary: `Canlı BIST: ${assets.length} sembol. ${TREND_HEADLINE[trend]}.`,
    bist100Value: xu100?.price ?? 0,
    bist100Change: xu100?.change_percent ?? 0,
    stats: {
      volatilite: avg > 0.5 || avg < -0.5 ? "Yüksek" : "Orta",
      yabancıNetAlım: avg > 0 ? "+ Pozitif" : avg < 0 ? "− Negatif" : "Nötr",
      teknikGorunum: avg > 0 ? "Pozitif" : avg < 0 ? "Negatif" : "Nötr",
      momentum: avg > 0.2 ? "Yükseliş" : avg < -0.2 ? "Düşüş" : "Yatay",
    },
    sectorDistribution: {
      mali: Math.round((maliAvg / total) * 100) || 40,
      sanayi: Math.round((sanayiAvg / total) * 100) || 35,
      diger: Math.round((otherAvg / total) * 100) || 25,
    },
  };
}

export function moodBandFromValue(value: number): "risk-on" | "neutral" | "risk-off" {
  if (value >= 70) return "risk-on";
  if (value >= 40) return "neutral";
  return "risk-off";
}
