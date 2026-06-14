export function fmtPrice(price: number): string {
  if (price >= 1000) {
    return price.toLocaleString("en-US", { maximumFractionDigits: 2 });
  }
  if (price >= 1) {
    return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  }
  return price.toLocaleString("en-US", { maximumFractionDigits: 6 });
}

export function fmtPriceUsd(price: number): string {
  return `$${fmtPrice(price)}`;
}

export function fmtSignedPct(value: number): string {
  const sign = value > 0 ? "+" : value < 0 ? "" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function fmtCompactUsd(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  return fmtPriceUsd(value);
}

export function fmtCompactQty(value: number): string {
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

export function freshnessLabel(score: number): string {
  if (score >= 75) return "Yüksek";
  if (score >= 45) return "Orta";
  return "Düşük";
}

export function minutesAgoLabel(minutes: number): string {
  if (minutes < 60) return `${minutes} dk önce`;
  const h = Math.floor(minutes / 60);
  if (h < 24) return `${h} sa önce`;
  return `${Math.floor(h / 24)} gün önce`;
}

export function fmtFundingRate(pct: number): string {
  const sign = pct > 0 ? "+" : pct < 0 ? "" : "";
  return `${sign}${pct.toFixed(4)}%`;
}

export function fmtFundingCountdown(nextFundingTime: number, nowMs: number): string {
  const diff = Math.max(0, nextFundingTime - nowMs);
  const totalMinutes = Math.floor(diff / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours <= 0) return `${minutes} dk`;
  return `${hours}s ${minutes}dk`;
}
