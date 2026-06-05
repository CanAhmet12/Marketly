import type { EconomicCalendarIntelEvent } from "@/features/markets/types/news-calendar-intelligence";

export function economicCalendarEventHref(id: string): string {
  return `/economic-calendar/${encodeURIComponent(id)}`;
}

export function formatEventTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("tr-TR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function impactLabel(impact: 1 | 2 | 3): string {
  if (impact === 3) return "Yüksek etki";
  if (impact === 2) return "Orta etki";
  return "Düşük etki";
}

export function eventIntelBullets(ev: EconomicCalendarIntelEvent): string[] {
  return [ev.consensusExpectation, ev.positioningLabel, ev.volatilityExpectation].filter(Boolean);
}
