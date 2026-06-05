import { Suspense } from "react";

import { AssetDetailSkeleton } from "@/features/markets/components/markets-states";
import { MarketSymbolPageClient } from "@/features/markets/market-symbol-page-client";

export default function MarketSymbolPage() {
  return (
    <Suspense fallback={<AssetDetailSkeleton />}>
      <MarketSymbolPageClient />
    </Suspense>
  );
}
