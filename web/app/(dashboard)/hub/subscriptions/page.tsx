import { Suspense } from "react";

import { SubscriptionsHubClient } from "@/features/subscriptions/subscriptions-hub-client";
import { SubscriptionsPageSkeleton } from "@/features/social/components/social-states";

export default function HubSubscriptionsPage() {
  return (
    <Suspense fallback={<SubscriptionsPageSkeleton />}>
      <SubscriptionsHubClient />
    </Suspense>
  );
}
