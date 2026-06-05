"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import { AuthContext, type AuthContextValue } from "@/features/auth/auth-context";
import { buildSignUpMetadata, loadUserProfile } from "@/features/auth/profile";
import { validateDisplayName, validateEmail, validatePassword } from "@/features/auth/validation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getSupabaseEnvIssues, isSupabaseConfigured } from "@/lib/supabase/env";
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isInitialized, setInitialized] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const configError = useMemo(
    () => (!isSupabaseConfigured() ? getSupabaseEnvIssues().join(" ") : null),
    [],
  );

  const clearError = useCallback(() => setError(null), []);

  const refreshProfile = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    const client = getSupabaseBrowserClient();
    const { data } = await client.auth.getSession();
    const s = data.session;
    if (!s?.user) return;
    const email = s.user.email ?? "";
    const { profile: p, displayUser } = await loadUserProfile(client, s.user.id, email, s.user);
    setProfile(p);
    setUser(displayUser);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const mockOn = isMockDataEnabled();

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
        if (mockOn) applyMockViewer();
        else clearSessionIdentity();
        setInitialized(true);
      });
      return () => {
        cancelled = true;
      };
    }

    const client = getSupabaseBrowserClient();

    void client.auth.getSession().then(async ({ data: { session: initial } }) => {
      if (cancelled) return;
      setSession(initial);
      if (initial?.user) {
        const email = initial.user.email ?? "";
        const { profile: p, displayUser } = await loadUserProfile(
          client,
          initial.user.id,
          email,
          initial.user,
        );
        if (cancelled) return;
        setProfile(p);
        setUser(displayUser);
      } else if (mockOn) {
        applyMockViewer();
      } else {
        clearSessionIdentity();
      }
      if (!cancelled) setInitialized(true);
    });

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(async (_event, nextSession) => {
      if (cancelled) return;
      setSession(nextSession);
      if (nextSession?.user) {
        const email = nextSession.user.email ?? "";
        const { profile: p, displayUser } = await loadUserProfile(
          client,
          nextSession.user.id,
          email,
          nextSession.user,
        );
        if (cancelled) return;
        setProfile(p);
        setUser(displayUser);
      } else if (mockOn) {
        applyMockViewer();
      } else {
        clearSessionIdentity();
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

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
    const pwCheck = validatePassword(password);
    if (!pwCheck.valid) {
      setError(pwCheck.message);
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
  }, []);

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

        const { data, error: authError } = await client.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: meta.full_name,
              username: meta.username,
            },
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
    [],
  );

  const signOut = useCallback(async () => {
    const mockOn = isMockDataEnabled();
    if (!isSupabaseConfigured()) {
      setError(null);
      if (mockOn) {
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
    setUser(null);
    setProfile(null);
    setSession(null);
    setError(null);
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
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const { error: authError } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/update-password`,
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
    }),
    [
      user,
      profile,
      session,
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
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
