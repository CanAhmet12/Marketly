import type { Metadata } from "next";
import { Suspense } from "react";

import { DelayedSkeleton } from "@/components/states/delayed-skeleton";
import { StudioPageSkeleton } from "@/features/studio/components/studio-states";
import { StudioScheduledClient } from "@/features/studio/studio-scheduled-client";

export const metadata: Metadata = {
  title: "Zamanlanmış",
  description: "Yayın takvimi ve zamanlanmış içerikler.",
};

export default function StudioScheduledPage() {
  return (
    <Suspense
      fallback={
        <DelayedSkeleton>
          <StudioPageSkeleton />
        </DelayedSkeleton>
      }
    >
      <StudioScheduledClient />
    </Suspense>
  );
}
