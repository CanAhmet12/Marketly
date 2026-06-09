"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/features/auth/use-auth";

/**
 * Mobil “Profil” sekmesi — oturumluysa kişisel yönetim merkezi (/hub),
 * değilse girişe yönlendirir. Herkese açık kanal `/channel/[id]` olarak kalır.
 */
export function ProfileEntryClient() {
  const { user, isInitialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) return;
    if (user?.id) {
      router.replace("/hub/profile");
      return;
    }
    router.replace(`/auth/login?next=${encodeURIComponent("/hub/profile")}`);
  }, [isInitialized, user?.id, router]);

  return null;
}
