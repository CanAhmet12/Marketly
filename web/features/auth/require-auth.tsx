"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { RequireAuthSkeleton } from "@/features/studio/components/studio-states";
import { useAuth } from "@/features/auth/use-auth";
import { safeInternalNextPath } from "@/lib/auth/safe-next-path";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

type Props = {
  children: ReactNode;
  loginHref?: string;
};

type GatePhase = "boot" | "recovering" | "authenticated" | "denied";

/**
 * İstemci tarafı koruma — edge proxy ile uyumlu çift katman.
 * Recovery tamamlanmadan redirect yapılmaz (race fix).
 */
export function RequireAuth({ children, loginHref = "/auth/login" }: Props) {
  const { user, isInitialized, refreshProfile } = useAuth();
  const [phase, setPhase] = useState<GatePhase>("boot");
  const recoveryStarted = useRef(false);

  useEffect(() => {
    if (!isInitialized) {
      setPhase("boot");
      return;
    }

    if (user) {
      setPhase("authenticated");
      return;
    }

    if (!isSupabaseConfigured()) {
      setPhase("denied");
      return;
    }

    if (recoveryStarted.current) return;
    recoveryStarted.current = true;
    setPhase("recovering");

    const client = getSupabaseBrowserClient();
    void client.auth
      .getUser()
      .then(({ data: { user: verified } }) => {
        if (verified) {
          setPhase("authenticated");
          void refreshProfile();
        } else {
          setPhase("denied");
        }
      })
      .catch(() => {
        setPhase("denied");
      });
  }, [isInitialized, user, refreshProfile]);

  useEffect(() => {
    if (phase !== "denied") return;

    const path =
      typeof window !== "undefined"
        ? safeInternalNextPath(`${window.location.pathname}${window.location.search}`)
        : "/upload";
    window.location.assign(`${loginHref}?next=${encodeURIComponent(path)}`);
  }, [phase, loginHref]);

  if (phase === "boot" || phase === "recovering") {
    return <RequireAuthSkeleton />;
  }

  if (phase === "denied") {
    return <RequireAuthSkeleton />;
  }

  return <>{children}</>;
}
