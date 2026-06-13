import type { CryptoScreenerAsset, CryptoTreemapCell } from "@/features/markets/crypto/types";

export function parseMarketCapLabel(raw: string): number {
  const cleaned = raw.replace(/,/g, "").trim();
  const n = parseFloat(cleaned.replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(n)) return 0;
  const upper = cleaned.toUpperCase();
  if (upper.includes("T")) return n * 1e12;
  if (upper.includes("B")) return n * 1e9;
  if (upper.includes("M")) return n * 1e6;
  if (upper.includes("K")) return n * 1e3;
  return n;
}

export function buildCryptoTreemapCells(
  assets: readonly CryptoScreenerAsset[],
  limit = 10,
): CryptoTreemapCell[] {
  const sorted = [...assets]
    .sort((a, b) => parseMarketCapLabel(b.marketCap) - parseMarketCapLabel(a.marketCap))
    .slice(0, limit);
  const total = sorted.reduce((sum, asset) => sum + parseMarketCapLabel(asset.marketCap), 0) || 1;

  return sorted.map((asset, index) => ({
    rank: index + 1,
    symbol: asset.symbol,
    name: asset.name,
    weightPct: (parseMarketCapLabel(asset.marketCap) / total) * 100,
    change24h: asset.change24h,
    marketCap: asset.marketCap,
    sparkline: asset.sparkline.length >= 2 ? asset.sparkline : [50, 50],
  }));
}
