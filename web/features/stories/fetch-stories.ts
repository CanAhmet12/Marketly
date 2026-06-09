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

type StoryRow = {
  id: string;
  user_id: string;
  image_url: string;
  created_at: string;
  expires_at?: string;
};

function displayName(profile: ProfileRow | undefined, fallbackId: string): string {
  return profile?.username?.trim() || profile?.full_name?.trim() || "Kullanıcı";
}

function sortUserIds(
  userIds: string[],
  byUser: Map<string, StoryRow[]>,
  viewedIds: Set<string>,
  viewerId: string | null,
): string[] {
  return [...userIds].sort((a, b) => {
    if (viewerId) {
      if (a === viewerId && b !== viewerId) return -1;
      if (b === viewerId && a !== viewerId) return 1;
    }
    const aStories = byUser.get(a) ?? [];
    const bStories = byUser.get(b) ?? [];
    const aUnviewed = aStories.some((s) => !viewedIds.has(s.id));
    const bUnviewed = bStories.some((s) => !viewedIds.has(s.id));
    if (aUnviewed && !bUnviewed) return -1;
    if (!aUnviewed && bUnviewed) return 1;
    const aLatest = aStories[0]?.created_at ?? "";
    const bLatest = bStories[0]?.created_at ?? "";
    return new Date(bLatest).getTime() - new Date(aLatest).getTime();
  });
}

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

  const nowIso = new Date().toISOString();

  const { data: storiesData, error } = await client
    .from("stories")
    .select("id, user_id, image_url, created_at, expires_at")
    .gt("expires_at", nowIso)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error || !storiesData?.length) {
    if (error) console.warn("[stories] fetch", error.message);
    return [];
  }

  const byUser = new Map<string, StoryRow[]>();
  for (const story of storiesData as StoryRow[]) {
    const list = byUser.get(story.user_id) ?? [];
    list.push(story);
    byUser.set(story.user_id, list);
  }

  for (const [uid, rows] of byUser) {
    rows.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    byUser.set(uid, rows);
  }

  const userIds = Array.from(byUser.keys());
  const { data: profiles } = await client
    .from("profiles")
    .select("id, username, full_name, avatar_url")
    .in("id", userIds);

  const profileMap = new Map((profiles as ProfileRow[] | null)?.map((p) => [p.id, p]) ?? []);

  let viewedIds = new Set<string>();
  if (viewerId) {
    const { data: views } = await client.from("story_views").select("story_id").eq("viewer_id", viewerId);
    viewedIds = new Set(views?.map((v) => String(v.story_id)) ?? []);
  }

  const orderedUsers = sortUserIds(userIds, byUser, viewedIds, viewerId);
  const slides: StorySlide[] = [];

  for (const storyUserId of orderedUsers) {
    const profile = profileMap.get(storyUserId);
    const name = displayName(profile, storyUserId);
    const profileImage = profile?.avatar_url?.trim() || avatarUrl(storyUserId, name);

    for (const story of byUser.get(storyUserId) ?? []) {
      const mediaUrl = story.image_url?.trim() || "";
      if (!mediaUrl) continue;
      slides.push({
        id: story.id,
        userId: storyUserId,
        username: name,
        profileImage,
        mediaUrl,
        mediaType: "image",
        isViewed: viewedIds.has(story.id),
        label: name,
      });
    }
  }

  return slides;
}

export async function markStoryViewed(
  client: SupabaseClient | null,
  storyId: string,
  viewerId: string | null,
): Promise<void> {
  if (isMockDataEnabled() || !client || !viewerId) return;
  try {
    const { error } = await client.from("story_views").upsert(
      { story_id: storyId, viewer_id: viewerId, viewed_at: new Date().toISOString() },
      { onConflict: "story_id,viewer_id", ignoreDuplicates: true },
    );
    if (error) console.warn("[stories] markViewed", error.message);
  } catch (e) {
    console.warn("[stories] markViewed", e);
  }
}
