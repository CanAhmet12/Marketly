import type { CurrencyHeatLevel, CurrencyStrengthItem } from "@/features/markets/forex/types";
import type { MarketAssetView } from "@/features/markets/types";

import { pairLabel, sparkOrFlat } from "@/features/markets/lib/live-category/live-category-shared";

import { sparkFromChange } from "./forex-sparkline-utils";

const CURRENCY_NAMES: Record<string, string> = {
  USD: "Amerikan Doları",
  EUR: "Euro",
  GBP: "İngiliz Sterlini",
  JPY: "Japon Yeni",
  CHF: "İsviçre Frangı",
  AUD: "Avustralya Doları",
  NZD: "Yeni Zelanda Doları",
  CAD: "Kanada Doları",
  TRY: "Türk Lirası",
};

/** Heatmap'te sabit sıra — majörler önce */
const CURRENCY_PRIORITY = ["USD", "EUR", "GBP", "JPY", "CHF", "AUD", "NZD", "CAD", "TRY"] as const;

function parsePairCodes(symbol: string): [string, string] | null {
  const pair = pairLabel(symbol);
  if (pair.includes("/")) {
    const [base, quote] = pair.split("/");
    if (base && quote) return [base, quote];
  }
  const s = symbol.toUpperCase().replace("/", "");
  if (s.length === 6) return [s.slice(0, 3), s.slice(3)];
  return null;
}

export function heatLevelFromChange(changePct: number): CurrencyHeatLevel {
  if (changePct > 0.3) return "strong";
  if (changePct > 0.05) return "mild-up";
  if (changePct > -0.05) return "neutral";
  if (changePct > -0.3) return "mild-down";
  return "weak";
}

export function buildForexCurrencyHeatmap(assets: readonly MarketAssetView[]): CurrencyStrengthItem[] {
  const accum = new Map<string, { sum: number; count: number; spark: number[] }>();

  for (const asset of assets) {
    const codes = parsePairCodes(asset.symbol);
    if (!codes) continue;
    const [base, quote] = codes;
    const ch = asset.change_percent;
    const spark = sparkOrFlat(asset);

    for (const [code, delta] of [[base, ch], [quote, -ch]] as const) {
      const prev = accum.get(code) ?? { sum: 0, count: 0, spark: [] as number[] };
      prev.sum += delta;
      prev.count += 1;
      if (prev.spark.length < 2) prev.spark = spark;
      accum.set(code, prev);
    }
  }

  return CURRENCY_PRIORITY.filter((code) => accum.has(code)).map((code) => {
    const { sum, count, spark } = accum.get(code)!;
    const changePct = Math.round((sum / count) * 100) / 100;
    return {
      code,
      name: CURRENCY_NAMES[code] ?? code,
      changePct,
      heatLevel: heatLevelFromChange(changePct),
      sparkline: spark.length > 1 ? spark : sparkFromChange(changePct, 8),
    };
  });
}

/** Rejim dağılım barı — güvenli / riskli / GOÜ hareket payı */
export function computeCurrencyDistribution(currencies: readonly CurrencyStrengthItem[]): {
  safe: number;
  risky: number;
  em: number;
} {
  const safeCodes = new Set(["USD", "JPY", "CHF"]);
  const riskyCodes = new Set(["AUD", "NZD", "CAD", "GBP"]);

  let safe = 0;
  let risky = 0;
  let em = 0;

  for (const cur of currencies) {
    const w = Math.abs(cur.changePct);
    if (safeCodes.has(cur.code)) safe += w;
    else if (riskyCodes.has(cur.code)) risky += w;
    else em += w;
  }

  const total = safe + risky + em || 1;
  return {
    safe: Math.round((safe / total) * 100),
    risky: Math.round((risky / total) * 100),
    em: Math.max(0, 100 - Math.round((safe / total) * 100) - Math.round((risky / total) * 100)),
  };
}
