import type { Metadata } from "next";
import { Suspense } from "react";

import { DelayedSkeleton } from "@/components/states/delayed-skeleton";
import { AuthFormSkeleton } from "@/features/auth/components/auth-states";
import { OG_SITE_DEFAULTS, siteCanonical } from "@/lib/seo/metadata-helpers";

import { UpdatePasswordForm } from "./update-password-form";

export const metadata: Metadata = {
  ...siteCanonical("/auth/update-password"),
  title: "Şifre Güncelle — Marketly",
  description: "Yeni şifrenizi belirleyin.",
  robots: { index: false, follow: true },
  openGraph: {
    ...OG_SITE_DEFAULTS,
    title: "Şifre Güncelle — Marketly",
    description: "Yeni şifrenizi belirleyin.",
  },
};

export default function UpdatePasswordPage() {
  return (
    <Suspense
      fallback={
        <DelayedSkeleton>
          <AuthFormSkeleton />
        </DelayedSkeleton>
      }
    >
      <UpdatePasswordForm />
    </Suspense>
  );
}
