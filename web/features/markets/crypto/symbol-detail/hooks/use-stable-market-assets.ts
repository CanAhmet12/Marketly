"use client";

import { useMemo, useRef } from "react";

import { useMarketAssetsLive } from "@/features/markets/hooks/use-market-assets";
import type { MarketAssetView } from "@/features/markets/types";

function assetSignature(assets: readonly MarketAssetView[]): string {
  return assets
    .map((a) => `${a.symbol}:${a.price}:${a.change_percent}:${a.volume}`)
    .join("|");
}

/** React Query yeni dizi referansı verse bile içerik aynıysa referansı korur. */
export function useStableMarketAssets(): MarketAssetView[] {
  const { assets } = useMarketAssetsLive();
  const cacheRef = useRef<MarketAssetView[]>([]);
  const sigRef = useRef("");

  return useMemo(() => {
    const sig = assetSignature(assets);
    if (sig === sigRef.current && cacheRef.current.length > 0) return cacheRef.current;
    sigRef.current = sig;
    cacheRef.current = assets;
    return assets;
  }, [assets]);
}
