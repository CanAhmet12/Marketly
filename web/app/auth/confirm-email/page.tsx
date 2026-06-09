import type { Metadata } from "next";
import { Suspense } from "react";

import { DelayedSkeleton } from "@/components/states/delayed-skeleton";
import { AuthFormSkeleton } from "@/features/auth/components/auth-states";
import { OG_SITE_DEFAULTS, siteCanonical } from "@/lib/seo/metadata-helpers";

import { ConfirmEmailClient } from "./confirm-email-client";

export const metadata: Metadata = {
  ...siteCanonical("/auth/confirm-email"),
  title: "E-posta Doğrulama — Marketly",
  description: "Hesabını etkinleştirmek için e-postanı doğrula.",
  robots: { index: false, follow: true },
  openGraph: {
    ...OG_SITE_DEFAULTS,
    title: "E-posta Doğrulama — Marketly",
    description: "Hesabını etkinleştirmek için e-postanı doğrula.",
  },
};

export default function ConfirmEmailPage() {
  return (
    <Suspense
      fallback={
        <DelayedSkeleton>
          <AuthFormSkeleton />
        </DelayedSkeleton>
      }
    >
      <ConfirmEmailClient />
    </Suspense>
  );
}
