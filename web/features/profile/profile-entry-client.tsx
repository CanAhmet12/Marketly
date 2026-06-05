"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/features/auth/use-auth";

/**
 * Mobil “Profil” sekmesi ile aynı ürün dili: oturumluysa kendi kanalına,
 * değilse girişe yönlendirir. Paylaşılabilir URL’ler `/channel/[id]` olarak kalır.
 */
export function ProfileEntryClient() {
  const { user, isInitialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) return;
    if (user?.id) {
      router.replace(`/channel/${user.id}`);
      return;
    }
    router.replace(`/auth/login?next=${encodeURIComponent("/profile")}`);
  }, [isInitialized, user?.id, router]);

  return null;
}
