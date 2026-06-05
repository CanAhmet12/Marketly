import type { FeedPost, LinkPreview, MediaItem } from "@/features/feed/types";

/** Gönderi detay — feed ile uyumlu + ek alanlar */
export type PostDetail = FeedPost & {
  verified: boolean;
  thread_id: string | null;
  reply_to_post_id: string | null;
  description: string | null;
  views_count: number;
  is_saved: boolean;
};

export type DiscussionIntent = "thesis" | "question" | "data" | "risk";

export type PostCommentRow = {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  likes: number;
  parent_comment_id: string | null;
  depth: number;
  is_pinned: boolean;
  author_name: string;
  author_handle: string;
  author_avatar: string | null;
  author_tier: string;
  is_liked: boolean;
  /** Alıntılanan üst yorum özeti */
  quoted_snippet?: string | null;
  is_creator_reply?: boolean;
  signal_ref?: string | null;
  market_tags?: string[] | null;
  discussion_intent?: DiscussionIntent | null;
  thesis_stance?: "agree" | "disagree" | "neutral" | null;
  /** Silinmiş / moderasyon — UI zarif metin */
  is_hidden?: boolean;
};

export type { LinkPreview, MediaItem };
