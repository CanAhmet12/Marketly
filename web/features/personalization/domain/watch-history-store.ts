import { personalizationStorageReadsSuppressed } from "./personalization-storage-gate";

const KEY = "marketly-watch-history-v1";
const MAX = 96;

export type WatchHistoryEntry = {
  postId: string;
  creatorId: string;
  assetUpper: string | null;
  format: string;
  ts: number;
  /** 0–1 tamamlanma — isteğe bağlı */
  completion?: number;
};

export type WatchHistoryState = {
  version: 1;
  entries: WatchHistoryEntry[];
};

const empty: WatchHistoryState = { version: 1, entries: [] };

function read(): WatchHistoryState {
  if (typeof window === "undefined" || personalizationStorageReadsSuppressed()) return { ...empty, entries: [] };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...empty, entries: [] };
    const o = JSON.parse(raw) as Partial<WatchHistoryState>;
    if (!o || o.version !== 1) return { ...empty, entries: [] };
    const entries = Array.isArray(o.entries)
      ? o.entries
          .filter((e): e is WatchHistoryEntry =>
            Boolean(e && typeof e.postId === "string" && typeof e.creatorId === "string" && typeof e.ts === "number"),
          )
          .map((e) => ({
            postId: e.postId,
            creatorId: e.creatorId,
            assetUpper: typeof e.assetUpper === "string" ? e.assetUpper : null,
            format: (e.format ?? "video").toLowerCase(),
            ts: e.ts,
            completion: typeof e.completion === "number" ? e.completion : undefined,
          }))
      : [];
    return { version: 1, entries };
  } catch {
    return { ...empty, entries: [] };
  }
}

function write(s: WatchHistoryState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* */
  }
}

export function readWatchHistoryState(): WatchHistoryState {
  return read();
}

export function clearWatchHistoryStore(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* */
  }
}

/** Son `window` içinde aynı üreticinin görülme sayısı — binge sinyali */
export function recentCreatorBingeCount(creatorId: string, window: number): number {
  const now = Date.now();
  const { entries } = read();
  let n = 0;
  for (let i = entries.length - 1; i >= 0; i--) {
    const e = entries[i]!;
    if (now - e.ts > window) break;
    if (e.creatorId === creatorId) n++;
  }
  return n;
}

export function appendWatchHistoryEntry(entry: Omit<WatchHistoryEntry, "ts"> & { ts?: number }): WatchHistoryState {
  const prev = read();
  const ts = entry.ts ?? Date.now();
  const last = prev.entries[prev.entries.length - 1];
  if (last && last.postId === entry.postId && ts - last.ts < 12_000) {
    return prev;
  }
  const nextEntry: WatchHistoryEntry = {
    postId: entry.postId,
    creatorId: entry.creatorId,
    assetUpper: entry.assetUpper,
    format: entry.format.toLowerCase(),
    ts,
    completion: entry.completion,
  };
  const next: WatchHistoryState = {
    version: 1,
    entries: [...prev.entries, nextEntry].slice(-MAX),
  };
  write(next);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("marketly-personalization-updated"));
  }
  return next;
}

export const WATCH_HISTORY_STORAGE_KEY = KEY;
