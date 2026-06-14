"use client";

import Link from "next/link";

import { useMarketAssetsLive } from "@/features/markets/hooks/use-market-assets";
import { marketSymbolPath } from "@/features/markets/markets-routes";
import { isMockDataEnabled } from "@/mock/config";
import { cn } from "@/lib/cn";

type Props = {
  assetTag: string;
};

export function PostDetailAssetChip({ assetTag }: Props) {
  const clean = assetTag.replace(/^#/, "").trim().toUpperCase();
  const { assets } = useMarketAssetsLive();
  const mockOn = isMockDataEnabled();
  const live = !mockOn ? assets.find((a) => a.symbol.toUpperCase() === clean) : null;

  return (
    <Link
      href={live ? marketSymbolPath(clean) : `/results?q=${encodeURIComponent(clean)}`}
      className={cn(
        "pd-asset-chip",
        live?.trend === "up" && "pd-asset-chip--up",
        live?.trend === "down" && "pd-asset-chip--down",
      )}
    >
      {live ? (
        <>
          <span aria-hidden>{live.trend === "up" ? "▲" : live.trend === "down" ? "▼" : "—"}</span>
          <span>{clean}</span>
          <span className="pd-asset-chip-pct">
            {live.change_percent >= 0 ? "+" : ""}
            {live.change_percent.toFixed(2).replace(".", ",")}%
          </span>
        </>
      ) : (
        <>#{clean}</>
      )}
    </Link>
  );
}
