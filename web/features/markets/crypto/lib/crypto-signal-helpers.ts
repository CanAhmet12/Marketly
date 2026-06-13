import type { CryptoSignalAsset } from "@/features/markets/crypto/types";

export function cryptoSignalDirection(asset: CryptoSignalAsset): "BUY" | "SELL" | "HOLD" {
  if (asset.dominantDirection) return asset.dominantDirection;
  if (asset.bullPct >= 55) return "BUY";
  if (asset.bullPct <= 45) return "SELL";
  return "HOLD";
}

export function cryptoSignalConfidence(asset: CryptoSignalAsset): number {
  if (asset.avgConfidence != null) return asset.avgConfidence;
  return Math.min(92, Math.max(38, Math.round(48 + Math.abs(asset.bullPct - 50) * 0.9)));
}
