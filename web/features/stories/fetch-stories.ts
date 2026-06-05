import type { SupabaseClient } from "@supabase/supabase-js";

import { avatarUrl } from "@/lib/avatar-url";
import { isMockDataEnabled } from "@/mock/config";
import { buildMockStorySlides } from "@/mock/fixtures/story-slides";
import { getMockUploadedStories } from "@/mock/adapters/story-upload-store";

import type { StorySlide } from "./types";

type ProfileRow = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
};

export async function fetchStorySlides(
  client: SupabaseClient | null,
  viewerId: string | null,
): Promise<StorySlide[]> {
  if (isMockDataEnabled()) {
    const base = buildMockStorySlides();
    const mine = getMockUploadedStories();
    const merged = [...mine, ...base.filter((s) => !mine.some((m) => m.userId === s.userId))];
    return merged;
  }
  if (!client) return [];

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data: storiesData, error } = await client
    .from("stories")
    .select("id, user_id, image_url")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error || !storiesData?.length) {
    if (error) console.warn("[stories] fetch", error.message);
    return [];
  }

  const userMap = new Map<string, (typeof storiesData)[0]>();
  for (const story of storiesData) {
    if (!userMap.has(story.user_id)) userMap.set(story.user_id, story);
  }

  const userIds = Array.from(userMap.keys());
  const { data: profiles } = await client
    .from("profiles")
    .select("id, username, full_name, avatar_url")
    .in("id", userIds);

  const profileMap = new Map((profiles as ProfileRow[] | null)?.map((p) => [p.id, p]) ?? []);

  let viewedIds = new Set<string>();
  if (viewerId) {
    const { data: views } = await client.from("story_views").select("story_id").eq("viewer_id", viewerId);
    viewedIds = new Set(views?.map((v) => v.story_id as string) ?? []);
  }

  const slides: StorySlide[] = [];
  userMap.forEach((story, storyUserId) => {
    const profile = profileMap.get(storyUserId);
    const name = profile?.username || profile?.full_name || "Kullanıcı";
    const mediaUrl = (story.image_url as string | null)?.trim() || "";
    if (!mediaUrl) return;

    slides.push({
      id: story.id as string,
      userId: storyUserId,
      username: name,
      profileImage: profile?.avatar_url?.trim() || avatarUrl(storyUserId, name),
      mediaUrl,
      mediaType: "image",
      isViewed: viewedIds.has(story.id as string),
      label: name,
    });
  });

  slides.sort((a, b) => {
    if (!a.isViewed && b.isViewed) return -1;
    if (a.isViewed && !b.isViewed) return 1;
    return 0;
  });

  return slides;
}

export async function markStoryViewed(
  client: SupabaseClient | null,
  storyId: string,
  viewerId: string | null,
): Promise<void> {
  if (isMockDataEnabled() || !client || !viewerId) return;
  try {
    await client.from("story_views").insert({ story_id: storyId, viewer_id: viewerId });
  } catch (e) {
    console.warn("[stories] markViewed", e);
  }
}
