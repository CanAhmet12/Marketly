import type { FeedPost } from "@/features/feed/types";

/** Bölüm kartlarında beğeni / kaydet — mock’ta optimistic patch ile uyumlu */
export type HomeEngagementHandlers = {
  isLoggedIn: boolean;
  likePendingPostId: string | null;
  savePendingPostId: string | null;
  onToggleLike: (post: FeedPost) => void;
  onToggleSave: (post: FeedPost) => void;
  /** Beğeni / kaydet için oturum gerekir */
  onRequireAuth?: () => void;
};
