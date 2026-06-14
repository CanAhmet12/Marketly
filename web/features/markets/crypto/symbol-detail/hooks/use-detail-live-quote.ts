"use client";

import { useEffect, useRef, useState } from "react";

import type { AssetIntelligenceBundle } from "@/features/markets/types/asset-intelligence";
import type { MarketAssetView } from "@/features/markets/types";

export type LiveQuoteFlash = "up" | "down" | null;

function flashThreshold(price: number): number {
  if (price >= 1000) return 0.5;
  if (price >= 1) return 0.001;
  return price * 0.0002;
}

export function useDetailLiveQuote(
  bundle: AssetIntelligenceBundle,
  liveAsset?: MarketAssetView | null,
) {
  const base = bundle.asset;
  const price = liveAsset?.price ?? base.price;
  const change = liveAsset?.change_percent ?? base.change_percent;
  const spark =
    liveAsset?.sparkline?.length ? liveAsset.sparkline : base.sparkline?.length ? base.sparkline : undefined;

  const prevRef = useRef(price);
  const primedRef = useRef(false);
  const [flash, setFlash] = useState<LiveQuoteFlash>(null);

  useEffect(() => {
    if (!primedRef.current) {
      primedRef.current = true;
      prevRef.current = price;
      return;
    }

    const delta = Math.abs(price - prevRef.current);
    if (delta < flashThreshold(price)) return;

    setFlash(price > prevRef.current ? "up" : "down");
    prevRef.current = price;
    const id = window.setTimeout(() => setFlash(null), 720);
    return () => window.clearTimeout(id);
  }, [price]);

  return {
    price,
    change,
    spark,
    flash,
    isUp: change >= 0,
  };
}
