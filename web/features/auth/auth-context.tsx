"use client";

import { createContext, useContext } from "react";

import type { Session } from "@supabase/supabase-js";

import type { AuthUser, Profile } from "@/lib/supabase/types";

export type AuthContextValue = {
  user: AuthUser | null;
  profile: Profile | null;
  session: Session | null;
  /** Kurulum (onboarding) tamamlandı mı — DB veya yerel bayrak */
  onboardingComplete: boolean;
  /** İlk getSession + profil denemesi tamamlandı mı */
  isInitialized: boolean;
  /** Giriş / kayıt / şifre işlemi sürüyor */
  isSubmitting: boolean;
  error: string | null;
  configError: string | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (displayName: string, email: string, password: string) => Promise<{ ok: boolean; needsEmailConfirmation: boolean }>;
  signOut: () => Promise<void>;
  resetPasswordForEmail: (email: string) => Promise<boolean>;
  updatePassword: (newPassword: string) => Promise<boolean>;
  clearError: () => void;
  refreshProfile: () => Promise<void>;
  /** Onboarding tamamlandı olarak işaretle (UI + yerel depo) */
  markOnboardingComplete: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext yalnızca AuthProvider içinde kullanılmalıdır.");
  }
  return ctx;
}
