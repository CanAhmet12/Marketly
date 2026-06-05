import { MOCK_TREND_MARKETS } from "../fixtures/markets";

export type MarketPulseChip = { label: string; href: string };

/** Keşfet üst şerit — fiyat + yüzde ile yoğun görünüm */
export function getMockMarketPulseChips(): MarketPulseChip[] {
  return MOCK_TREND_MARKETS.map((m) => {
    const sign = m.change_percent >= 0 ? "+" : "";
    return {
      label: `${m.symbol} ${sign}${m.change_percent.toFixed(1)}%`,
      href: "/markets",
    };
  });
}
