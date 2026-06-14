import { yahooTickerFor } from "@/features/markets/nasdaq/lib/nasdaq-symbol-meta";

const YAHOO_SUMMARY = "https://query1.finance.yahoo.com/v10/finance/quoteSummary";

export type YahooEarningsHint = {
  date: string;
  timing: "BMO" | "AMC" | "—";
};

function formatEarningsDate(raw: number): string {
  return new Date(raw * 1000).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
  });
}

export async function fetchYahooEarningsHint(symbol: string): Promise<YahooEarningsHint | null> {
  const ticker = yahooTickerFor(symbol.trim().toUpperCase());
  if (!ticker) return null;

  const url = new URL(`${YAHOO_SUMMARY}/${encodeURIComponent(ticker)}`);
  url.searchParams.set("modules", "calendarEvents");

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6_000);
    const res = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; Marketly/1.0)",
      },
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return null;

    const json = (await res.json()) as {
      quoteSummary?: {
        result?: Array<{
          calendarEvents?: {
            earnings?: {
              earningsDate?: Array<{ raw?: number; fmt?: string }>;
              earningsCallDate?: Array<{ raw?: number }>;
            };
          };
        }>;
      };
    };

    const earnings = json.quoteSummary?.result?.[0]?.calendarEvents?.earnings;
    const nextDate = earnings?.earningsDate?.[0];
    if (!nextDate?.raw) return null;

    const callRaw = earnings?.earningsCallDate?.[0]?.raw;
    let timing: YahooEarningsHint["timing"] = "—";
    if (callRaw) {
      const hour = new Date(callRaw * 1000).getUTCHours();
      timing = hour < 14 ? "BMO" : "AMC";
    }

    return {
      date: nextDate.fmt?.trim() || formatEarningsDate(nextDate.raw),
      timing,
    };
  } catch {
    return null;
  }
}
