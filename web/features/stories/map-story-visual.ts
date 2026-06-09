import type { StorySlide } from "@/features/stories/types";
import type { HomeVisualStoryItem } from "@/features/home/visual/mock-data";
import { HOME_VISUAL_STORIES } from "@/features/home/visual/mock-data";

const LIVE_LABELS = new Set(["Fed canlı not", "XU100 açılış", "VIOP straddle"]);
const NEW_WHEN_UNVIEWED = true;

/** Label içeriğinden piyasa kategorisi ring tonunu çıkar */
function ringForSlide(slide: StorySlide, index: number): HomeVisualStoryItem["ring"] {
  const lbl = slide.label.toLowerCase();
  // Kripto keyword'ları
  if (/btc|eth|sol|xrp|kripto|crypto|bitcoin|ethereum/.test(lbl)) return "crypto";
  // Hisse / endeks keyword'ları
  if (/xu100|bist|hisse|nasdaq|spx|dow|s&p|s&p|nvda|aapl|msft/.test(lbl)) return "blue";
  // Döviz keyword'ları
  if (/döviz|forex|usd|eur|gbp|jpy|try|dolar|euro/.test(lbl)) return "teal";
  // Emtia keyword'ları
  if (/altın|gold|petrol|oil|gümüş|silver|emtia|commodity/.test(lbl)) return "orange";
  // Makro / genel finans keyword'ları
  if (/makro|macro|fed|ecb|tcmb|faiz|enflasyon|cpi|gdp|inflation/.test(lbl)) return "violet";
  // Canlı yayın
  if (/canlı|live|stream/.test(lbl)) return "orange";
  // Index fallback
  const cycle: HomeVisualStoryItem["ring"][] = ["teal", "amber", "slate", "crypto", "blue"];
  return cycle[index % cycle.length];
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

/** Şerit: kullanıcı başına tek halka; viewer içinde tüm slaytlar */
export function mapStorySlidesToVisualItems(slides: StorySlide[]): HomeVisualStoryItem[] {
  const byUser = new Map<string, StorySlide[]>();
  for (const s of slides) {
    const bucket = byUser.get(s.userId) ?? [];
    bucket.push(s);
    byUser.set(s.userId, bucket);
  }

  const mapped: HomeVisualStoryItem[] = [];
  let i = 0;
  for (const [userId, userSlides] of byUser) {
    const rep = userSlides[0]!;
    const allViewed = userSlides.every((s) => s.isViewed);
    const hasUnviewed = userSlides.some((s) => !s.isViewed);
    mapped.push({
      id: `story-user-${userId}`,
      label: rep.label,
      avatarUrl: rep.profileImage,
      variant: hasUnviewed ? variantForSlide(rep) : "default",
      ring: ringForSlide(rep, i),
      isViewed: allViewed,
    });
    i += 1;
  }
  return [ADD_STORY_VISUAL_ITEM, ...mapped];
}

export function storyIndexFromVisualId(visualId: string, slides: StorySlide[]): number {
  if (visualId.startsWith("story-user-")) {
    const userId = visualId.slice("story-user-".length);
    const idx = slides.findIndex((s) => s.userId === userId);
    return idx >= 0 ? idx : 0;
  }
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
