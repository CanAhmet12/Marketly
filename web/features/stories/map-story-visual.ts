import type { StorySlide } from "@/features/stories/types";
import type { HomeVisualStoryItem } from "@/features/home/visual/mock-data";
import { HOME_VISUAL_STORIES } from "@/features/home/visual/mock-data";

const LIVE_LABELS = new Set(["Fed canlı not", "XU100 açılış", "VIOP straddle"]);
const NEW_WHEN_UNVIEWED = true;

function ringForSlide(slide: StorySlide, index: number): HomeVisualStoryItem["ring"] {
  if (index % 3 === 0) return "teal";
  if (index % 3 === 1) return "amber";
  return "slate";
}

function variantForSlide(slide: StorySlide): HomeVisualStoryItem["variant"] {
  if (LIVE_LABELS.has(slide.label)) return "live";
  if (NEW_WHEN_UNVIEWED && !slide.isViewed) return "new";
  return "default";
}

export const ADD_STORY_VISUAL_ITEM: HomeVisualStoryItem = {
  id: "__add_story__",
  label: "Hikaye Ekle",
  avatarUrl: "",
  variant: "default",
  ring: "slate",
};

export function mapStorySlidesToVisualItems(slides: StorySlide[]): HomeVisualStoryItem[] {
  const mapped = slides.map((s, i) => ({
    id: s.id,
    label: s.label,
    avatarUrl: s.profileImage,
    variant: variantForSlide(s),
    ring: ringForSlide(s, i),
    isViewed: s.isViewed,
  }));
  return [ADD_STORY_VISUAL_ITEM, ...mapped];
}

export function storyIndexFromVisualId(visualId: string, slides: StorySlide[]): number {
  const idx = slides.findIndex((s) => s.id === visualId);
  return idx >= 0 ? idx : 0;
}

/** Supabase/mock yok — HOME_VISUAL_STORIES halkaları için demo slaytlar */
export function buildStaticVisualStorySlides(viewedIds: Set<string> = new Set()): StorySlide[] {
  return HOME_VISUAL_STORIES.filter((s) => s.id !== "s1" && Boolean(s.avatarUrl)).map((s) => ({
    id: `static-${s.id}`,
    userId: `static-user-${s.id}`,
    username: s.label,
    profileImage: s.avatarUrl,
    mediaUrl: `https://picsum.photos/seed/hv-story-slide-${s.id}/1080/1920`,
    mediaType: "image" as const,
    isViewed: viewedIds.has(`static-${s.id}`) || Boolean(s.isViewed),
    label: s.label,
  }));
}
