import type { Metadata } from "next";
import type { ReactNode } from "react";

import { RequireAuth } from "@/features/auth/require-auth";
import { HubLayoutClient } from "@/features/hub/hub-layout-client";
import { OG_SITE_DEFAULTS, siteCanonical } from "@/lib/seo/metadata-helpers";

import "@/styles/route-groups/hub.css";

export const metadata: Metadata = {
  ...siteCanonical("/hub"),
  title: { template: "%s — Kanalım", default: "Kanalım — Marketly" },
  description: "Kişisel yönetim merkezi — portföy, mesajlar, kayıtlar ve kanalınız.",
  robots: { index: false, follow: true },
  openGraph: {
    ...OG_SITE_DEFAULTS,
    title: "Kanalım — Marketly",
    description: "Kişisel yönetim merkezi — portföy, mesajlar, kayıtlar ve kanalınız.",
  },
};

export default function HubLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth loginHref="/auth/login?next=/hub/profile">
      <HubLayoutClient>{children}</HubLayoutClient>
    </RequireAuth>
  );
}
