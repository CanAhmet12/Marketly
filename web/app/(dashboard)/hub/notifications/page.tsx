import { Suspense } from "react";

import { NotificationsPageClient } from "@/features/social/notifications-page-client";
import { NotificationsPageSkeleton } from "@/features/social/components/social-states";

export default function HubNotificationsPage() {
  return (
    <Suspense fallback={<NotificationsPageSkeleton />}>
      <NotificationsPageClient />
    </Suspense>
  );
}
