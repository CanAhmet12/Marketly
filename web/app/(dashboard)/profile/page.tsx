import { Suspense } from "react";

import { DelayedSkeleton } from "@/components/states/delayed-skeleton";
import { ChannelSkeleton } from "@/features/channel/channel-page-parts";
import { ProfileEntryClient } from "@/features/profile/profile-entry-client";

export default function ProfileEntryPage() {
  return (
    <Suspense
      fallback={
        <DelayedSkeleton>
          <ChannelSkeleton />
        </DelayedSkeleton>
      }
    >
      <ProfileEntryClient />
    </Suspense>
  );
}
