import type { Metadata } from "next";
import { Suspense } from "react";

import { RequireAuth } from "@/features/auth/require-auth";
import { SettingsPageClient } from "@/features/social/settings-page-client";
import { SettingsPageSkeleton } from "@/features/social/components/social-states";
import { OG_SITE_DEFAULTS, siteCanonical } from "@/lib/seo/metadata-helpers";

export const metadata: Metadata = {
  ...siteCanonical("/settings"),
  title: "Ayarlar — Marketly",
  description: "Hesap, bildirim, gizlilik ve kişiselleştirme tercihleri.",
  openGraph: {
    ...OG_SITE_DEFAULTS,
    title: "Ayarlar — Marketly",
    description: "Hesap, bildirim, gizlilik ve kişiselleştirme tercihleri.",
  },
};

export default function SettingsPage() {
  return (
    <RequireAuth loginHref="/auth/login">
      <Suspense fallback={<SettingsPageSkeleton />}>
        <SettingsPageClient />
      </Suspense>
    </RequireAuth>
  );
}
