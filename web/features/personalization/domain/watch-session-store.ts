import { personalizationStorageReadsSuppressed } from "./personalization-storage-gate";

const KEY = "marketly-watch-session-v1";

export type WatchSessionState = {
  version: 1;
  anchorPostId: string | null;
  creatorId: string | null;
  assetUpper: string | null;
  format: string | null;
  updatedAt: number;
};

const empty: WatchSessionState = {
  version: 1,
  anchorPostId: null,
  creatorId: null,
  assetUpper: null,
  format: null,
  updatedAt: 0,
};

function read(): WatchSessionState {
  if (typeof window === "undefined" || personalizationStorageReadsSuppressed()) return { ...empty };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...empty };
    const o = JSON.parse(raw) as Partial<WatchSessionState>;
    if (!o || o.version !== 1) return { ...empty };
    return {
      version: 1,
      anchorPostId: typeof o.anchorPostId === "string" ? o.anchorPostId : null,
      creatorId: typeof o.creatorId === "string" ? o.creatorId : null,
      assetUpper: typeof o.assetUpper === "string" ? o.assetUpper : null,
      format: typeof o.format === "string" ? o.format : null,
      updatedAt: typeof o.updatedAt === "number" ? o.updatedAt : 0,
    };
  } catch {
    return { ...empty };
  }
}

function write(s: WatchSessionState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* */
  }
}

export function readWatchSessionState(): WatchSessionState {
  return read();
}

export function setWatchSessionAnchor(input: {
  postId: string;
  creatorId: string;
  assetTag: string | null;
  format: string | null;
}): WatchSessionState {
  const ast = input.assetTag?.replace(/^#/, "").trim().toUpperCase() || null;
  const next: WatchSessionState = {
    version: 1,
    anchorPostId: input.postId,
    creatorId: input.creatorId,
    assetUpper: ast,
    format: (input.format ?? "").toLowerCase() || null,
    updatedAt: Date.now(),
  };
  write(next);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("marketly-personalization-updated"));
  }
  return next;
}

export function clearWatchSessionStore(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* */
  }
}

export const WATCH_SESSION_STORAGE_KEY = KEY;
