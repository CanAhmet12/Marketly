import { Suspense } from "react";

import { DelayedSkeleton } from "@/components/states/delayed-skeleton";
import { MessagesPageClientLazy } from "@/lib/lazy/dynamic-route-clients";
import { MessagesPageSkeleton } from "@/features/social/components/social-states";

export default function HubMessagesPage() {
  return (
    <Suspense
      fallback={
        <DelayedSkeleton>
          <MessagesPageSkeleton />
        </DelayedSkeleton>
      }
    >
      <MessagesPageClientLazy />
    </Suspense>
  );
}
