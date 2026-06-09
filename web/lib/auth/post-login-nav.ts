import { safeInternalNextPath } from "@/lib/auth/safe-next-path";

/** Giriş/kayıt sonrası güvenli yönlendirme — SPA navigasyonu oturumu korur. */
export function navigateAfterAuth(explicitNext: string | null | undefined, fallback = "/"): void {
  if (typeof window === "undefined") return;
  const target = explicitNext?.trim() ? safeInternalNextPath(explicitNext) : fallback;
  window.location.href = target;
}
