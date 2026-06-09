import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthFormSkeleton } from "@/features/auth/components/auth-states";
import { RedirectIfAuthenticated } from "@/features/auth/redirect-if-authenticated";
import { OG_SITE_DEFAULTS, siteCanonical } from "@/lib/seo/metadata-helpers";

import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  ...siteCanonical("/auth/register"),
  title: "Kayıt Ol — Marketly",
  description: "Yeni Marketly hesabı oluşturun.",
  robots: { index: false, follow: true },
  openGraph: {
    ...OG_SITE_DEFAULTS,
    title: "Kayıt Ol — Marketly",
    description: "Yeni Marketly hesabı oluşturun.",
  },
};

export default function RegisterPage() {
  return (
    <Suspense fallback={<AuthFormSkeleton />}>
      <RedirectIfAuthenticated fallbackHref="/onboarding/setup">
        <RegisterForm />
      </RedirectIfAuthenticated>
    </Suspense>
  );
}
