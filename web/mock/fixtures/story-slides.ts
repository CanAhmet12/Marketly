import type { StorySlide } from "@/features/stories/types";
import { avatarUrl } from "@/lib/avatar-url";

import { MOCK_PROFILE_IDS } from "./profiles";

const STORY_MEDIA = [
  "https://picsum.photos/seed/mkt-story-fed/1080/1920",
  "https://picsum.photos/seed/mkt-story-xu100/1080/1920",
  "https://picsum.photos/seed/mkt-story-macro/1080/1920",
  "https://picsum.photos/seed/mkt-story-btc/1080/1920",
  "https://picsum.photos/seed/mkt-story-viop/1080/1920",
  "https://picsum.photos/seed/mkt-story-earn/1080/1920",
  "https://picsum.photos/seed/mkt-story-fx/1080/1920",
  "https://picsum.photos/seed/mkt-story-ai/1080/1920",
  "https://picsum.photos/seed/mkt-story-etf/1080/1920",
] as const;

const STORY_LABELS = [
  "Fed canlı not",
  "XU100 açılış",
  "Makro özet",
  "BTC seviye",
  "VIOP straddle",
  "KAP — bilanço",
  "EUR/TRY bandı",
  "AI semis",
  "Altın ETF",
] as const;

/** Mock mod — Instagram tarzı story slaytları */
export function buildMockStorySlides(viewedIds: Set<string> = new Set()): StorySlide[] {
  return STORY_LABELS.map((label, i) => {
    const userId = MOCK_PROFILE_IDS[i % MOCK_PROFILE_IDS.length]!;
    const id = `mock-story-${String(i + 1).padStart(2, "0")}`;
    const username = label.split(" ")[0] ?? "Analist";
    return {
      id,
      userId,
      username,
      profileImage: avatarUrl(userId, username),
      mediaUrl: STORY_MEDIA[i]!,
      mediaType: "image" as const,
      isViewed: viewedIds.has(id),
      label,
    };
  });
}
