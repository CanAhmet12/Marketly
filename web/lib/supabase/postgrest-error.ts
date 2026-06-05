import type { PostgrestError } from "@supabase/supabase-js";

/** RLS / oturum / şema hatalarında kullanıcı dostu mesaj (kırılmadan geri bildirim). */
export function friendlyPostgrestMessage(error: PostgrestError | { message?: string; code?: string } | null): string {
  if (!error?.message) return "İşlem tamamlanamadı. Lütfen tekrar deneyin.";
  const code = "code" in error && typeof error.code === "string" ? error.code : "";
  const msg = error.message.toLowerCase();

  if (code === "42501" || msg.includes("permission denied") || msg.includes("row-level security")) {
    return "Bu işlem için yetkiniz yok veya oturum süresi doldu. Tekrar giriş yapın.";
  }
  if (code === "PGRST301" || msg.includes("jwt expired") || msg.includes("invalid jwt")) {
    return "Oturum süresi doldu. Lütfen tekrar giriş yapın.";
  }
  if (code === "42P01" || (msg.includes("does not exist") && msg.includes("relation"))) {
    return "Sunucu yapılandırması eksik veya güncel değil. Daha sonra tekrar deneyin.";
  }
  if (code === "42703" || (msg.includes("column") && msg.includes("does not exist"))) {
    return "Veri şeması uyumsuz. Yöneticiye bildirin veya uygulamayı güncelleyin.";
  }
  if (msg.includes("duplicate key")) {
    return "Bu kayıt zaten mevcut.";
  }
  return error.message;
}
