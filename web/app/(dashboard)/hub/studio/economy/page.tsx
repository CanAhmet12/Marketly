import type { Metadata } from "next";
import { Suspense } from "react";

import { DelayedSkeleton } from "@/components/states/delayed-skeleton";
import { StudioPageSkeleton } from "@/features/studio/components/studio-states";
import { StudioEconomyHubClient } from "@/features/studio/studio-economy-hub-client";

export const metadata: Metadata = {
  title: "Ekonomi",
  description: "Gelir, abonelik ve creator ekonomisi özeti.",
};

export default function HubStudioEconomyPage() {
  return (
    <Suspense
      fallback={
        <DelayedSkeleton>
          <StudioPageSkeleton />
        </DelayedSkeleton>
      }
    >
      <StudioEconomyHubClient />
    </Suspense>
  );
}
