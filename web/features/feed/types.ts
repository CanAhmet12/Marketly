export type MediaItem = {
  url: string;
  type: "image" | "video" | "gif";
  width?: number;
  height?: number;
  blurhash?: string;
  thumbnail_url?: string;
  duration?: number;
};

export type LinkPreview = {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  site_name?: string;
  type?: string;
  video_url?: string;
  provider?: string;
};

export type SocialRepostBlock = {
  kind: "repost" | "quote_repost";
  commentary: string | null;
  source_post_id: string;
  source: {
    author_name: string;
    author_handle: string;
    content_snippet: string;
    asset_tag: string | null;
  };
};

/** Mobil `usePosts` Post tipi ile uyumlu (web feed) */
export type FeedPost = {
  id: string;
  user_id: string;
  content: string;
  asset_tag: string | null;
  image_url: string | null;
  type: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  title: string | null;
  likes: number;
  comments: number;
  /** İzlenme — backend varsa dolar; yoksa UI göstermez */
  views_count?: number | null;
  created_at: string;
  author_name: string;
  author_handle: string;
  author_avatar: string | null;
  author_tier: string;
  is_liked: boolean;
  is_saved: boolean;
  media_urls: MediaItem[] | null;
  mentioned_users: string[] | null;
  link_preview: LinkPreview | null;
  quoted_post_id: string | null;
  quoted_post: FeedPost | null;
  /** Yeniden paylaşım / alıntılı yayın — tartışma ağı */
  social_repost?: SocialRepostBlock | null;
};

export type FeedPageResult = {
  posts: FeedPost[];
  hasMore: boolean;
};
