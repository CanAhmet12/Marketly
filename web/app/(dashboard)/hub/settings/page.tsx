import { Suspense } from "react";

import { SettingsPageClient } from "@/features/social/settings-page-client";
import { SettingsPageSkeleton } from "@/features/social/components/social-states";

export default function HubSettingsPage() {
  return (
    <Suspense fallback={<SettingsPageSkeleton />}>
      <SettingsPageClient />
    </Suspense>
  );
}
