import type { SupabaseClient } from "@supabase/supabase-js";

import type { ChannelDiscussionTeaser } from "@/features/social/repository/discussion-types";
import { isMockDataEnabled } from "@/mock/config";
import { mockChannelDiscussionTeasers } from "@/mock/adapters/social-discussion-data";

function commentCount(row: Record<string, unknown>): number {
  if (typeof row.comments_count === "number") return row.comments_count;
  if (typeof row.comments === "number") return row.comments;
  return 0;
}

/** Kanal tartışma önizlemeleri — yorum trafiği yüksek gönderiler */
export async function fetchChannelDiscussions(
  client: SupabaseClient,
  channelUserId: string,
  limit = 24,
): Promise<ChannelDiscussionTeaser[]> {
  if (isMockDataEnabled()) {
    return mockChannelDiscussionTeasers(channelUserId);
  }

  const { data, error } = await client
    .from("posts")
    .select("id, content, comments, comments_count, asset_tag, created_at, updated_at")
    .eq("user_id", channelUserId)
    .order("created_at", { ascending: false })
    .limit(80);

  if (error) {
    console.warn("[channel] fetchChannelDiscussions", error.message);
    return [];
  }

  return (data ?? [])
    .map((raw) => {
      const row = raw as Record<string, unknown>;
      const comments = commentCount(row);
      const content = String(row.content ?? "").trim();
      return {
        post_id: String(row.id),
        href: `/post/${String(row.id)}`,
        excerpt: content.slice(0, 120) + (content.length > 120 ? "…" : ""),
        comments,
        asset_tag: row.asset_tag != null ? String(row.asset_tag) : null,
        updated_at: String(row.updated_at ?? row.created_at ?? new Date().toISOString()),
        _comments: comments,
      };
    })
    .filter((d) => d.comments > 0 && d.excerpt.length > 0)
    .sort((a, b) => b._comments - a._comments)
    .slice(0, limit)
    .map(({ _comments: _, ...rest }) => rest);
}
