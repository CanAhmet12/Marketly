"use client";

import { useAuthContext } from "@/features/auth/auth-context";

/** Uygulama genelinde kimlik doğrulama kancası */
export function useAuth() {
  return useAuthContext();
}
