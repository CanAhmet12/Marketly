"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { hasWelcomeSeen } from "@/features/welcome/welcome-storage";

const BYPASS_PREFIXES = ["/welcome", "/auth", "/onboarding"];

/** İlk ziyaret — dashboard'a girmeden önce welcome story */
export function FirstVisitGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const redirected = useRef(false);

  useEffect(() => {
    if (redirected.current) return;
    if (hasWelcomeSeen()) return;
    if (!pathname) return;
    if (BYPASS_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return;

    redirected.current = true;
    const next = pathname === "/" ? "" : `?next=${encodeURIComponent(pathname)}`;
    router.replace(`/welcome${next}`);
  }, [pathname, router]);

  return <>{children}</>;
}
