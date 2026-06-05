/** Ekonomik takvim — sayısal önceki / tahmin / gerçekleşen (mock) */

export type CalendarEventExtra = {
  code: string;
  category: "inflation" | "growth" | "employment" | "monetary" | "trade" | "speech";
  flag: string;
  previous: string;
  forecast: string;
  actual: string | null;
};

export const CALENDAR_EVENT_EXTRA: Record<string, CalendarEventExtra> = {
  "ec-1": { code: "ÜFE", category: "inflation", flag: "🇺🇸", previous: "0.2%", forecast: "0.3%", actual: "0.4%" },
  "ec-2": { code: "ECB", category: "speech", flag: "🇪🇺", previous: "—", forecast: "—", actual: null },
  "ec-3": { code: "İŞS", category: "employment", flag: "🇹🇷", previous: "8.8%", forecast: "8.6%", actual: "8.5%" },
  "ec-4": { code: "MGN", category: "trade", flag: "🇺🇸", previous: "76.5", forecast: "77.0", actual: null },
  "ec-5": { code: "ZEW", category: "growth", flag: "🇪🇺", previous: "11.5", forecast: "13.2", actual: "14.8" },
  "ec-6": { code: "CPI", category: "inflation", flag: "🇺🇸", previous: "0.3%", forecast: "0.3%", actual: null },
  "ec-7": { code: "TÜFE", category: "inflation", flag: "🇹🇷", previous: "68.5%", forecast: "65.2%", actual: "63.1%" },
  "ec-8": { code: "SAÜ", category: "growth", flag: "🇪🇺", previous: "-1.2%", forecast: "-0.8%", actual: "-0.6%" },
  "ec-9": { code: "FED", category: "speech", flag: "🇺🇸", previous: "—", forecast: "—", actual: null },
  "ec-10": { code: "PRT", category: "trade", flag: "🇺🇸", previous: "0.6%", forecast: "0.4%", actual: null },
  "ec-11": { code: "GSYİH", category: "growth", flag: "🇬🇧", previous: "0.1%", forecast: "0.3%", actual: null },
  "ec-12": { code: "İŞT", category: "employment", flag: "🇺🇸", previous: "222K", forecast: "218K", actual: null },
  "ec-13": { code: "HICP", category: "inflation", flag: "🇪🇺", previous: "2.7%", forecast: "2.5%", actual: null },
  "ec-14": { code: "İST", category: "employment", flag: "🇨🇦", previous: "+25K", forecast: "+30K", actual: null },
  "ec-15": { code: "FOMC", category: "monetary", flag: "🇺🇸", previous: "5.50%", forecast: "5.25%", actual: null },
};

export function getCalendarEventExtra(eventId: string): CalendarEventExtra | null {
  return CALENDAR_EVENT_EXTRA[eventId] ?? null;
}

export function beatsForecast(actual: string, forecast: string): boolean | null {
  const a = parseFloat(actual.replace(/[^0-9.-]/g, ""));
  const f = parseFloat(forecast.replace(/[^0-9.-]/g, ""));
  if (Number.isNaN(a) || Number.isNaN(f)) return null;
  return a > f ? true : a < f ? false : null;
}

export const CALENDAR_CATEGORY_LABEL: Record<CalendarEventExtra["category"], string> = {
  inflation: "Enflasyon",
  growth: "Büyüme",
  employment: "İstihdam",
  monetary: "Para politikası",
  trade: "Ticaret",
  speech: "Konuşma",
};
