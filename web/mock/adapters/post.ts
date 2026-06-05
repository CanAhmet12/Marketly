import type { PostDetail } from "@/features/post/types";

import { mapMockPostToFeedPost } from "./feed";
import { MOCK_PROFILE_BY_ID } from "../fixtures/profiles";
import { resolveMockPostSourceById } from "./mock-post-resolve";

export function mockPostDetail(postId: string, userId: string | null): PostDetail | null {
  const src = resolveMockPostSourceById(postId);
  if (!src) return null;
  const prof = MOCK_PROFILE_BY_ID[src.user_id];
  let quoted = null;
  if (src.quoted_post_id) {
    const qsrc = resolveMockPostSourceById(src.quoted_post_id);
    if (qsrc) quoted = mapMockPostToFeedPost(qsrc, null, userId);
  }
  const base = mapMockPostToFeedPost(src, quoted, userId);
  return {
    ...base,
    verified: Boolean(prof?.verified),
    thread_id: null,
    reply_to_post_id: src.reply_to_post_id ?? null,
    description: src.description,
    views_count: src.views_count,
    is_saved: false,
  };
}
