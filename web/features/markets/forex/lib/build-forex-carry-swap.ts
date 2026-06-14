import type { ForexCarrySwapResponse } from "@/features/markets/forex/lib/forex-detail-types";
import {
  forexPairLabel,
  normalizeForexSymbol,
  yahooTickerFor,
} from "@/features/markets/forex/lib/forex-symbol-meta";
import { fetchYahooChart } from "@/features/markets/commodities/lib/commodity-yahoo";

type MacroRef = {
  baseBank: string;
  quoteBank: string;
  baseRate: number;
  quoteRate: number;
};

const MACRO_REF: Record<string, MacroRef> = {
  EURUSD: { baseBank: "ECB", quoteBank: "Fed", baseRate: 4.0, quoteRate: 5.25 },
  GBPUSD: { baseBank: "BoE", quoteBank: "Fed", baseRate: 5.0, quoteRate: 5.25 },
  USDJPY: { baseBank: "Fed", quoteBank: "BoJ", baseRate: 5.25, quoteRate: 0.1 },
  USDCHF: { baseBank: "Fed", quoteBank: "SNB", baseRate: 5.25, quoteRate: 1.5 },
  USDCAD: { baseBank: "Fed", quoteBank: "BoC", baseRate: 5.25, quoteRate: 4.5 },
  AUDUSD: { baseBank: "RBA", quoteBank: "Fed", baseRate: 4.35, quoteRate: 5.25 },
  USDTRY: { baseBank: "Fed", quoteBank: "TCMB", baseRate: 5.25, quoteRate: 45 },
  EURTRY: { baseBank: "ECB", quoteBank: "TCMB", baseRate: 4.0, quoteRate: 45 },
  DXY: { baseBank: "Fed", quoteBank: "Karma", baseRate: 5.25, quoteRate: 0 },
};

function refFor(symbol: string): MacroRef {
  return (
    MACRO_REF[symbol] ?? {
      baseBank: symbol.slice(0, 3),
      quoteBank: symbol.slice(3),
      baseRate: 3.5,
      quoteRate: 4.0,
    }
  );
}

function biasFromDiff(diffBps: number, symbol: string): {
  bias: ForexCarrySwapResponse["bias"];
  biasLabel: string;
  forwardBias: string;
} {
  const sym = normalizeForexSymbol(symbol);
  if (sym === "DXY") {
    return { bias: "neutral", biasLabel: "Endeks — carry yok", forwardBias: "USD rejimi" };
  }

  if (diffBps >= 120) {
    return {
      bias: "long",
      biasLabel: "Pozitif carry — quote lehine",
      forwardBias: `${refFor(sym).quoteBank} faiz avantajı`,
    };
  }
  if (diffBps <= -120) {
    return {
      bias: "short",
      biasLabel: "Negatif carry — base lehine",
      forwardBias: `${refFor(sym).baseBank} faiz avantajı`,
    };
  }
  return {
    bias: "neutral",
    biasLabel: "Nötr carry bandı",
    forwardBias: "Forward premium sınırlı",
  };
}

export async function fetchForexCarrySwap(symbol: string): Promise<ForexCarrySwapResponse | null> {
  const sym = normalizeForexSymbol(symbol);
  const ref = refFor(sym);
  const pair = forexPairLabel(sym);

  const diffBps = Math.round((ref.quoteRate - ref.baseRate) * 100);
  const { bias, biasLabel, forwardBias } = biasFromDiff(diffBps, sym);

  const dailySwapPips = Math.abs(diffBps) / 36;
  const longSwapPips = diffBps >= 0 ? dailySwapPips : -dailySwapPips * 0.6;
  const shortSwapPips = diffBps >= 0 ? -dailySwapPips * 0.6 : dailySwapPips;
  const forwardPremiumPct = diffBps / 100;
  const rollCostAnnualPct = -(forwardPremiumPct * 0.85);

  let source: ForexCarrySwapResponse["source"] = "reference";
  const ticker = yahooTickerFor(sym);
  if (ticker && sym !== "DXY") {
    const daily = await fetchYahooChart(ticker, "1d", "1mo");
    if (daily?.length) source = "yahoo";
  }

  return {
    symbol: sym,
    pair,
    source,
    updatedAt: Date.now(),
    longSwapPips: Number(longSwapPips.toFixed(2)),
    shortSwapPips: Number(shortSwapPips.toFixed(2)),
    swapLongLabel: "Long · gecelik",
    swapShortLabel: "Short · gecelik",
    rateDiffBps: diffBps,
    forwardPremiumPct: Number(forwardPremiumPct.toFixed(2)),
    rollCostAnnualPct: Number(rollCostAnnualPct.toFixed(2)),
    forwardBias,
    baseBank: ref.baseBank,
    quoteBank: ref.quoteBank,
    bias,
    biasLabel,
  };
}
