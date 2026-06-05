"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "marketly-signals-saved";

function read(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as unknown;
    return new Set(Array.isArray(arr) ? arr.filter((x): x is string => typeof x === "string") : []);
  } catch {
    return new Set();
  }
}

function write(next: Set<string>) {
  try {
    localStorage.setItem(KEY, JSON.stringify([...next]));
  } catch {
    /* yok */
  }
}

export function useSignalsSaved() {
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setSaved(read());
      setReady(true);
    });
  }, []);

  const toggle = useCallback((id: string) => {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      write(next);
      return next;
    });
  }, []);

  const isSaved = useCallback((id: string) => saved.has(id), [saved]);

  return { saved, ready, toggle, isSaved };
}
