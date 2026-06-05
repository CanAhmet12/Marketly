/**
 * Merkezi istemci günlüğü — şimdilik konsol; ileride Sentry / OpenTelemetry buraya bağlanır.
 */

export type ClientLogLevel = "debug" | "info" | "warn" | "error";

function isDev(): boolean {
  return process.env.NODE_ENV === "development";
}

/**
 * Yapılandırılmış tek satırlık günlük. Üretimde `debug`/`info` yoksayılır (gürültü azaltma).
 */
export function clientLog(
  level: ClientLogLevel,
  area: string,
  message: string,
  extra?: Record<string, unknown>,
): void {
  const tag = `[Marketly:${area}]`;
  const hasExtra = extra && Object.keys(extra).length > 0;
  if (level === "debug" && !isDev()) return;
  if (level === "info" && !isDev()) return;

  switch (level) {
    case "debug":
      if (hasExtra) console.debug(tag, message, extra);
      else console.debug(tag, message);
      break;
    case "info":
      if (hasExtra) console.info(tag, message, extra);
      else console.info(tag, message);
      break;
    case "warn":
      if (hasExtra) console.warn(tag, message, extra);
      else console.warn(tag, message);
      break;
    case "error":
      if (hasExtra) console.error(tag, message, extra);
      else console.error(tag, message);
      break;
    default:
      break;
  }
}
