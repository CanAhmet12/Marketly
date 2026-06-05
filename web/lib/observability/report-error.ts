import { clientLog } from "./logger";

/** Operasyonel uyarı (RPC, realtime, arama fallback vb.) — tüm ortamlarda `warn`. */
export function reportOperationalWarning(area: string, message: string, extra?: Record<string, unknown>): void {
  clientLog("warn", area, message, extra);
}

/**
 * Yakalanmış istemci istisnası — üretimde de tek satır `error` (Sentry öncesi köprü).
 * UI’da zaten gösterilen hatalar için isteğe bağlı; spam’i önlemek için kritik akışlarda kullanın.
 */
export function reportClientException(area: string, error: unknown, extra?: Record<string, unknown>): void {
  const msg = error instanceof Error ? error.message : String(error);
  clientLog("error", area, msg, { ...extra, error });
}
