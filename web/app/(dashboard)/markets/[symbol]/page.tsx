import { Suspense } from "react";

import { AssetDetailSkeleton } from "@/features/markets/components/markets-states";
import { CryptoAssetDetailSkeleton } from "@/features/markets/crypto/detail/components/crypto-asset-detail-skeleton";
import { MarketSymbolPageClient } from "@/features/markets/market-symbol-page-client";
import { inferMarketAssetCategory } from "@/lib/market-category";

type Props = {
  params: Promise<{ symbol: string }>;
};

function decodeSymbolParam(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function resolveSymbolDetailSkeleton(symbol: string) {
  if (inferMarketAssetCategory(symbol) === "crypto") {
    return <CryptoAssetDetailSkeleton />;
  }
  return <AssetDetailSkeleton />;
}

export default async function MarketSymbolPage({ params }: Props) {
  const { symbol } = await params;
  const decoded = decodeSymbolParam(symbol);
  const fallback = resolveSymbolDetailSkeleton(decoded);

  return (
    <Suspense fallback={fallback}>
      <MarketSymbolPageClient />
    </Suspense>
  );
}
