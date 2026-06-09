import type { MarketAssetView } from "@/features/markets/types";

export type PortfolioCurrency = "USD" | "TRY";

const USD_TICKERS = new Set([
  "AAPL",
  "MSFT",
  "NVDA",
  "TSLA",
  "GOOGL",
  "GOOG",
  "META",
  "AMZN",
  "NFLX",
  "AMD",
  "INTC",
  "COIN",
  "MSTR",
  "SPY",
  "QQQ",
  "NDX",
]);

/** Sembol + kategori → gösterim para birimi */
export function portfolioCurrencyForSymbol(symbol: string, category?: string | null): PortfolioCurrency {
  const s = symbol.trim().toUpperCase();
  if (!s) return "USD";
  if (s.includes("TRY") || s === "XU100" || s === "BIST100" || s === "BIST30" || s.endsWith(".IS")) {
    return "TRY";
  }
  if (USD_TICKERS.has(s)) return "USD";
  if (category === "stocks" && /^[A-Z]{3,6}$/.test(s)) return "TRY";
  if (category === "forex" && s.includes("TRY")) return "TRY";
  return "USD";
}

export function portfolioCurrencyForAsset(asset?: Pick<MarketAssetView, "symbol" | "category"> | null): PortfolioCurrency {
  if (!asset) return "USD";
  return portfolioCurrencyForSymbol(asset.symbol, asset.category);
}

/** Portföy hero toplamları — ağırlıklı baskın para birimi */
export function resolvePortfolioPrimaryCurrency(
  rows: readonly { symbol: string; category?: string | null; value: number }[],
): PortfolioCurrency {
  if (!rows.length) return "USD";
  let tryWeight = 0;
  let total = 0;
  for (const r of rows) {
    const w = Math.max(0, r.value);
    total += w;
    if (portfolioCurrencyForSymbol(r.symbol, r.category) === "TRY") tryWeight += w;
  }
  if (total <= 0) return "USD";
  return tryWeight / total >= 0.45 ? "TRY" : "USD";
}

export function fmtPortfolioMoney(amount: number, currency: PortfolioCurrency): string {
  const abs = Math.abs(amount);
  const opts: Intl.NumberFormatOptions = {
    minimumFractionDigits: abs >= 100 ? 0 : 2,
    maximumFractionDigits: abs >= 100 ? 0 : 2,
  };
  if (currency === "TRY") {
    return `₺${amount.toLocaleString("tr-TR", opts)}`;
  }
  return `$${amount.toLocaleString("en-US", opts)}`;
}

export function fmtPortfolioPrice(price: number, currency: PortfolioCurrency): string {
  if (price <= 0) return "—";
  if (currency === "TRY") {
    return `₺${price.toLocaleString("tr-TR", { maximumFractionDigits: price >= 100 ? 0 : 2 })}`;
  }
  return `$${price.toLocaleString("en-US", { maximumFractionDigits: price >= 100 ? 2 : 4 })}`;
}

export function fmtPortfolioPct(n: number): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}
