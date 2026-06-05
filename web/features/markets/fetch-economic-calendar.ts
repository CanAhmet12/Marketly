import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  EconomicCalendarIntelEvent,
  EconomicCalendarIntelligenceBundle,
} from "@/features/markets/types/news-calendar-intelligence";
import { emptyEconomicCalendarIntelligenceBundle } from "@/features/markets/types/news-calendar-intelligence";

export type EconomicEventDbRow = {
  id: string;
  title: string;
  description: string | null;
  event_type: string | null;
  impact: "low" | "medium" | "high" | null;
  scheduled_at: string;
  related_symbol: string | null;
  actual_value: string | null;
  forecast_value: string | null;
  previous_value: string | null;
};

const SYMBOL_COUNTRY: Record<string, string> = {
  USD: "US",
  EUR: "EU",
  GBP: "GB",
  JPY: "JP",
  TRY: "TR",
  CAD: "CA",
  AUD: "AU",
  CHF: "CH",
  CNY: "CN",
  XU100: "TR",
  USDTRY: "TR",
};

function impactToTier(impact: EconomicEventDbRow["impact"]): 1 | 2 | 3 {
  if (impact === "high") return 3;
  if (impact === "medium") return 2;
  return 1;
}

function inferCountry(row: EconomicEventDbRow): string {
  const sym = (row.related_symbol ?? "").toUpperCase();
  if (sym && SYMBOL_COUNTRY[sym]) return SYMBOL_COUNTRY[sym]!;
  const et = (row.event_type ?? "").toUpperCase();
  for (const [key, code] of Object.entries(SYMBOL_COUNTRY)) {
    if (et.includes(key)) return code;
  }
  const title = row.title.toUpperCase();
  if (title.includes("FED") || title.includes("FOMC") || title.includes("US ")) return "US";
  if (title.includes("ECB") || title.includes("EURO")) return "EU";
  if (title.includes("TÜRK") || title.includes("TCMB")) return "TR";
  return "GLOBAL";
}

function mapRowToEvent(
  row: EconomicEventDbRow,
  watched: readonly string[],
  portfolio: readonly string[],
): EconomicCalendarIntelEvent {
  const sym = (row.related_symbol ?? "").toUpperCase();
  const affected = sym ? [sym] : [];
  const watchSet = new Set(watched.map((s) => s.toUpperCase()));
  const portSet = new Set(portfolio.map((s) => s.toUpperCase()));

  return {
    id: row.id,
    at: row.scheduled_at,
    country: inferCountry(row),
    title: row.title,
    impact: impactToTier(row.impact),
    affectedSymbols: affected,
    volatilityExpectation: "—",
    consensusExpectation: row.forecast_value?.trim() || "—",
    historicalMemory: row.previous_value?.trim() || "—",
    positioningLabel: "—",
    creatorCommentary: [],
    relatedSignalsLabel: "—",
    relatedSignalsHref: "/signals",
    sentimentBefore: "—",
    sentimentAfter: row.actual_value?.trim() || "—",
    macroTheme: row.event_type?.trim() || "—",
    discussionRows: [],
    networkHint: row.description?.trim() || "—",
    hitsWatchlist: sym ? watchSet.has(sym) : false,
    hitsPortfolio: sym ? portSet.has(sym) : false,
  };
}

/** `economic_events` tablosundan takvim */
export async function fetchEconomicEventRows(
  client: SupabaseClient,
  limit = 80,
): Promise<EconomicEventDbRow[]> {
  try {
    const { data, error } = await client
      .from("economic_events")
      .select(
        "id, title, description, event_type, impact, scheduled_at, related_symbol, actual_value, forecast_value, previous_value",
      )
      .order("scheduled_at", { ascending: true })
      .limit(limit);

    if (error || !data) {
      console.warn("[markets] fetchEconomicEventRows", error?.message);
      return [];
    }
    return data as EconomicEventDbRow[];
  } catch (e) {
    console.warn("[markets] fetchEconomicEventRows", e);
    return [];
  }
}

export async function fetchEconomicEventById(
  client: SupabaseClient,
  eventId: string,
): Promise<EconomicEventDbRow | null> {
  try {
    const { data, error } = await client
      .from("economic_events")
      .select(
        "id, title, description, event_type, impact, scheduled_at, related_symbol, actual_value, forecast_value, previous_value",
      )
      .eq("id", eventId)
      .maybeSingle();

    if (error || !data) return null;
    return data as EconomicEventDbRow;
  } catch {
    return null;
  }
}

export function buildEconomicCalendarBundle(
  rows: readonly EconomicEventDbRow[],
  watchedSymbols: readonly string[],
  portfolioSymbols: readonly string[],
): EconomicCalendarIntelligenceBundle {
  if (rows.length === 0) return emptyEconomicCalendarIntelligenceBundle();

  const events = rows.map((r) => mapRowToEvent(r, watchedSymbols, portfolioSymbols));
  const highImpact = events.filter((e) => e.impact === 3).length;
  const personalized = events.some((e) => e.hitsWatchlist)
    ? "İzleme listenle kesişen makro olaylar vurgulandı"
    : "Yaklaşan makro takvim";

  return {
    events,
    personalizedHeadline: personalized,
    narrativeShift: highImpact > 0 ? `${highImpact} yüksek etkili olay` : "—",
  };
}

export async function fetchEconomicCalendarBundle(
  client: SupabaseClient,
  watchedSymbols: readonly string[],
  portfolioSymbols: readonly string[],
): Promise<EconomicCalendarIntelligenceBundle> {
  const rows = await fetchEconomicEventRows(client);
  return buildEconomicCalendarBundle(rows, watchedSymbols, portfolioSymbols);
}

/** UI tablo satırı — önceki/tahmin/gerçekleşen alanları */
export function toCalendarTableRow(
  event: EconomicCalendarIntelEvent,
  db?: EconomicEventDbRow | null,
) {
  return {
    id: event.id,
    at: event.at,
    country: event.country,
    title: event.title,
    impact: event.impact as 1 | 2 | 3,
    affectedSymbols: event.affectedSymbols ?? [],
    hitsWatchlist: event.hitsWatchlist,
    previous: db?.previous_value ?? event.historicalMemory !== "—" ? event.historicalMemory : null,
    forecast: db?.forecast_value ?? (event.consensusExpectation !== "—" ? event.consensusExpectation : null),
    actual: db?.actual_value ?? (event.sentimentAfter !== "—" ? event.sentimentAfter : null),
    code: db?.event_type ?? null,
  };
}
