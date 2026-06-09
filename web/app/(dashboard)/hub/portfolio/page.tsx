import { Suspense } from "react";

import { PortfolioPageClient } from "@/features/markets/portfolio-page-client";
import { PortfolioPageSkeleton } from "@/features/markets/components/markets-states";

export default function HubPortfolioPage() {
  return (
    <Suspense fallback={<PortfolioPageSkeleton />}>
      <PortfolioPageClient />
    </Suspense>
  );
}
