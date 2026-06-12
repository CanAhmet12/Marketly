import { SIGNAL_MARKET_CATEGORY_IDS } from "@/features/signals/lib/signal-market-sections";
import type { SignalsFeedRow } from "@/features/signals/repository/types";
import type { MarketAssetCategory } from "@/features/markets/types";
import { inferMarketAssetCategory, normalizeAssetCategory } from "@/lib/market-category";

const VALID = new Set<MarketAssetCategory>(SIGNAL_MARKET_CATEGORY_IDS);

/** Katalog satırı için güvenilir piyasa segmenti — sembol öncelikli */
export function resolveSignalAssetCategory(row: Pick<SignalsFeedRow, "symbol" | "assetCategory">): MarketAssetCategory {
  const inferred = inferMarketAssetCategory(row.symbol);
  const stored = normalizeAssetCategory(row.assetCategory) ?? row.assetCategory;

  if (!stored || !VALID.has(stored)) return inferred;
  if (stored === inferred) return inferred;

  // Yanlış kayıtlı kategori (ör. hisse → crypto) — sembol çıkarımına güven
  return inferred;
}
