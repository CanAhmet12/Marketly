import { AppShell } from "@/components/layout/app-shell";
import { FirstVisitGuard } from "@/features/welcome/first-visit-guard";
import { OnboardingSetupGuard } from "@/features/onboarding/onboarding-setup-guard";
import type { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <FirstVisitGuard>
      <OnboardingSetupGuard>
        <AppShell>{children}</AppShell>
      </OnboardingSetupGuard>
    </FirstVisitGuard>
  );
}
