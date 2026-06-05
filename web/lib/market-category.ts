import type { MarketAssetCategory } from "@/features/markets/types";

/** Sembolden varlık sınıfı — mock + gerçek API öncesi ortak yardımcı */
export function inferMarketAssetCategory(symbol: string): MarketAssetCategory {
  const s = symbol.toUpperCase();
  if (["BTC", "ETH", "SOL"].includes(s)) return "crypto";
  if (["XU100", "NDX", "SPX"].includes(s)) return "index";
  if (["THYAO", "ASELS", "GARAN", "AAPL"].includes(s)) return "stocks";
  if (s === "USDTRY") return "forex";
  if (s === "XAUUSD") return "commodity";
  return "crypto";
}
