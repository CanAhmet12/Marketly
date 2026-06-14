import { fetchYahooChart } from "@/features/markets/commodities/lib/commodity-yahoo";
import type { ForexMacroRatesResponse } from "@/features/markets/forex/lib/forex-detail-types";
import {
  forexDisplayLabel,
  forexPairCategoryLabel,
  forexPairLabel,
  normalizeForexSymbol,
  yahooTickerFor,
} from "@/features/markets/forex/lib/forex-symbol-meta";

type MacroRef = {
  baseBank: string;
  quoteBank: string;
  baseRate: number;
  quoteRate: number;
  baseStance: string;
  quoteStance: string;
};

const MACRO_REF: Record<string, MacroRef> = {
  EURUSD: { baseBank: "ECB", quoteBank: "Fed", baseRate: 4.0, quoteRate: 5.25, baseStance: "Güvercin", quoteStance: "Şahin" },
  GBPUSD: { baseBank: "BoE", quoteBank: "Fed", baseRate: 5.0, quoteRate: 5.25, baseStance: "Nötr", quoteStance: "Şahin" },
  USDJPY: { baseBank: "Fed", quoteBank: "BoJ", baseRate: 5.25, quoteRate: 0.1, baseStance: "Şahin", quoteStance: "Ultra gevşek" },
  USDCHF: { baseBank: "Fed", quoteBank: "SNB", baseRate: 5.25, quoteRate: 1.5, baseStance: "Şahin", quoteStance: "Nötr" },
  USDCAD: { baseBank: "Fed", quoteBank: "BoC", baseRate: 5.25, quoteRate: 4.5, baseStance: "Şahin", quoteStance: "Güvercin" },
  AUDUSD: { baseBank: "RBA", quoteBank: "Fed", baseRate: 4.35, quoteRate: 5.25, baseStance: "Nötr", quoteStance: "Şahin" },
  USDTRY: { baseBank: "Fed", quoteBank: "TCMB", baseRate: 5.25, quoteRate: 45, baseStance: "Şahin", quoteStance: "Sıkı" },
  EURTRY: { baseBank: "ECB", quoteBank: "TCMB", baseRate: 4.0, quoteRate: 45, baseStance: "Güvercin", quoteStance: "Sıkı" },
  DXY: { baseBank: "Fed", quoteBank: "Karma", baseRate: 5.25, quoteRate: 0, baseStance: "Şahin", quoteStance: "USD ağırlıklı" },
};

function pctChange(current: number, previous: number): number {
  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous <= 0) return 0;
  return ((current - previous) / previous) * 100;
}

function signedPct(v: number): string {
  return `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;
}

function refFor(symbol: string): MacroRef {
  return (
    MACRO_REF[symbol] ?? {
      baseBank: symbol.slice(0, 3),
      quoteBank: symbol.slice(3),
      baseRate: 3.5,
      quoteRate: 4.0,
      baseStance: "Nötr",
      quoteStance: "Nötr",
    }
  );
}

function carryScore(ref: MacroRef, symbol: string): { score: string; sub: string; bias: string } {
  const sym = normalizeForexSymbol(symbol);
  if (sym === "DXY") return { score: "—", sub: "Endeks", bias: "USD rejimi" };

  const diffBps = Math.round((ref.quoteRate - ref.baseRate) * 100);
  const score = `${diffBps >= 0 ? "+" : ""}${diffBps} bp`;
  const sub = diffBps > 0 ? `${ref.quoteBank} lehine` : diffBps < 0 ? `${ref.baseBank} lehine` : "Nötr carry";
  const bias = Math.abs(diffBps) >= 100 ? "Carry aktif" : Math.abs(diffBps) >= 40 ? "Ilımlı carry" : "Zayıf carry";
  return { score, sub, bias };
}

export async function fetchForexMacroRates(symbol: string): Promise<ForexMacroRatesResponse | null> {
  const sym = normalizeForexSymbol(symbol);
  const ref = refFor(sym);
  const pair = forexPairLabel(sym);
  const carry = carryScore(ref, sym);

  let dxy30d = "—";
  let source: ForexMacroRatesResponse["source"] = "reference";

  const dxyDaily = await fetchYahooChart("DX-Y.NYB", "1d", "2mo");
  if (dxyDaily && dxyDaily.length >= 31) {
    const cur = dxyDaily[dxyDaily.length - 1]!.close;
    const prev = dxyDaily[dxyDaily.length - 31]!.close;
    dxy30d = signedPct(pctChange(cur, prev));
    source = "yahoo";
  }

  const diffBps = Math.round((ref.quoteRate - ref.baseRate) * 100);
  const policyScore = Math.min(100, Math.max(10, 50 + diffBps / 4));
  const carryWeight = Math.min(45, Math.max(15, Math.abs(diffBps) / 3));
  const macroWeight = Math.max(10, 100 - policyScore - carryWeight);

  const ticker = yahooTickerFor(sym);
  if (ticker && sym !== "DXY") {
    const daily = await fetchYahooChart(ticker, "1d", "1mo");
    if (daily?.length) source = "yahoo";
  }

  return {
    symbol: sym,
    pair,
    categoryLabel: forexPairCategoryLabel(sym),
    source,
    updatedAt: Date.now(),
    rateDiff: carry.score,
    rateDiffSub: "Faiz farkı (bp)",
    baseRate: sym === "DXY" ? `${ref.baseRate.toFixed(2)}%` : `${ref.baseRate.toFixed(2)}%`,
    baseRateSub: `${ref.baseBank} · ${ref.baseStance}`,
    quoteRate: sym === "DXY" ? "Karma" : `${ref.quoteRate.toFixed(2)}%`,
    quoteRateSub: `${ref.quoteBank} · ${ref.quoteStance}`,
    carryScore: carry.bias,
    carrySub: carry.sub,
    slices: [
      { key: "policy", label: "Politika farkı", pct: Math.round(policyScore) },
      { key: "carry", label: "Carry baskısı", pct: Math.round(carryWeight) },
      { key: "macro", label: "Makro duyarlılık", pct: Math.round(macroWeight) },
    ],
    stats: {
      dxy30d,
      policyBias: diffBps > 0 ? `${ref.quoteBank} lehine` : diffBps < 0 ? `${ref.baseBank} lehine` : "Nötr",
      carryBias: carry.bias,
      macroScore: Math.abs(diffBps) >= 80 ? "Yüksek" : Math.abs(diffBps) >= 35 ? "Orta" : "Düşük",
    },
    insights: [
      {
        id: "policy-gap",
        title: "Merkez bankası farkı",
        detail: `${ref.baseBank} ve ${ref.quoteBank} faiz tutumu parite yönünde temel sürücü.`,
        metricLabel: "Fark",
        metricValue: carry.score,
        severity: Math.abs(diffBps) >= 100 ? "high" : Math.abs(diffBps) >= 40 ? "medium" : "low",
      },
      {
        id: "dxy-link",
        title: "DXY makro bağlantısı",
        detail: "Dolar endeksi güçlenmesi USD kotasyonlu paritelerde baskı oluşturur.",
        metricLabel: "DXY 30g",
        metricValue: dxy30d,
        severity: "medium",
      },
    ],
  };
}
