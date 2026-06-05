import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthFormSkeleton } from "@/features/auth/components/auth-states";
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
      <RegisterForm />
    </Suspense>
  );
}
