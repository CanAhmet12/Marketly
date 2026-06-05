"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import { HomeVisualStoryRail, type StoryRailVariant } from "@/features/home/visual/home-visual-story-rail";
import type { HomeVisualStoryItem } from "@/features/home/visual/mock-data";
import { StoryUploadModal } from "@/features/stories/story-upload-modal";
import { StoryViewerOverlay } from "@/features/stories/story-viewer-overlay";
import {
  buildStaticVisualStorySlides,
  mapStorySlidesToVisualItems,
  storyIndexFromVisualId,
} from "@/features/stories/map-story-visual";
import { useStoriesRail } from "@/features/stories/use-stories-rail";
import { useAuth } from "@/features/auth/use-auth";
import { isMockDataEnabled } from "@/mock/config";

import { HOME_VISUAL_STORIES } from "@/features/home/visual/mock-data";

type Props = {
  /** Supabase yok + mock kapalı — statik placeholder şerit */
  useStaticFallback?: boolean;
  variant?: StoryRailVariant;
};

export function HomeStoriesSection({ useStaticFallback = false, variant = "home" }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [staticViewed, setStaticViewed] = useState<Set<string>>(() => new Set());
  const [fallbackViewerOpen, setFallbackViewerOpen] = useState(false);
  const [fallbackViewerIndex, setFallbackViewerIndex] = useState(0);

  const { slides, loading, viewerOpen, viewerIndex, openViewer, closeViewer, onViewed, refetch } = useStoriesRail();

  const staticSlides = useMemo(() => buildStaticVisualStorySlides(staticViewed), [staticViewed]);

  const displaySlides = slides.length > 0 ? slides : useStaticFallback ? staticSlides : [];

  const visualItems = useMemo(() => {
    if (slides.length > 0) return mapStorySlidesToVisualItems(slides);
    if (useStaticFallback && staticSlides.length > 0) return mapStorySlidesToVisualItems(staticSlides);
    if (isMockDataEnabled()) return HOME_VISUAL_STORIES;
    return mapStorySlidesToVisualItems([]);
  }, [slides, useStaticFallback, staticSlides]);

  const onStoryPress = useCallback(
    (item: HomeVisualStoryItem) => {
      if (displaySlides.length === 0) return;
      const idx = storyIndexFromVisualId(item.id, displaySlides);
      if (slides.length > 0) {
        openViewer(idx);
        return;
      }
      setFallbackViewerIndex(idx);
      setFallbackViewerOpen(true);
    },
    [displaySlides, openViewer, slides.length],
  );

  const handleViewed = useCallback(
    (storyId: string) => {
      if (slides.length > 0) {
        void onViewed(storyId);
        return;
      }
      setStaticViewed((prev) => new Set(prev).add(storyId));
    },
    [onViewed, slides.length],
  );

  const handleCloseViewer = useCallback(() => {
    closeViewer();
    setFallbackViewerOpen(false);
  }, [closeViewer]);

  const isViewerOpen = (viewerOpen && slides.length > 0) || (fallbackViewerOpen && displaySlides.length > 0);
  const activeViewerIndex = slides.length > 0 ? viewerIndex : fallbackViewerIndex;

  const onAddStory = useCallback(() => {
    if (!user) {
      router.push("/auth/login?next=/");
      return;
    }
    setUploadOpen(true);
  }, [router, user]);

  if (loading && slides.length === 0 && !useStaticFallback) {
    const root = variant === "discover" ? "dvr-stories" : "hv-ref-stories";
    return (
      <div className={`${root} ${root}--loading`} aria-hidden>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={`${root}__hit ${root}__hit--skeleton`} />
        ))}
      </div>
    );
  }

  return (
    <>
      <HomeVisualStoryRail items={visualItems} onStoryPress={onStoryPress} onAddStory={onAddStory} variant={variant} />
      <StoryViewerOverlay
        slides={displaySlides}
        startIndex={activeViewerIndex}
        open={isViewerOpen}
        onClose={handleCloseViewer}
        onViewed={handleViewed}
      />
      <StoryUploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploaded={() => void refetch()}
      />
    </>
  );
}
