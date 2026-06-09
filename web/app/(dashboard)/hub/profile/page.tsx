import { Suspense } from "react";

import { DelayedSkeleton } from "@/components/states/delayed-skeleton";
import { HubProfileClient } from "@/features/hub/hub-profile-client";
import { ChannelSkeleton } from "@/features/channel/channel-page-parts";

export default function HubProfilePage() {
  return (
    <Suspense
      fallback={
        <DelayedSkeleton>
          <ChannelSkeleton />
        </DelayedSkeleton>
      }
    >
      <HubProfileClient />
    </Suspense>
  );
}
