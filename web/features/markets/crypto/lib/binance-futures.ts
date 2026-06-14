export const BINANCE_FUTURES_BASE = "https://fapi.binance.com" as const;

export { parseCryptoSymbol, usdtPair } from "@/features/markets/crypto/lib/binance-spot";

const FUTURES_TIMEOUT_MS = 4_500;

async function fetchJsonWithTimeout<T>(url: string): Promise<T | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FUTURES_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: controller.signal,
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchBinanceFutures<T>(
  path: string,
  params: Record<string, string>,
): Promise<T | null> {
  const url = new URL(`${BINANCE_FUTURES_BASE}${path}`);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  return fetchJsonWithTimeout<T>(url.toString());
}

export async function fetchBinanceFuturesData<T>(
  path: string,
  params: Record<string, string>,
): Promise<T | null> {
  const url = new URL(`${BINANCE_FUTURES_BASE}/futures/data${path}`);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  return fetchJsonWithTimeout<T>(url.toString());
}
