/**
 * İstemci hata günlüğü — geliştirmede ayrıntılı; üretimde Sızıntı riski olmadan minimal.
 * İleride: `captureException(error, { extra: context })` (Sentry vb.) buraya bağlanır.
 */
export function logClientError(source: string, error: unknown, context?: Record<string, unknown>): void {
  if (process.env.NODE_ENV === "development") {
    if (context && Object.keys(context).length > 0) {
      console.error(`[${source}]`, error, context);
    } else {
      console.error(`[${source}]`, error);
    }
  }
}
