"use client";

import { useEffect, useMemo, useState } from "react";

import { buildCryptoDetailStats } from "@/features/markets/crypto/detail/lib/build-crypto-detail-stats";
import type { CryptoCoinMeta, CryptoDetailStatsPayload } from "@/features/markets/crypto/detail/lib/crypto-detail-stats-types";
import type { AssetSignalSummary } from "@/features/markets/types/asset-intelligence";
import type { MarketAssetView } from "@/features/markets/types";

type Args = {
  asset: MarketAssetView;
  allAssets: readonly MarketAssetView[];
  signalSummary?: AssetSignalSummary;
};

async function fetchCryptoMeta(asset: MarketAssetView): Promise<CryptoCoinMeta> {
  const spark = asset.sparkline ?? [];
  const sparkMax = spark.length > 1 ? Math.max(...spark) : 0;
  const params = new URLSearchParams({
    symbol: asset.symbol,
    price: String(asset.price),
    sparkMax: String(sparkMax),
  });
  const res = await fetch(`/api/markets/crypto-meta?${params.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("meta_fetch_failed");
  return res.json() as Promise<CryptoCoinMeta>;
}

export function useCryptoDetailStats({ asset, allAssets, signalSummary }: Args): {
  payload: CryptoDetailStatsPayload;
  isLoading: boolean;
} {
  const [meta, setMeta] = useState<CryptoCoinMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    fetchCryptoMeta(asset)
      .then((data) => {
        if (!cancelled) setMeta(data);
      })
      .catch(() => {
        if (!cancelled) setMeta(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [asset.symbol, asset.price, asset.sparkline]);

  const payload = useMemo(
    () => buildCryptoDetailStats({ asset, allAssets, meta, signalSummary }),
    [asset, allAssets, meta, signalSummary],
  );

  return { payload, isLoading };
}
