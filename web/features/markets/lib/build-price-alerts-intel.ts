import type { PriceAlertRow } from "@/features/markets/hooks/use-price-alerts-page";

export type PriceAlertsIntel = {
  symbolCount: number;
  totalCount: number;
  aboveCount: number;
  belowCount: number;
  headline: string;
  symbolChips: { symbol: string; count: number; href: string }[];
  recentAlerts: PriceAlertRow[];
  bySymbol: { symbol: string; count: number }[];
};

function inferCondition(label: string): "above" | "below" {
  if (label.includes("≤") || label.toLowerCase().includes("alt")) return "below";
  return "above";
}

export function buildPriceAlertsIntel(
  grouped: { symbol: string; alerts: PriceAlertRow[] }[],
  rows: PriceAlertRow[],
): PriceAlertsIntel {
  let aboveCount = 0;
  let belowCount = 0;

  for (const row of rows) {
    const cond = row.condition ?? inferCondition(row.label);
    if (cond === "below") belowCount++;
    else aboveCount++;
  }

  const symbolCount = grouped.length;
  const totalCount = rows.length;

  const bySymbol = grouped
    .map((g) => ({ symbol: g.symbol, count: g.alerts.length }))
    .sort((a, b) => b.count - a.count);

  const symbolChips = bySymbol.slice(0, 8).map((s) => ({
    symbol: s.symbol,
    count: s.count,
    href: `/markets/${encodeURIComponent(s.symbol)}`,
  }));

  const recentAlerts = [...rows]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const headline =
    totalCount === 0
      ? "Henüz aktif alarm yok — varlık sayfasından eşik ekleyin."
      : `${symbolCount} sembolde ${totalCount} aktif eşik izleniyor.`;

  return {
    symbolCount,
    totalCount,
    aboveCount,
    belowCount,
    headline,
    symbolChips,
    recentAlerts,
    bySymbol,
  };
}
