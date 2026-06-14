export const BINANCE_SPOT_BASES = ["https://data-api.binance.vision", "https://api.binance.com"] as const;

export function parseCryptoSymbol(raw: string | null): string | null {
  if (!raw) return null;
  const sym = raw.trim().toUpperCase();
  if (!/^[A-Z0-9]{2,12}$/.test(sym)) return null;
  return sym;
}

export function usdtPair(symbol: string): string {
  return `${symbol.trim().toUpperCase()}USDT`;
}

export async function fetchBinanceSpot<T>(
  path: string,
  params: Record<string, string>,
): Promise<T | null> {
  for (const base of BINANCE_SPOT_BASES) {
    const url = new URL(`${base}${path}`);
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v);
    }
    try {
      const res = await fetch(url.toString(), {
        headers: { Accept: "application/json" },
        next: { revalidate: 5 },
      });
      if (!res.ok) continue;
      return (await res.json()) as T;
    } catch {
      continue;
    }
  }
  return null;
}
