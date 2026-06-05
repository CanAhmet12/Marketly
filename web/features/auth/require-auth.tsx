"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { RequireAuthSkeleton } from "@/features/studio/components/studio-states";
import { useAuth } from "@/features/auth/use-auth";
import { safeInternalNextPath } from "@/lib/auth/safe-next-path";

type Props = {
  children: ReactNode;
  /** Giriş yapılmadığında yönlendirilecek sayfa */
  loginHref?: string;
};

/**
 * İstemci tarafı koruma — proxy ile çift katman (P0).
 * Oturum yoksa güvenli `next` ile login’e yönlendirilir.
 */
export function RequireAuth({ children, loginHref = "/auth/login" }: Props) {
  const { user, isInitialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) return;
    if (user) return;
    const path = typeof window !== "undefined" ? safeInternalNextPath(`${window.location.pathname}${window.location.search}`) : "/upload";
    router.replace(`${loginHref}?next=${encodeURIComponent(path)}`);
  }, [user, isInitialized, router, loginHref]);

  if (!isInitialized) {
    return <RequireAuthSkeleton />;
  }

  if (!user) {
    return <RequireAuthSkeleton />;
  }

  return <>{children}</>;
}
