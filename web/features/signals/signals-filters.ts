/** Sinyaller sayfası — filtre state + URL senkronu. */

import type { SignalDirectionFilter, SignalFilterChipId, SignalSortId } from "@/features/signals/types";

export type SignalFiltersState = {
  direction: SignalDirectionFilter;
  sort: SignalSortId;
  chips: Set<SignalFilterChipId>;
  analystId: string | "all";
  minConfidence: number;
};

export const SIGNAL_CHIP_OPTIONS: { id: SignalFilterChipId; label: string }[] = [
  { id: "high_conf", label: "Yüksek güven" },
  { id: "premium_catalog", label: "Premium" },
  { id: "scalp", label: "Scalp" },
  { id: "swing", label: "Swing" },
  { id: "long", label: "Uzun vade" },
  { id: "crypto", label: "Kripto" },
  { id: "stocks", label: "Hisseler" },
  { id: "index", label: "Endeks" },
  { id: "forex", label: "Forex" },
  { id: "commodity", label: "Emtia" },
];

export const SIGNAL_DIRECTION_OPTIONS: { id: SignalDirectionFilter; label: string }[] = [
  { id: "all", label: "Tümü" },
  { id: "buy", label: "BUY" },
  { id: "sell", label: "SELL" },
  { id: "hold", label: "HOLD" },
];

export const SIGNAL_SORT_OPTIONS: { id: SignalSortId; label: string }[] = [
  { id: "latest", label: "Son" },
  { id: "trending", label: "Trend" },
  { id: "confidence", label: "Güven" },
];

export const DEFAULT_SIGNAL_FILTERS: SignalFiltersState = {
  direction: "all",
  sort: "latest",
  chips: new Set(),
  analystId: "all",
  minConfidence: 0,
};

const ALL_CHIP_IDS = SIGNAL_CHIP_OPTIONS.map((o) => o.id);

function parseEnum<T extends string>(raw: string | null, allowed: readonly T[], fallback: T): T {
  if (!raw) return fallback;
  return (allowed as readonly string[]).includes(raw) ? (raw as T) : fallback;
}

function parseChips(raw: string | null): Set<SignalFilterChipId> {
  if (!raw?.trim()) return new Set();
  const ids = raw
    .split(",")
    .map((s) => s.trim())
    .filter((s): s is SignalFilterChipId => (ALL_CHIP_IDS as readonly string[]).includes(s));
  return new Set(ids);
}

export function signalFiltersFromSearchParams(sp: URLSearchParams): SignalFiltersState {
  return {
    direction: parseEnum(sp.get("direction"), ["all", "buy", "sell", "hold"] as const, "all"),
    sort: parseEnum(sp.get("sort"), ["latest", "trending", "confidence"] as const, "latest"),
    chips: parseChips(sp.get("chips")),
    analystId: sp.get("analyst")?.trim() || "all",
    minConfidence: Math.min(100, Math.max(0, Number(sp.get("conf") ?? 0) || 0)),
  };
}

export function signalFiltersToSearchParams(
  f: SignalFiltersState,
  focusAsset?: string | null,
  signalId?: string | null,
): URLSearchParams {
  const sp = new URLSearchParams();
  if (focusAsset?.trim()) sp.set("asset", focusAsset.trim().toUpperCase());
  if (signalId?.trim()) sp.set("signal", signalId.trim());
  if (f.direction !== "all") sp.set("direction", f.direction);
  if (f.sort !== "latest") sp.set("sort", f.sort);
  if (f.chips.size) sp.set("chips", [...f.chips].join(","));
  if (f.analystId !== "all") sp.set("analyst", f.analystId);
  if (f.minConfidence > 0) sp.set("conf", String(f.minConfidence));
  return sp;
}

export function signalFiltersActiveCount(f: SignalFiltersState): number {
  let n = 0;
  if (f.direction !== "all") n++;
  if (f.sort !== "latest") n++;
  if (f.chips.size) n += f.chips.size;
  if (f.analystId !== "all") n++;
  if (f.minConfidence > 0) n++;
  return n;
}

export function signalFiltersAreDefault(f: SignalFiltersState): boolean {
  return signalFiltersActiveCount(f) === 0;
}
