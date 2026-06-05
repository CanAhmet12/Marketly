/**
 * WEB yazma kapısı (write-gate) — MIG-000 hibrit migration.
 *
 * Amaç: WEB canlı Supabase prod'a bağlandığında (mock kapalı) tüm gerçek
 * yazma (mutation) yolları VARSAYILAN OLARAK bloke olsun; salt-okuma fazı
 * kod düzeyinde garanti edilsin. Yazmalar yalnızca modül modül doğrulandıkça
 * `NEXT_PUBLIC_WEB_WRITE_ENABLED` ile açılır.
 *
 * - Mock modda zaten gerçek yazma yoktur → false döner.
 * - Canlı modda yalnız `NEXT_PUBLIC_WEB_WRITE_ENABLED` truthy ise true.
 * - Env yok/absent => false => yazma BLOKE (güvenli varsayılan).
 */
import { isMockDataEnabled } from "@/mock/config";

function truthyEnv(raw: string | undefined): boolean {
  if (raw == null || String(raw).trim() === "") return false;
  const v = String(raw).trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes" || v === "on";
}

/** WEB gerçek yazma yolları izinli mi? Varsayılan: hayır (güvenli). */
export function isWebWriteEnabled(): boolean {
  if (isMockDataEnabled()) return false;
  if (typeof process === "undefined" || !process.env) return false;
  return truthyEnv(process.env.NEXT_PUBLIC_WEB_WRITE_ENABLED);
}

/** UI'da gösterilebilecek standart bloke mesajı. */
export const WEB_WRITE_BLOCKED_MESSAGE =
  "WEB salt-okuma modu: yazma işlemleri geçici olarak devre dışı (MIG-000 migration fazı).";
