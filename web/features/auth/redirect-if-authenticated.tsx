"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { useAuth } from "@/features/auth/use-auth";
import { safeInternalNextPath } from "@/lib/auth/safe-next-path";

type Props = {
  children: ReactNode;
  /** next yoksa varsayılan hedef */
  fallbackHref?: string;
};

/**
 * Login / register sayfalarında zaten oturum açıksa güvenli `next` ile yönlendirir.
 */
export function RedirectIfAuthenticated({ children, fallbackHref = "/" }: Props) {
  const { user, isInitialized } = useAuth();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isInitialized || !user) return;
    const explicit = searchParams.get("next");
    const target = explicit ? safeInternalNextPath(explicit) : fallbackHref;
    window.location.href = target;
  }, [isInitialized, user, searchParams, fallbackHref]);

  if (!isInitialized) {
    return (
      <div className="auth-form-panel auth-status-panel" aria-busy="true">
        <p className="auth-form-panel__subtitle">Oturum kontrol ediliyor…</p>
      </div>
    );
  }

  if (user) {
    return (
      <div className="auth-form-panel auth-status-panel" aria-busy="true">
        <p className="auth-form-panel__subtitle">Yönlendiriliyorsun…</p>
      </div>
    );
  }

  return <>{children}</>;
}
