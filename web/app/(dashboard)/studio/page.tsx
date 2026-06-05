import type { Metadata } from "next";
import { Suspense } from "react";

import { DelayedSkeleton } from "@/components/states/delayed-skeleton";
import { StudioPageSkeleton } from "@/features/studio/components/studio-states";
import { StudioDashboardClient } from "@/features/studio/studio-dashboard-client";

export const metadata: Metadata = {
  title: "Genel Bakış",
  description: "Creator dashboard, performans özeti ve hızlı aksiyonlar.",
};

export default function StudioDashboardPage() {
  return (
    <Suspense
      fallback={
        <DelayedSkeleton>
          <StudioPageSkeleton />
        </DelayedSkeleton>
      }
    >
      <StudioDashboardClient />
    </Suspense>
  );
}
