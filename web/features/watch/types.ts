export type ProfileJoin = {
  id?: string;
  username?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  tier?: string | null;
};

export type WatchPostDetail = {
  id: string;
  user_id: string;
  content: string;
  type: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  image_url: string | null;
  title: string | null;
  description: string | null;
  likes: number;
  comments: number;
  views_count: number;
  shares_count: number;
  created_at: string;
  duration: number | null;
  asset_tag: string | null;
  media_urls: unknown;
  author_name: string;
  author_handle: string;
  author_avatar: string | null;
  author_tier: string;
  is_liked: boolean;
  is_saved: boolean;
};

export type RelatedVideo = {
  id: string;
  /** Geri bildirim / sıralama — mock’ta doldurulur */
  creator_id?: string;
  title: string | null;
  content: string | null;
  thumbnail_url: string | null;
  image_url: string | null;
  video_url?: string | null;
  type: string | null;
  created_at: string;
  views_count?: number;
  duration?: number | null;
  creator_name: string;
  creator_handle: string;
  /** Watch-next sıralama katmanı (mock) */
  continuity_tag?: string;
};

export type WatchVideoComment = {
  id: string;
  video_id: string;
  user_id: string;
  content: string;
  likes: number;
  is_pinned: boolean;
  created_at: string;
  author_name: string;
  author_avatar: string | null;
  author_handle: string;
};
