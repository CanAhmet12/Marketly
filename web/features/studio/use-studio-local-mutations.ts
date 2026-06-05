"use client";

import { useCallback, useMemo, useState } from "react";

import type { StudioLocalMutations } from "@/features/studio/types";
import { defaultStudioLocalMutations } from "@/features/studio/types";

const STORAGE_KEY = "marketly-mock-studio-mutations-v1";

function readStored(): StudioLocalMutations {
  if (typeof window === "undefined") return defaultStudioLocalMutations();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultStudioLocalMutations();
    const parsed = JSON.parse(raw) as Partial<StudioLocalMutations>;
    return {
      archivedContentIds: Array.isArray(parsed.archivedContentIds) ? parsed.archivedContentIds : [],
      deletedDraftIds: Array.isArray(parsed.deletedDraftIds) ? parsed.deletedDraftIds : [],
      cancelledScheduledIds: Array.isArray(parsed.cancelledScheduledIds) ? parsed.cancelledScheduledIds : [],
      duplicateSourceIds: Array.isArray(parsed.duplicateSourceIds) ? parsed.duplicateSourceIds : [],
    };
  } catch {
    return defaultStudioLocalMutations();
  }
}

function writeStored(next: StudioLocalMutations) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function useStudioLocalMutations(enabled: boolean) {
  const [bump, setBump] = useState(0);

  const mutations = useMemo(() => {
    if (!enabled) return defaultStudioLocalMutations();
    void bump;
    return readStored();
  }, [enabled, bump]);

  const setMutations = useCallback(
    (fn: (prev: StudioLocalMutations) => StudioLocalMutations) => {
      if (!enabled) return;
      const next = fn(readStored());
      writeStored(next);
      setBump((x) => x + 1);
    },
    [enabled],
  );

  return { mutations, setMutations };
}
