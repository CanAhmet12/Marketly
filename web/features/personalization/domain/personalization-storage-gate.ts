/**
 * React `useSyncExternalStore` `getServerSnapshot` runs on the client during hydration.
 * It must match SSR output — personalization stores must not read `localStorage` there.
 */
let gateDepth = 0;

export function personalizationStorageReadsSuppressed(): boolean {
  return gateDepth > 0;
}

export function runWithPersonalizationStorageSuppressed<T>(fn: () => T): T {
  gateDepth += 1;
  try {
    return fn();
  } finally {
    gateDepth -= 1;
  }
}
