/** Kripto detay accent — kategori sayfası anchor renkleri ile hizalı */
export function cryptoSymbolAccent(symbol: string): string {
  const s = symbol.trim().toUpperCase();
  if (s === "BTC") return "#f59e0b";
  if (s === "ETH") return "#a78bfa";
  if (s === "SOL") return "#14f195";
  if (s === "BNB") return "#f3ba2f";
  if (s === "XRP") return "#38bdf8";
  if (s === "DOGE") return "#eab308";
  if (s === "ADA") return "#3b82f6";
  return "#f59e0b";
}

export function cryptoSymbolAccentClass(symbol: string): string {
  const s = symbol.trim().toUpperCase();
  if (s === "BTC") return "cc-symbol-accent--btc";
  if (s === "ETH") return "cc-symbol-accent--eth";
  if (s === "SOL") return "cc-symbol-accent--sol";
  return "cc-symbol-accent--default";
}
