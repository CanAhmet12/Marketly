export type OrderBookDecimalPreset = "auto" | "0.01" | "0.001" | "0.0001";

export const ORDERBOOK_DECIMAL_OPTIONS: { id: OrderBookDecimalPreset; label: string }[] = [
  { id: "auto", label: "Oto" },
  { id: "0.01", label: "0.01" },
  { id: "0.001", label: "0.001" },
  { id: "0.0001", label: "0.0001" },
];

function decimalPlaces(preset: OrderBookDecimalPreset): number | null {
  if (preset === "auto") return null;
  if (preset === "0.01") return 2;
  if (preset === "0.001") return 3;
  return 4;
}

export function fmtBookPrice(price: number, preset: OrderBookDecimalPreset): string {
  const places = decimalPlaces(preset);
  if (places == null) {
    if (price >= 1000) {
      return `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (price >= 1) return `$${price.toFixed(2)}`;
    if (price >= 0.01) return `$${price.toFixed(4)}`;
    return `$${price.toFixed(6)}`;
  }
  return `$${price.toFixed(places)}`;
}
