"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { useAuth } from "@/features/auth/use-auth";
import { readOnboardingDoneLocal } from "@/features/onboarding/lib/onboarding-storage";
import { isMockDataEnabled } from "@/mock/config";

const BYPASS_PREFIXES = ["/onboarding", "/welcome", "/auth"];

const SS_ONBOARDING_DISMISSED = "marketly-onboarding-dismissed-v1";

function isBypassPath(pathname: string): boolean {
  return BYPASS_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/**
 * Kurulum tamamlanmamışsa /onboarding/setup'a yönlendirir.
 * Profil yüklenene kadar bekler — oturum varken "giriş yap" döngüsü önlenir.
 */
export function OnboardingSetupGuard({ children }: { children: React.ReactNode }) {
  const { user, session, isInitialized, onboardingComplete } = useAuth();
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const redirected = useRef(false);

  useEffect(() => {
    if (!isInitialized) return;
    if (isBypassPath(pathname)) return;

    const hasSession = Boolean(session?.user?.id);
    const hasUser = Boolean(user?.id);

    if (hasSession && !hasUser) return;

    if (!hasUser) return;

    if (onboardingComplete || readOnboardingDoneLocal()) return;

    if (isMockDataEnabled()) {
      void import("@/features/onboarding/repository").then(({ getOnboardingRepository }) => {
        if (!getOnboardingRepository().needsOnboarding()) return;
        if (redirected.current) return;
        redirected.current = true;
        router.replace("/onboarding/setup");
      });
      return;
    }

    try {
      if (sessionStorage.getItem(SS_ONBOARDING_DISMISSED) === "1") return;
    } catch {
      /* ignore */
    }

    if (redirected.current) return;
    redirected.current = true;
    router.replace("/onboarding/setup");
  }, [isInitialized, user?.id, session?.user?.id, onboardingComplete, pathname, router]);

  return <>{children}</>;
}

/** Kullanıcı kurulumu bu oturumda atlamak istediğinde çağrılır. */
export function dismissOnboardingPromptForSession(): void {
  try {
    sessionStorage.setItem(SS_ONBOARDING_DISMISSED, "1");
  } catch {
    /* ignore */
  }
}
