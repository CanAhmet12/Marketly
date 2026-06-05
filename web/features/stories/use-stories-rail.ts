"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

import { useAuth } from "@/features/auth/use-auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isMockDataEnabled } from "@/mock/config";

import { fetchStorySlides, markStoryViewed } from "./fetch-stories";
import type { StorySlide } from "./types";

export function useStoriesRail() {
  const { user, isInitialized } = useAuth();
  const uid = user?.id ?? null;
  const qc = useQueryClient();

  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const enabled = isMockDataEnabled() || (isInitialized && isSupabaseConfigured());

  const query = useQuery({
    queryKey: ["stories-rail", uid ?? "anon"] as const,
    enabled,
    queryFn: async () => {
      const client = isMockDataEnabled() ? null : getSupabaseBrowserClient();
      return fetchStorySlides(client, uid);
    },
    staleTime: 60_000,
  });

  const slides = query.data ?? [];

  const openViewer = useCallback((index: number) => {
    if (!slides.length) return;
    setViewerIndex(Math.max(0, Math.min(index, slides.length - 1)));
    setViewerOpen(true);
  }, [slides.length]);

  const closeViewer = useCallback(() => setViewerOpen(false), []);

  const onViewed = useCallback(
    async (storyId: string) => {
      if (isMockDataEnabled()) {
        qc.setQueryData<StorySlide[]>(["stories-rail", uid ?? "anon"], (prev) =>
          prev?.map((s) => (s.id === storyId ? { ...s, isViewed: true } : s)),
        );
        return;
      }
      const client = getSupabaseBrowserClient();
      await markStoryViewed(client, storyId, uid);
      qc.setQueryData<StorySlide[]>(["stories-rail", uid ?? "anon"], (prev) =>
        prev?.map((s) => (s.id === storyId ? { ...s, isViewed: true } : s)),
      );
    },
    [qc, uid],
  );

  const visualItems = useMemo(() => slides, [slides]);

  return {
    slides,
    visualItems,
    loading: enabled && query.isPending,
    viewerOpen,
    viewerIndex,
    openViewer,
    closeViewer,
    onViewed,
    refetch: query.refetch,
  };
}
