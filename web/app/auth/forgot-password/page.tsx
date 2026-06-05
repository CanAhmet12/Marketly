import type { Metadata } from "next";
import { Suspense } from "react";

import { DelayedSkeleton } from "@/components/states/delayed-skeleton";
import { AuthFormSkeleton } from "@/features/auth/components/auth-states";
import { OG_SITE_DEFAULTS, siteCanonical } from "@/lib/seo/metadata-helpers";

import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = {
  ...siteCanonical("/auth/forgot-password"),
  title: "Şifremi Unuttum — Marketly",
  description: "Şifre sıfırlama bağlantısı isteyin.",
  robots: { index: false, follow: true },
  openGraph: {
    ...OG_SITE_DEFAULTS,
    title: "Şifremi Unuttum — Marketly",
    description: "Şifre sıfırlama bağlantısı isteyin.",
  },
};

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <DelayedSkeleton>
          <AuthFormSkeleton />
        </DelayedSkeleton>
      }
    >
      <ForgotPasswordForm />
    </Suspense>
  );
}
