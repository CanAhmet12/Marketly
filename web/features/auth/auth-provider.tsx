"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { AuthContext, type AuthContextValue } from "@/features/auth/auth-context";
import { buildSignUpMetadata, loadUserProfile } from "@/features/auth/profile";
import { fetchOnboardingProfileState } from "@/features/onboarding/fetch-onboarding-profile";
import {
  LS_ONBOARDING_DONE,
  LS_ONBOARDING_DRAFT,
  readOnboardingDoneLocal,
  markOnboardingDoneLocal,
} from "@/features/onboarding/lib/onboarding-storage";
import { validateDisplayName, validateEmail, validatePassword } from "@/features/auth/validation";
import { AUTH_SESSION_BOOT_RETRIES, AUTH_SESSION_BOOT_TIMEOUT_MS } from "@/lib/auth/config";
import { withTimeout } from "@/lib/async/with-timeout";
import { clearSupabaseAuthStorage } from "@/lib/supabase/clear-auth-storage";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getSupabaseEnvIssues, getSiteUrl, isSupabaseConfigured } from "@/lib/supabase/env";
import type { AuthUser, Profile } from "@/lib/supabase/types";
import { getMockAppViewerProfile, getMockAppViewerUser } from "@/mock/authentication";
import { isMockDataEnabled } from "@/mock/config";

import type { Session } from "@supabase/supabase-js";

function mapAuthError(message: string, mode: "signIn" | "signUp" | "reset" | "update"): string {
  const m = message.toLowerCase();
  if (mode === "signIn") {
    if (m.includes("invalid login credentials")) return "E-posta veya şifre hatalı.";
    if (m.includes("email not confirmed")) return "E-posta adresinizi doğrulayın. Gelen kutunuzu kontrol edin.";
    if (m.includes("too many requests")) return "Çok fazla deneme. Lütfen birkaç dakika bekleyin.";
    return "Giriş başarısız. Lütfen tekrar deneyin.";
  }
  if (mode === "signUp") {
    if (m.includes("user already registered") || m.includes("already registered")) {
      return "Bu e-posta adresi zaten kayıtlı.";
    }
    if (m.includes("database error")) return "Kayıt tamamlanamadı. Lütfen tekrar deneyin.";
    return "Kayıt başarısız. Lütfen bilgilerinizi kontrol edin.";
  }
  if (mode === "reset") {
    return "Şifre sıfırlama isteği gönderilemedi. E-posta adresini kontrol edin.";
  }
  return "Şifre güncellenemedi. Lütfen tekrar deneyin.";
}

/** Mock kullanıcı yalnızca Supabase yapılandırılmamışsa — gerçek oturumla karışmaz */
function shouldUseMockViewer(): boolean {
  return isMockDataEnabled() && !isSupabaseConfigured();
}

async function readSessionWithRetry(client: ReturnType<typeof getSupabaseBrowserClient>): Promise<Session | null> {
  for (let attempt = 0; attempt <= AUTH_SESSION_BOOT_RETRIES; attempt += 1) {
    try {
      const { data } = await withTimeout(
        client.auth.getSession(),
        AUTH_SESSION_BOOT_TIMEOUT_MS,
        "auth-session-timeout",
      );
      return data.session ?? null;
    } catch {
      if (attempt < AUTH_SESSION_BOOT_RETRIES) {
        await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
      }
    }
  }
  try {
    const { data } = await client.auth.getSession();
    return data.session ?? null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [onboardingComplete, setOnboardingComplete] = useState(() => readOnboardingDoneLocal());
  const [isInitialized, setInitialized] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const profileLoadGen = useRef(0);

  const configError = useMemo(
    () => (!isSupabaseConfigured() ? getSupabaseEnvIssues().join(" ") : null),
    [],
  );

  const clearError = useCallback(() => setError(null), []);

  const markOnboardingComplete = useCallback(() => {
    markOnboardingDoneLocal();
    setOnboardingComplete(true);
  }, []);

  const syncOnboardingState = useCallback(async (client: ReturnType<typeof getSupabaseBrowserClient>, userId: string) => {
    if (readOnboardingDoneLocal()) {
      setOnboardingComplete(true);
      return;
    }
    const state = await fetchOnboardingProfileState(client, userId);
    setOnboardingComplete(state.completed);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    const client = getSupabaseBrowserClient();
    const { data } = await client.auth.getSession();
    const s = data.session;
    if (!s?.user) return;
    const email = s.user.email ?? "";
    const { profile: p, displayUser } = await loadUserProfile(client, s.user.id, email, s.user);
    await syncOnboardingState(client, s.user.id).catch(() => undefined);
    setSession(s);
    setProfile(p);
    setUser(displayUser);
  }, [syncOnboardingState]);

  const signIn = useCallback(async (emailRaw: string, password: string): Promise<boolean> => {
    setError(null);
    if (!isSupabaseConfigured()) {
      setError("Supabase yapılandırması eksik.");
      return false;
    }
    const email = emailRaw.trim();
    if (!email) {
      setError("E-posta adresi boş olamaz.");
      return false;
    }
    if (!validateEmail(email)) {
      setError("Geçerli bir e-posta adresi girin.");
      return false;
    }
    if (!password) {
      setError("Şifre boş olamaz.");
      return false;
    }

    setSubmitting(true);
    try {
      const client = getSupabaseBrowserClient();
      const { data, error: authError } = await client.auth.signInWithPassword({
        email: email.toLowerCase(),
        password,
      });
      if (authError) {
        setError(mapAuthError(authError.message, "signIn"));
        return false;
      }
      if (data.session?.user) {
        const em = data.user.email ?? email.toLowerCase();
        const { profile: p, displayUser } = await loadUserProfile(client, data.user.id, em, data.user);
        await syncOnboardingState(client, data.user.id).catch(() => undefined);
        setSession(data.session);
        setProfile(p);
        setUser(displayUser);
      }
      return true;
    } catch {
      setError("Giriş başarısız. İnternet bağlantınızı kontrol edin.");
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [syncOnboardingState]);

  useEffect(() => {
    let cancelled = false;
    const mockViewer = shouldUseMockViewer();

    const applyMockViewer = () => {
      setUser(getMockAppViewerUser());
      setProfile(getMockAppViewerProfile());
      setSession(null);
    };
    const clearSessionIdentity = () => {
      setUser(null);
      setProfile(null);
      setSession(null);
    };

    if (!isSupabaseConfigured()) {
      void Promise.resolve().then(() => {
        if (cancelled) return;
        if (mockViewer) applyMockViewer();
        else clearSessionIdentity();
        setInitialized(true);
      });
      return () => {
        cancelled = true;
      };
    }

    const client = getSupabaseBrowserClient();

    const finishBoot = () => {
      if (!cancelled) setInitialized(true);
    };

    const applySessionUser = async (nextSession: Session) => {
      const gen = ++profileLoadGen.current;
      const email = nextSession.user.email ?? "";
      const userId = nextSession.user.id;

      setUser({
        id: userId,
        email,
        displayName: email.split("@")[0] || "Kullanıcı",
      });

      try {
        const { profile: p, displayUser } = await withTimeout(
          loadUserProfile(client, userId, email, nextSession.user),
          10_000,
          "profile-load-timeout",
        );
        await syncOnboardingState(client, userId).catch(() => undefined);
        if (cancelled || gen !== profileLoadGen.current) return;
        setProfile(p);
        if (displayUser) setUser(displayUser);
      } catch {
        if (cancelled || gen !== profileLoadGen.current) return;
      }
    };

    void readSessionWithRetry(client)
      .then((initial) => {
        if (cancelled) return;
        setSession(initial);
        finishBoot();
        if (initial?.user) {
          void applySessionUser(initial);
        } else if (mockViewer) {
          applyMockViewer();
        } else {
          clearSessionIdentity();
        }
      })
      .catch(() => {
        if (cancelled) return;
        finishBoot();
        void readSessionWithRetry(client).then((fallback) => {
          if (cancelled) return;
          setSession(fallback);
          if (fallback?.user) {
            void applySessionUser(fallback);
          } else if (mockViewer) {
            applyMockViewer();
          } else {
            clearSessionIdentity();
          }
        });
      });

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(async (event, nextSession) => {
      if (cancelled) return;
      setSession(nextSession);
      if (nextSession?.user) {
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION") {
          void applySessionUser(nextSession);
        }
        return;
      }
      if (event === "SIGNED_OUT") {
        if (mockViewer) {
          applyMockViewer();
        } else {
          clearSessionIdentity();
          setOnboardingComplete(readOnboardingDoneLocal());
        }
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [syncOnboardingState]);

  const signUp = useCallback(
    async (
      displayName: string,
      emailRaw: string,
      password: string,
    ): Promise<{ ok: boolean; needsEmailConfirmation: boolean }> => {
      setError(null);
      if (!isSupabaseConfigured()) {
        setError("Supabase yapılandırması eksik.");
        return { ok: false, needsEmailConfirmation: false };
      }

      const nameCheck = validateDisplayName(displayName);
      if (!nameCheck.valid) {
        setError(nameCheck.message);
        return { ok: false, needsEmailConfirmation: false };
      }
      const email = emailRaw.trim();
      if (!validateEmail(email)) {
        setError("Geçerli bir e-posta adresi girin.");
        return { ok: false, needsEmailConfirmation: false };
      }
      const pwCheck = validatePassword(password);
      if (!pwCheck.valid) {
        setError(pwCheck.message);
        return { ok: false, needsEmailConfirmation: false };
      }

      setSubmitting(true);
      try {
        const client = getSupabaseBrowserClient();
        const cleanEmail = email.toLowerCase();
        const meta = buildSignUpMetadata(displayName, cleanEmail);

        const origin =
          typeof window !== "undefined"
            ? getSiteUrl() || window.location.origin
            : getSiteUrl();
        const { data, error: authError } = await client.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: meta.full_name,
              username: meta.username,
            },
            emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent("/onboarding/setup")}`,
          },
        });

        if (authError) {
          setError(mapAuthError(authError.message, "signUp"));
          return { ok: false, needsEmailConfirmation: false };
        }

        const needsEmailConfirmation = !data.session;

        if (data.session && data.user) {
          const em = data.user.email ?? cleanEmail;
          const { profile: p, displayUser } = await loadUserProfile(client, data.user.id, em, data.user);
          await syncOnboardingState(client, data.user.id).catch(() => undefined);
          setSession(data.session);
          setProfile(p);
          setUser(displayUser);
        }

        return { ok: true, needsEmailConfirmation };
      } catch {
        setError("Kayıt başarısız. İnternet bağlantınızı kontrol edin.");
        return { ok: false, needsEmailConfirmation: false };
      } finally {
        setSubmitting(false);
      }
    },
    [syncOnboardingState],
  );

  const signOut = useCallback(async () => {
    const mockViewer = shouldUseMockViewer();
    if (!isSupabaseConfigured()) {
      setError(null);
      if (mockViewer) {
        setUser(getMockAppViewerUser());
        setProfile(getMockAppViewerProfile());
        setSession(null);
      } else {
        setUser(null);
        setProfile(null);
        setSession(null);
      }
      return;
    }
    const client = getSupabaseBrowserClient();
    await client.auth.signOut();
    clearSupabaseAuthStorage();
    try {
      localStorage.removeItem(LS_ONBOARDING_DONE);
      localStorage.removeItem(LS_ONBOARDING_DRAFT);
    } catch {
      /* ignore */
    }
    setUser(null);
    setProfile(null);
    setSession(null);
    setOnboardingComplete(false);
    setError(null);
    if (typeof window !== "undefined") {
      window.location.assign("/");
    }
  }, []);

  const resetPasswordForEmail = useCallback(async (emailRaw: string): Promise<boolean> => {
    setError(null);
    if (!isSupabaseConfigured()) {
      setError("Supabase yapılandırması eksik.");
      return false;
    }
    const email = emailRaw.trim().toLowerCase();
    if (!validateEmail(email)) {
      setError("Geçerli bir e-posta adresi girin.");
      return false;
    }
    setSubmitting(true);
    try {
      const client = getSupabaseBrowserClient();
      const origin =
        typeof window !== "undefined" ? getSiteUrl() || window.location.origin : getSiteUrl();
      const { error: authError } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent("/auth/update-password")}`,
      });
      if (authError) {
        setError(mapAuthError(authError.message, "reset"));
        return false;
      }
      return true;
    } catch {
      setError("İstek gönderilemedi. Bağlantınızı kontrol edin.");
      return false;
    } finally {
      setSubmitting(false);
    }
  }, []);

  const updatePassword = useCallback(async (newPassword: string): Promise<boolean> => {
    setError(null);
    if (!isSupabaseConfigured()) {
      setError("Supabase yapılandırması eksik.");
      return false;
    }
    const pwCheck = validatePassword(newPassword);
    if (!pwCheck.valid) {
      setError(pwCheck.message);
      return false;
    }
    setSubmitting(true);
    try {
      const client = getSupabaseBrowserClient();
      const { error: authError } = await client.auth.updateUser({ password: newPassword });
      if (authError) {
        setError(mapAuthError(authError.message, "update"));
        return false;
      }
      return true;
    } catch {
      setError("Şifre güncellenemedi.");
      return false;
    } finally {
      setSubmitting(false);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      session,
      onboardingComplete,
      isInitialized,
      isSubmitting,
      error,
      configError,
      signIn,
      signUp,
      signOut,
      resetPasswordForEmail,
      updatePassword,
      clearError,
      refreshProfile,
      markOnboardingComplete,
    }),
    [
      user,
      profile,
      session,
      onboardingComplete,
      isInitialized,
      isSubmitting,
      error,
      configError,
      signIn,
      signUp,
      signOut,
      resetPasswordForEmail,
      updatePassword,
      clearError,
      refreshProfile,
      markOnboardingComplete,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
