import { getMockAssetIntelligenceBundle } from "@/mock/adapters/asset-intelligence";
import { isMockDataEnabled } from "@/mock/config";

import type { AssetIntelligenceBundle } from "@/features/markets/types/asset-intelligence";

import { mergeMockAssetIntelligenceGaps } from "./merge-mock-asset-intelligence-gaps";

/** Tam mock modu dışında, canlı bundle'daki boş katmanları mock ile doldur. */
export function fillAssetIntelligenceGaps(
  live: AssetIntelligenceBundle,
): AssetIntelligenceBundle {
  if (isMockDataEnabled()) return live;

  const mock = getMockAssetIntelligenceBundle(live.asset.symbol);
  if (!mock) return live;

  return mergeMockAssetIntelligenceGaps(live, mock);
}
