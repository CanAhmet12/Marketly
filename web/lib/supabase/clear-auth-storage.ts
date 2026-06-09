import { getSupabasePublicEnv } from "./env";

/** Bozuk veya eski Supabase oturum kalıntılarını temizler (localStorage + cookie). */
export function clearSupabaseAuthStorage(): void {
  if (typeof window === "undefined") return;
  const { url } = getSupabasePublicEnv();

  let projectRef = "";
  if (url) {
    try {
      projectRef = new URL(url).hostname.split(".")[0] ?? "";
    } catch {
      projectRef = "";
    }
  }

  try {
    if (projectRef) {
      const prefix = `sb-${projectRef}-`;
      for (let i = localStorage.length - 1; i >= 0; i -= 1) {
        const key = localStorage.key(i);
        if (key?.startsWith(prefix)) localStorage.removeItem(key);
      }
    }
  } catch {
    /* ignore */
  }

  try {
    const raw = document.cookie;
    if (!raw) return;
    for (const part of raw.split(";")) {
      const name = part.split("=")[0]?.trim();
      if (!name?.startsWith("sb-")) continue;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax`;
    }
  } catch {
    /* ignore */
  }
}
