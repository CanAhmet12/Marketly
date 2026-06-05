/**
 * Mock veri anahtarı — yalnızca geliştirme / tasarım önizlemesi.
 * Production build'de env açık olsa bile mock kapalıdır.
 */

function truthyEnv(raw: string | undefined): boolean {
  if (raw == null || String(raw).trim() === "") return false;
  const v = String(raw).trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes" || v === "on";
}

/** `NEXT_PUBLIC_USE_MOCK` (yeni) veya `NEXT_PUBLIC_USE_MOCK_DATA` (mevcut) — biri yeter */
function readMockEnvFlag(): boolean {
  if (typeof process === "undefined" || !process.env) return false;
  return (
    truthyEnv(process.env.NEXT_PUBLIC_USE_MOCK) || truthyEnv(process.env.NEXT_PUBLIC_USE_MOCK_DATA)
  );
}

export function isMockAllowedInCurrentEnv(): boolean {
  return process.env.NODE_ENV !== "production";
}

/** Aktif mock: env açık + production değil (her çağrıda okunur — dev’de .env değişince yeniden derleme gerekir) */
export function isMockDataEnabled(): boolean {
  if (!isMockAllowedInCurrentEnv()) return false;
  return readMockEnvFlag();
}

/** Konsol / dokümantasyon için kısa uyarı metni */
export function getMockModeWarning(): string {
  return "Mock mode: NEXT_PUBLIC_USE_MOCK veya NEXT_PUBLIC_USE_MOCK_DATA açık; Supabase verisi yerine mock adapter kullanılıyor. Üretim build’inde kapalıdır.";
}
