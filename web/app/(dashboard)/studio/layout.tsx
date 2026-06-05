import type { Metadata } from "next";
import type { ReactNode } from "react";

import { RequireAuth } from "@/features/auth/require-auth";
import { StudioLayoutClient } from "@/features/studio/studio-layout-client";
import { OG_SITE_DEFAULTS, siteCanonical } from "@/lib/seo/metadata-helpers";

import "@/styles/route-groups/studio.css";

export const metadata: Metadata = {
  ...siteCanonical("/studio"),
  title: { template: "%s — Marketly Studio", default: "Creator Studio — Marketly" },
  description: "İçerik, analitik ve creator ekonomisi yönetimi.",
  robots: { index: false, follow: true },
  openGraph: {
    ...OG_SITE_DEFAULTS,
    title: "Creator Studio — Marketly",
    description: "İçerik, analitik ve creator ekonomisi yönetimi.",
  },
};

export default function StudioLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth loginHref="/auth/login">
      <StudioLayoutClient>{children}</StudioLayoutClient>
    </RequireAuth>
  );
}
