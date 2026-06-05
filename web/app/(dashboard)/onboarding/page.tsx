import type { Metadata } from "next";
import { Suspense } from "react";

import { OnboardingWizardClient } from "@/features/onboarding/onboarding-wizard-client";
import { OnboardingPageSkeleton } from "@/features/studio/components/studio-states";
import { OG_SITE_DEFAULTS, siteCanonical } from "@/lib/seo/metadata-helpers";

export const metadata: Metadata = {
  ...siteCanonical("/onboarding"),
  title: "Başlangıç Rehberi — Marketly",
  description: "İlgi profili ve kişiselleştirme sihirbazı.",
  robots: { index: false, follow: true },
  openGraph: {
    ...OG_SITE_DEFAULTS,
    title: "Başlangıç Rehberi — Marketly",
    description: "İlgi profili ve kişiselleştirme sihirbazı.",
  },
};

export default function OnboardingPage() {
  return (
    <div className="min-h-0 w-full max-w-[720px]">
      <h1 className="sr-only">Başlangıç rehberi</h1>
      <Suspense fallback={<OnboardingPageSkeleton />}>
        <OnboardingWizardClient />
      </Suspense>
    </div>
  );
}
