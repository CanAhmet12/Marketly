import { forexPairLabel, normalizeForexSymbol } from "@/features/markets/forex/lib/forex-symbol-meta";

export function pipSize(symbol: string): number {
  const sym = normalizeForexSymbol(symbol);
  const pair = forexPairLabel(sym);
  if (sym === "DXY") return 0.01;
  if (pair.includes("JPY") && !pair.startsWith("JPY/")) return 0.01;
  if (pair.includes("TRY")) return 0.01;
  return 0.0001;
}

export function pipsBetween(high: number, low: number, symbol: string): number {
  const size = pipSize(symbol);
  if (size <= 0) return 0;
  return Math.round(Math.abs(high - low) / size);
}

export function addPips(price: number, pips: number, symbol: string): number {
  return price + pips * pipSize(symbol);
}

export function formatPipCount(pips: number): string {
  return `${pips} pip`;
}
