import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  PersonalizedDiscussionPack,
  PersonalizedDiscussionRow,
} from "@/features/social/repository/discussion-discovery-types";
import { parseRpcRows } from "@/lib/supabase/parse-rpc-rows";

export type PersonalizedDiscussionRpcRow = {
  post_id: string;
  title: string | null;
  asset_tag: string | null;
  comment_count: number | null;
  like_count: number | null;
  creator_id: string | null;
  creator_username: string | null;
  relevance_score: number | null;
  relevance_reason: string | null;
  bucket: string | null;
  created_at: string | null;
};

const EMPTY: PersonalizedDiscussionPack = {
  for_you: [],
  watchlist: [],
  followed_creators: [],
  portfolio: [],
  room_suggestions: [],
  topic_suggestions: [],
};

function mapRow(row: PersonalizedDiscussionRpcRow): PersonalizedDiscussionRow {
  const comments = row.comment_count ?? 0;
  const likes = row.like_count ?? 0;
  return {
    id: row.post_id,
    post_id: row.post_id,
    label: (row.title ?? "Tartışma").trim() || "Tartışma",
    sub: [row.asset_tag, row.creator_username ? `@${row.creator_username}` : null]
      .filter(Boolean)
      .join(" · "),
    href: `/post/${row.post_id}`,
    relevance_reason: row.relevance_reason?.trim() || "Öneri",
    score_label: `${comments} yorum · ${likes} beğeni`,
  };
}

function bucketKey(raw: string | null): keyof PersonalizedDiscussionPack | null {
  switch (raw) {
    case "for_you":
      return "for_you";
    case "watchlist":
      return "watchlist";
    case "followed_creators":
      return "followed_creators";
    case "portfolio":
      return "portfolio";
    default:
      return "for_you";
  }
}

/** `get_personalized_discussions` RPC — Sprint 11 */
export async function fetchPersonalizedDiscussions(
  client: SupabaseClient,
  userId: string | null,
  limit = 12,
): Promise<PersonalizedDiscussionPack> {
  try {
    const { data, error } = await client.rpc("get_personalized_discussions", {
      p_user_id: userId,
      p_limit: limit,
    });
    if (error) {
      console.warn("[discussions] get_personalized_discussions", error.message);
      return EMPTY;
    }
    const rows = parseRpcRows<PersonalizedDiscussionRpcRow>(data);
    const pack: PersonalizedDiscussionPack = {
      for_you: [],
      watchlist: [],
      followed_creators: [],
      portfolio: [],
      room_suggestions: [],
      topic_suggestions: [],
    };
    for (const row of rows) {
      const key = bucketKey(row.bucket);
      if (!key || key === "room_suggestions" || key === "topic_suggestions") {
        pack.for_you.push(mapRow(row));
        continue;
      }
      pack[key].push(mapRow(row));
    }
    return pack;
  } catch (e) {
    console.warn("[discussions] fetch failed", e);
    return EMPTY;
  }
}
