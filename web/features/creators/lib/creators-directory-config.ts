/** Üreticiler dizini — sıralama, filtre ve sekme sabitleri */

export const CREATOR_SORT_OPTIONS = [
  { id: "recommended", label: "Önerilen" },
  { id: "live", label: "Canlı önce" },
  { id: "rising", label: "Yükselen" },
  { id: "followers", label: "Takipçi" },
  { id: "accuracy", label: "İsabet oranı" },
] as const;

export type CreatorsSortId = (typeof CREATOR_SORT_OPTIONS)[number]["id"];

export const CREATOR_VIEW_TABS = [
  { id: "all", label: "Tümü" },
  { id: "live", label: "Canlı" },
  { id: "rising", label: "Yükselen" },
] as const;

export type CreatorsViewTab = (typeof CREATOR_VIEW_TABS)[number]["id"];

export const CREATOR_ASSET_PRESETS = [
  "BTC",
  "ETH",
  "BIST",
  "XAUUSD",
  "USDTRY",
  "NASDAQ",
] as const;

export type CreatorAssetPreset = (typeof CREATOR_ASSET_PRESETS)[number];

export const CREATOR_SPECIALTY_PRESETS = [
  { id: "crypto", label: "Kripto" },
  { id: "stocks", label: "Hisse / BIST" },
  { id: "forex", label: "Döviz" },
  { id: "macro", label: "Makro" },
  { id: "commodity", label: "Emtia" },
  { id: "deriv", label: "VİOP / Türev" },
] as const;

export type CreatorSpecialtyId = (typeof CREATOR_SPECIALTY_PRESETS)[number]["id"];

export function normalizeCreatorsSort(raw: string | null): CreatorsSortId {
  if (raw && CREATOR_SORT_OPTIONS.some((o) => o.id === raw)) return raw as CreatorsSortId;
  return "recommended";
}

export function normalizeCreatorsViewTab(raw: string | null): CreatorsViewTab {
  if (raw && CREATOR_VIEW_TABS.some((t) => t.id === raw)) return raw as CreatorsViewTab;
  return "all";
}

export function normalizeCreatorAsset(raw: string | null): string | null {
  if (!raw?.trim()) return null;
  const u = raw.trim().toUpperCase();
  return CREATOR_ASSET_PRESETS.includes(u as CreatorAssetPreset) ? u : u.slice(0, 16);
}

export function normalizeCreatorSpecialty(raw: string | null): CreatorSpecialtyId | null {
  if (!raw) return null;
  return CREATOR_SPECIALTY_PRESETS.some((s) => s.id === raw) ? (raw as CreatorSpecialtyId) : null;
}
