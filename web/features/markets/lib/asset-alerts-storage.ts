export type MockAssetAlert = { id: string; label: string; createdAt: string };

export const ASSET_ALERTS_STORAGE_KEY = "marketly-mock-asset-alerts-v1";

export function readAlertsForSymbol(symbol: string): MockAssetAlert[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ASSET_ALERTS_STORAGE_KEY);
    if (!raw) return [];
    const o = JSON.parse(raw) as Record<string, MockAssetAlert[]>;
    const u = symbol.toUpperCase();
    return Array.isArray(o[u]) ? o[u]! : [];
  } catch {
    return [];
  }
}

export function writeAlertsForSymbol(symbol: string, rows: MockAssetAlert[]) {
  try {
    const raw = localStorage.getItem(ASSET_ALERTS_STORAGE_KEY);
    const o = (raw ? JSON.parse(raw) : {}) as Record<string, MockAssetAlert[]>;
    o[symbol.toUpperCase()] = rows;
    localStorage.setItem(ASSET_ALERTS_STORAGE_KEY, JSON.stringify(o));
  } catch {
    /* */
  }
}

export type AssetAlertGroup = { symbol: string; alerts: MockAssetAlert[] };

/** Tüm sembollerdeki kayıtlı alarmlar (fiyat alarmları sayfası) */
export function readAllAssetAlerts(): AssetAlertGroup[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ASSET_ALERTS_STORAGE_KEY);
    if (!raw) return [];
    const o = JSON.parse(raw) as Record<string, MockAssetAlert[]>;
    return Object.entries(o)
      .filter(([, rows]) => Array.isArray(rows) && rows.length > 0)
      .map(([symbol, alerts]) => ({ symbol, alerts }))
      .sort((a, b) => a.symbol.localeCompare(b.symbol));
  } catch {
    return [];
  }
}

export function removeAlertById(symbol: string, id: string) {
  const next = readAlertsForSymbol(symbol).filter((a) => a.id !== id);
  writeAlertsForSymbol(symbol, next);
  return next;
}
