import type { Metadata } from "next";
import { Suspense } from "react";

import { NotificationsPageClient } from "@/features/social/notifications-page-client";
import { NotificationsPageSkeleton } from "@/features/social/components/social-states";
import { OG_SITE_DEFAULTS, siteCanonical } from "@/lib/seo/metadata-helpers";

export const metadata: Metadata = {
  ...siteCanonical("/notifications"),
  title: "Bildirimler — Marketly",
  description: "Portföy, takip ve premium bildirim akışı.",
  openGraph: {
    ...OG_SITE_DEFAULTS,
    title: "Bildirimler — Marketly",
    description: "Portföy, takip ve premium bildirim akışı.",
  },
};

export default function NotificationsPage() {
  return (
    <Suspense fallback={<NotificationsPageSkeleton />}>
      <NotificationsPageClient />
    </Suspense>
  );
}
