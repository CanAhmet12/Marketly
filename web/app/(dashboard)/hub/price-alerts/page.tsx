import { Suspense } from "react";

import { DelayedSkeleton } from "@/components/states/delayed-skeleton";
import { PriceAlertsPageClient } from "@/features/markets/price-alerts-page-client";
import { PriceAlertsPageSkeleton } from "@/features/markets/components/markets-states";

export default function HubPriceAlertsPage() {
  return (
    <Suspense
      fallback={
        <DelayedSkeleton>
          <PriceAlertsPageSkeleton />
        </DelayedSkeleton>
      }
    >
      <PriceAlertsPageClient />
    </Suspense>
  );
}
