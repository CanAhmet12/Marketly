import type {
  CommodityCategory,
  CommodityClassItem,
  CommodityHeatLevel,
  CommodityRegimePayload,
  CommodityRegimeType,
} from "@/features/markets/commodities/types";
import type { MarketAssetView } from "@/features/markets/types";

import {
  avgChange,
  findAsset,
  sparkOrFlat,
} from "@/features/markets/lib/live-category/live-category-shared";

import { commodityDisplayLabel } from "./map-commodity-tickers";
import { sparkFromChange } from "./commodity-sparkline-utils";

export function volatilityBandFromValue(value: number): "low" | "medium" | "high" {
  if (value >= 65) return "high";
  if (value >= 38) return "medium";
  return "low";
}

const CLASS_DEFS: {
  id: string;
  name: string;
  match: (symbol: string) => boolean;
}[] = [
  {
    id: "degerli-metal",
    name: "Değerli Metaller",
    match: (s) => resolveCommodityCategory(s) === "degerli-metal",
  },
  {
    id: "enerji",
    name: "Enerji",
    match: (s) => resolveCommodityCategory(s) === "enerji",
  },
  {
    id: "tahil",
    name: "Tahıl",
    match: (s) => /WHEAT|CORN|SOY|MISIR|BUGDAY|BUĞDAY/i.test(s),
  },
  {
    id: "yumusak",
    name: "Yumuşak Emtia",
    match: (s) => /KAHVE|COFFEE|SUGAR|SEKER|PAMUK|COTTON|KAKAO|COCOA/i.test(s),
  },
  {
    id: "tarim",
    name: "Tarım",
    match: (s) =>
      resolveCommodityCategory(s) === "tarim" &&
      !/WHEAT|CORN|SOY|MISIR|BUGDAY|BUĞDAY|KAHVE|COFFEE|SUGAR|SEKER|PAMUK|COTTON|KAKAO|COCOA/i.test(s),
  },
  {
    id: "endustri",
    name: "Endüstri Metalleri",
    match: (s) => resolveCommodityCategory(s) === "endustri",
  },
];

export function resolveCommodityCategory(symbol: string): CommodityCategory {
  const s = symbol.toUpperCase();
  if (s.includes("XAU") || s.includes("XAG") || s.includes("PLAT") || s.includes("PALL")) return "degerli-metal";
  if (s.includes("WTI") || s.includes("BRENT") || s.includes("NG") || s.includes("GAS") || s.includes("FUEL")) {
    return "enerji";
  }
  if (s.includes("WHEAT") || s.includes("CORN") || s.includes("SOY") || s.includes("SUGAR") || s.includes("COFFEE")) {
    return "tarim";
  }
  return "endustri";
}

function heatLevelFromChange(changePct: number): CommodityHeatLevel {
  if (changePct > 0.8) return "hot-strong";
  if (changePct > 0.2) return "hot-mild";
  if (changePct > -0.2) return "neutral";
  if (changePct > -0.8) return "cold-mild";
  return "cold-strong";
}

export function buildCommodityClassHeatmap(assets: readonly MarketAssetView[]): CommodityClassItem[] {
  return CLASS_DEFS.map((def) => {
    const pool = assets.filter((a) => def.match(a.symbol));
    const changePct =
      pool.length > 0
        ? Math.round((pool.reduce((s, a) => s + a.change_percent, 0) / pool.length) * 100) / 100
        : 0;
    const leader = pool.sort((a, b) => b.change_percent - a.change_percent)[0];
    const leaderLabel = leader
      ? `${commodityDisplayLabel(leader.symbol, leader.name)} ${leader.change_percent >= 0 ? "+" : ""}${leader.change_percent.toFixed(2)}%`
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

function resolveRegime(avg: number, goldChange: number): CommodityRegimeType {
  if (goldChange > 0.25 || avg > 0.35) return "altin-sezonu";
  if (avg < -0.35) return "enerji-lider";
  if (avg > 0.15) return "tarim-rallisi";
  return "karma";
}

const REGIME_HEADLINE: Record<CommodityRegimeType, string> = {
  "altin-sezonu": "ALTIN SEZONU",
  "enerji-lider": "ENERJİ YÜKSELİŞ",
  "tarim-rallisi": "TARIM RALLİSİ",
  karma: "KARMA PİYASA",
};

export function buildCommodityRegime(assets: readonly MarketAssetView[]): CommodityRegimePayload {
  const gold = findAsset(assets, "XAU") ?? findAsset(assets, "XAUUSD") ?? assets[0];
  const avg = avgChange(assets);
  const regime = resolveRegime(avg, gold?.change_percent ?? 0);
  const classes = buildCommodityClassHeatmap(assets);

  const metal = classes.find((c) => c.id === "degerli-metal")?.changePct ?? 0;
  const enerji = classes.find((c) => c.id === "enerji")?.changePct ?? 0;
  const tarimPool = classes.filter((c) => c.id === "tarim" || c.id === "tahil" || c.id === "yumusak");
  const tarim =
    tarimPool.length > 0
      ? tarimPool.reduce((s, c) => s + c.changePct, 0) / tarimPool.length
      : 0;
  const total = Math.abs(metal) + Math.abs(enerji) + Math.abs(tarim) || 1;

  return {
    regime,
    headline: REGIME_HEADLINE[regime],
    summary: `Canlı emtia: ${assets.length} sembol. ${REGIME_HEADLINE[regime]} rejimi.`,
    altinValue: gold?.price ?? 0,
    altinChange: gold?.change_percent ?? 0,
    stats: {
      usdKorelasyon: avg > 0 ? "Ters (-0.68)" : "Zayıf (-0.32)",
      talepGorunumu: avg > 0.2 ? "Güçlü" : avg < -0.2 ? "Zayıf" : "Ilımlı",
      enflasyonBekl: avg > 0 ? "Yükseliş" : "Sabit",
      trendGucu: avg > 0.4 ? "Çok Güçlü" : avg > 0 ? "Olumlu" : "Nötr",
    },
    distribution: {
      metal: Math.round((Math.abs(metal) / total) * 100) || 33,
      enerji: Math.round((Math.abs(enerji) / total) * 100) || 33,
      tarim: Math.round((Math.abs(tarim) / total) * 100) || 34,
    },
  };
}
