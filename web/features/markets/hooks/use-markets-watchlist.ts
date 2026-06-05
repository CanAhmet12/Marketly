"use client";

import { useCallback, useEffect, useState } from "react";

import { showMutationToast } from "@/lib/ui/mutation-toast";
import { isMockDataEnabled } from "@/mock/config";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  fetchWatchlistFromDb,
  addToWatchlistDb,
  removeFromWatchlistDb,
} from "@/features/markets/fetch-watchlist";
import { useAuth } from "@/features/auth/use-auth";

const STORAGE_KEY = "marketly-markets-watchlist";
const PINNED_KEY = "marketly-markets-pinned";

function readSet(key: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.filter((x): x is string => typeof x === "string"));
  } catch {
    return new Set();
  }
}

function writeSet(key: string, next: Set<string>) {
  try {
    localStorage.setItem(key, JSON.stringify([...next]));
  } catch {
    throw new Error("storage");
  }
}

/**
 * @param seedWatchlistIfEmpty — `localStorage` anahtarı hiç yokken (ilk ziyaret) doldurulacak semboller.
 * Dışarıdan **sabit dizi referansı** verin (ör. `MOCK_MARKETS_WATCHLIST_SEED`).
 */
export function useMarketsWatchlist(seedWatchlistIfEmpty?: readonly string[]) {
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());
  const [pinned, setPinned] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);
  const [pendingSymbol, setPendingSymbol] = useState<string | null>(null);
  const { user } = useAuth();
  const liveMode = !isMockDataEnabled() && isSupabaseConfigured();

  useEffect(() => {
    queueMicrotask(async () => {
      // Canlı modda: Supabase'den yükle (yoksa localStorage fallback)
      if (liveMode && user?.id) {
        try {
          const dbSymbols = await fetchWatchlistFromDb(getSupabaseBrowserClient(), user.id);
          const dbSet = new Set(dbSymbols);
          if (dbSet.size > 0) {
            setWatchlist(dbSet);
            writeSet(STORAGE_KEY, dbSet);
            setPinned(readSet(PINNED_KEY));
            setHydrated(true);
            return;
          }
        } catch {
          /* localStorage fallback'e düş */
        }
      }
      const hadStorageKey = typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY) !== null;
      let initial = readSet(STORAGE_KEY);
      if (!hadStorageKey && seedWatchlistIfEmpty?.length) {
        initial = new Set(seedWatchlistIfEmpty.map((s) => s.trim().toUpperCase()).filter(Boolean));
        writeSet(STORAGE_KEY, initial);
      }
      setWatchlist(initial);
      setPinned(readSet(PINNED_KEY));
      setHydrated(true);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seedWatchlistIfEmpty, user?.id, liveMode]);

  const toggleWatch = useCallback((symbol: string) => {
    const key = symbol.trim().toUpperCase();
    if (!key) return;

    setPendingSymbol(key);
    setWatchlist((prev) => {
      const next = new Set(prev);
      const removing = next.has(key);
      if (removing) next.delete(key);
      else next.add(key);
      try {
        writeSet(STORAGE_KEY, next);
      } catch {
        showMutationToast("İzleme listesi güncellenemedi.");
        setPendingSymbol(null);
        return prev;
      }
      // Canlı modda Supabase'e de yaz
      if (liveMode && user?.id) {
        const client = getSupabaseBrowserClient();
        const sync = removing
          ? removeFromWatchlistDb(client, user.id, key)
          : addToWatchlistDb(client, user.id, key);
        void sync.catch(() => {
          showMutationToast("İzleme listesi sunucuya kaydedilemedi. Yerel kopya korundu.");
        });
      }
      return next;
    });
    window.setTimeout(() => setPendingSymbol(null), 120);
  }, [liveMode, user?.id]);

  const togglePin = useCallback((symbol: string) => {
    setPinned((prev) => {
      const next = new Set(prev);
      if (next.has(symbol)) next.delete(symbol);
      else next.add(symbol);
      try {
        writeSet(PINNED_KEY, next);
      } catch {
        showMutationToast("Sabitleme güncellenemedi.");
        return prev;
      }
      return next;
    });
  }, []);

  const isWatched = useCallback((symbol: string) => watchlist.has(symbol), [watchlist]);
  const isPinned = useCallback((symbol: string) => pinned.has(symbol), [pinned]);

  return { watchlist, pinned, hydrated, pendingSymbol, toggleWatch, togglePin, isWatched, isPinned };
}
