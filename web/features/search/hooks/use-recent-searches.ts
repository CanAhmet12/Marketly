"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "marketly:recent-searches";
const MAX_RECENT = 6;

function readStorage(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string").slice(0, MAX_RECENT);
  } catch {
    return [];
  }
}

function writeStorage(items: string[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_RECENT)));
  } catch {
    /* quota */
  }
}

export function useRecentSearches() {
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    setRecent(readStorage());
  }, []);

  const pushRecent = useCallback((q: string) => {
    const t = q.trim();
    if (t.length < 2) return;
    setRecent((prev) => {
      const next = [t, ...prev.filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, MAX_RECENT);
      writeStorage(next);
      return next;
    });
  }, []);

  const removeRecent = useCallback((q: string) => {
    setRecent((prev) => {
      const next = prev.filter((x) => x !== q);
      writeStorage(next);
      return next;
    });
  }, []);

  const clearRecent = useCallback(() => {
    writeStorage([]);
    setRecent([]);
  }, []);

  return { recent, pushRecent, removeRecent, clearRecent };
}
