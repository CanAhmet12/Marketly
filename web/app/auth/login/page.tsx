import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthFormSkeleton } from "@/features/auth/components/auth-states";
import { OG_SITE_DEFAULTS, siteCanonical } from "@/lib/seo/metadata-helpers";

import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  ...siteCanonical("/auth/login"),
  title: "Giriş — Marketly",
  description: "Marketly hesabınıza giriş yapın.",
  robots: { index: false, follow: true },
  openGraph: {
    ...OG_SITE_DEFAULTS,
    title: "Giriş — Marketly",
    description: "Marketly hesabınıza giriş yapın.",
  },
};

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthFormSkeleton />}>
      <LoginForm />
    </Suspense>
  );
}
