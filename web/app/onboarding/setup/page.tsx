import type { Metadata } from "next";
import { Suspense } from "react";

import { OnboardingSetupClient } from "@/features/onboarding/onboarding-setup-client";
import { OnboardingPageSkeleton } from "@/features/studio/components/studio-states";

export const metadata: Metadata = {
  title: "Kurulum",
  robots: { index: false, follow: false },
};

export default function OnboardingSetupPage() {
  return (
    <Suspense fallback={<OnboardingPageSkeleton />}>
      <OnboardingSetupClient />
    </Suspense>
  );
}
