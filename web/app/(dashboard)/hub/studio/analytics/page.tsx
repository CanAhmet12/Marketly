import type { Metadata } from "next";
import { Suspense } from "react";

import { DelayedSkeleton } from "@/components/states/delayed-skeleton";
import { StudioPageSkeleton } from "@/features/studio/components/studio-states";
import { StudioAnalyticsClient } from "@/features/studio/studio-analytics-client";

export const metadata: Metadata = {
  title: "Analitik",
  description: "İzlenme, etkileşim ve kitle metrikleri.",
};

export default function HubStudioAnalyticsPage() {
  return (
    <Suspense
      fallback={
        <DelayedSkeleton>
          <StudioPageSkeleton />
        </DelayedSkeleton>
      }
    >
      <StudioAnalyticsClient />
    </Suspense>
  );
}
