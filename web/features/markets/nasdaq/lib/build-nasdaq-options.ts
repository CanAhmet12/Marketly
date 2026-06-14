import type { NasdaqOptionsResponse } from "@/features/markets/nasdaq/lib/nasdaq-detail-types";
import {
  isNasdaqIndexSymbol,
  yahooTickerFor,
} from "@/features/markets/nasdaq/lib/nasdaq-symbol-meta";
import { fetchYahooQuote } from "@/features/markets/commodities/lib/commodity-yahoo";

const OPTIONS_BASE = "https://query1.finance.yahoo.com/v7/finance/options";

type YahooOptionsJson = {
  optionChain?: {
    result?: Array<{
      quote?: { regularMarketPrice?: number };
      expirationDates?: number[];
      options?: Array<{
        expirationDate?: number;
        calls?: Array<{
          strike?: number;
          impliedVolatility?: number;
          openInterest?: number;
          percentChange?: number;
        }>;
        puts?: Array<{
          strike?: number;
          impliedVolatility?: number;
          openInterest?: number;
          percentChange?: number;
        }>;
      }>;
    }>;
  };
};

function optionsProxy(symbol: string): { ticker: string; note?: string } {
  const sym = symbol.trim().toUpperCase();
  if (sym === "NDX" || sym === "COMP") {
    return { ticker: "QQQ", note: "NDX için QQQ opsiyon proxy" };
  }
  if (sym === "SPX") {
    return { ticker: "SPY", note: "SPX için SPY opsiyon proxy" };
  }
  return { ticker: sym };
}

function formatOi(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(Math.round(n));
}

function referenceOptions(symbol: string, spot: number): NasdaqOptionsResponse {
  const sym = symbol.trim().toUpperCase();
  const proxy = optionsProxy(sym);
  const iv = isNasdaqIndexSymbol(sym) ? 18.5 : 32.0;
  const strikes = [0.95, 1.0, 1.05].map((m) => Math.round(spot * m * 100) / 100);

  return {
    symbol: sym,
    proxySymbol: proxy.ticker !== sym ? proxy.ticker : undefined,
    proxyNote: proxy.note,
    source: "reference",
    updatedAt: Date.now(),
    expiry: "Yakın vade",
    putCallRatio: 0.82,
    impliedVolPct: iv,
    totalOpenInterest: "—",
    maxPain: spot,
    bias: "neutral",
    biasLabel: "Nötr opsiyon akışı",
    rows: strikes.flatMap((strike) => [
      {
        type: "call" as const,
        strike,
        iv: iv + 1.2,
        oi: "—",
        changePct: 0.4,
      },
      {
        type: "put" as const,
        strike,
        iv: iv + 0.8,
        oi: "—",
        changePct: -0.3,
      },
    ]),
  };
}

async function fetchYahooOptionsChain(ticker: string): Promise<YahooOptionsJson | null> {
  const url = `${OPTIONS_BASE}/${encodeURIComponent(ticker)}`;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6_000);
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; Marketly/1.0)",
      },
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    return (await res.json()) as YahooOptionsJson;
  } catch {
    return null;
  }
}

export async function fetchNasdaqOptions(symbol: string): Promise<NasdaqOptionsResponse | null> {
  const sym = symbol.trim().toUpperCase();
  const proxy = optionsProxy(sym);
  const ticker = yahooTickerFor(proxy.ticker) ?? proxy.ticker;

  const [quote, chainJson] = await Promise.all([
    fetchYahooQuote(ticker),
    fetchYahooOptionsChain(ticker),
  ]);

  const spot = quote?.price ?? 0;
  if (spot <= 0 && !chainJson) return null;

  const result = chainJson?.optionChain?.result?.[0];
  const chain = result?.options?.[0];
  const spotPrice = result?.quote?.regularMarketPrice ?? spot;

  if (!chain?.calls?.length && !chain?.puts?.length) {
    return referenceOptions(sym, spotPrice || 100);
  }

  const calls = (chain.calls ?? []).filter((c) => c.strike != null).slice(0, 3);
  const puts = (chain.puts ?? []).filter((p) => p.strike != null).slice(0, 3);

  const callOi = calls.reduce((s, c) => s + (c.openInterest ?? 0), 0);
  const putOi = puts.reduce((s, p) => s + (p.openInterest ?? 0), 0);
  const putCallRatio = callOi > 0 ? putOi / callOi : 0.9;

  const allIv = [...calls, ...puts]
    .map((r) => (r.impliedVolatility ?? 0) * 100)
    .filter((v) => v > 0);
  const impliedVolPct =
    allIv.length > 0 ? allIv.reduce((s, v) => s + v, 0) / allIv.length : 28;

  const expiryTs = chain.expirationDate ?? result?.expirationDates?.[0];
  const expiry = expiryTs
    ? new Date(expiryTs * 1000).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })
    : "Yakın vade";

  const rows = [
    ...calls.map((c) => ({
      type: "call" as const,
      strike: c.strike!,
      iv: (c.impliedVolatility ?? 0) * 100,
      oi: formatOi(c.openInterest ?? 0),
      changePct: c.percentChange ?? 0,
    })),
    ...puts.map((p) => ({
      type: "put" as const,
      strike: p.strike!,
      iv: (p.impliedVolatility ?? 0) * 100,
      oi: formatOi(p.openInterest ?? 0),
      changePct: p.percentChange ?? 0,
    })),
  ].slice(0, 6);

  const maxPain =
    rows.length > 0
      ? rows.reduce((best, row) => (Math.abs(row.strike - spotPrice) < Math.abs(best - spotPrice) ? row.strike : best), rows[0]!.strike)
      : spotPrice;

  let bias: NasdaqOptionsResponse["bias"] = "neutral";
  let biasLabel = "Nötr opsiyon akışı";
  if (putCallRatio > 1.1) {
    bias = "put";
    biasLabel = "Put ağırlıklı — hedge";
  } else if (putCallRatio < 0.75) {
    bias = "call";
    biasLabel = "Call ağırlıklı — risk-on";
  }

  return {
    symbol: sym,
    proxySymbol: proxy.ticker !== sym ? proxy.ticker : undefined,
    proxyNote: proxy.note,
    source: "yahoo",
    updatedAt: Date.now(),
    expiry,
    putCallRatio,
    impliedVolPct,
    totalOpenInterest: formatOi(callOi + putOi),
    maxPain,
    bias,
    biasLabel,
    rows,
  };
}
