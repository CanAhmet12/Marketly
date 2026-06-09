import { Suspense } from "react";

import { CloseFriendsPageClient } from "@/features/social/close-friends-page-client";
import { CloseFriendsPageSkeleton } from "@/features/social/components/social-states";

export default function HubCloseFriendsPage() {
  return (
    <Suspense fallback={<CloseFriendsPageSkeleton />}>
      <CloseFriendsPageClient />
    </Suspense>
  );
}
