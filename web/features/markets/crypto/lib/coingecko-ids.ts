export const COINGECKO_ID_BY_SYMBOL: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
  BNB: "binancecoin",
  XRP: "ripple",
  ADA: "cardano",
  DOGE: "dogecoin",
  AVAX: "avalanche-2",
  DOT: "polkadot",
  LINK: "chainlink",
  UNI: "uniswap",
  LTC: "litecoin",
  ATOM: "cosmos",
  MATIC: "matic-network",
  POL: "matic-network",
  NEAR: "near",
  SHIB: "shiba-inu",
  ARB: "arbitrum",
  OP: "optimism",
  TRX: "tron",
  XLM: "stellar",
  TON: "the-open-network",
  SUI: "sui",
  PEPE: "pepe",
  APT: "aptos",
};

type CoinGeckoSearchCoin = {
  id: string;
  symbol: string;
};

type CoinGeckoSearchResponse = {
  coins?: CoinGeckoSearchCoin[];
};

export function coingeckoIdForSymbol(symbol: string): string | null {
  const sym = symbol.trim().toUpperCase();
  return COINGECKO_ID_BY_SYMBOL[sym] ?? null;
}

export async function resolveCoinGeckoId(symbol: string): Promise<string | null> {
  const mapped = coingeckoIdForSymbol(symbol);
  if (mapped) return mapped;

  const sym = symbol.trim().toUpperCase();
  const url = `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(sym)}`;

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;

    const data = (await res.json()) as CoinGeckoSearchResponse;
    const match = data.coins?.find((coin) => coin.symbol?.trim().toUpperCase() === sym);
    return match?.id ?? null;
  } catch {
    return null;
  }
}
