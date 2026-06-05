"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const RECENT_KEY = "marketly-markets-recent-searches";
const MAX_RECENT = 8;

function readRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as unknown;
    return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === "string").slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
}

function writeRecent(items: string[]) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(items.slice(0, MAX_RECENT)));
  } catch {
    /* yok */
  }
}

export function useMarketsSearch() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const [highlight, setHighlight] = useState(0);

  useEffect(() => {
    queueMicrotask(() => {
      setRecent(readRecent());
    });
  }, []);

  const pushRecent = useCallback((q: string) => {
    const t = q.trim();
    if (!t) return;
    setRecent((prev) => {
      const next = [t, ...prev.filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, MAX_RECENT);
      writeRecent(next);
      return next;
    });
  }, []);

  const clearRecent = useCallback(() => {
    setRecent([]);
    try {
      localStorage.removeItem(RECENT_KEY);
    } catch {
      /* yok */
    }
  }, []);

  const resetHighlight = useCallback(() => setHighlight(0), []);

  const state = useMemo(
    () => ({
      query,
      setQuery,
      open,
      setOpen,
      recent,
      highlight,
      setHighlight,
      pushRecent,
      clearRecent,
      resetHighlight,
    }),
    [query, open, recent, highlight, pushRecent, clearRecent, resetHighlight],
  );

  return state;
}
