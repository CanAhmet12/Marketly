/**
 * TanStack Query anahtarları — P0: invalidate tutarlılığı (küçük, düşük risk).
 * Tam refaktör değil; yeni kod bu fabrikaları kullanmalı.
 */
export const queryKeys = {
  homeFeed: (viewerKey: string | null | undefined, mode: "for_you" | "following" = "for_you") =>
    ["home-feed", viewerKey ?? "anon", mode] as const,
  /** Tüm oturumlar için home-feed yenileme (prefix eşleşmesi). */
  homeFeedAll: () => ["home-feed"] as const,
  discoverFeed: (viewerKey: string | null | undefined) => ["discover-feed", viewerKey ?? "anon"] as const,
  postDetail: (postId: string, viewerKey: string) => ["post-detail", postId, viewerKey] as const,
  postComments: (postId: string, viewerKey: string) => ["post-comments", postId, viewerKey] as const,
  postDiscussionSidecar: (postId: string, viewerKey: string) => ["post-discussion-sidecar", postId, viewerKey] as const,
  postDiscussionReactions: (postId: string, viewerKey: string) => ["post-discussion-reactions", postId, viewerKey] as const,
  postParticipation: (postId: string, viewerKey: string) => ["post-participation", postId, viewerKey] as const,
  watchPost: (postId: string, viewerKey: string | null | undefined) => ["watch-post", postId, viewerKey ?? "anon"] as const,
  watchComments: (postId: string) => ["watch-comments", postId] as const,
  watchRelated: (postId: string, userId: string, list?: string | null, asset?: string | null, ctype?: string | null) =>
    ["watch-related", postId, userId, list ?? "", asset ?? "", ctype ?? ""] as const,
  channelProfile: (channelUserId: string) => ["channel-profile", channelUserId] as const,
  channelPosts: (channelUserId: string) => ["channel-posts", channelUserId] as const,
  channelSignals: (channelUserId: string) => ["channel-signals", channelUserId] as const,
  channelDiscussions: (channelUserId: string) => ["channel-discussions", channelUserId] as const,
  channelFollow: (channelUserId: string, viewerId: string | null | undefined) =>
    ["channel-follow", channelUserId, viewerId ?? "anon"] as const,
  /** Takip mutation sonrası tüm izleyiciler için invalidation */
  channelFollowByChannel: (channelUserId: string) => ["channel-follow", channelUserId] as const,
  globalSearch: (q: string) => ["global-search", q] as const,
  creatorsDirectory: (viewerKey: string | null | undefined) => ["creators-directory", viewerKey ?? "anon"] as const,
  recommendedCreators: () => ["recommended-creators"] as const,
  studioAnalytics: (timeframe: string) => ["studio-analytics", timeframe] as const,
  studioDashboard: (ownerId: string | null | undefined) => ["studio-dashboard", ownerId ?? "anon"] as const,
  signalsFeed: () => ["signals-feed"] as const,
  savedPosts: (viewerKey: string | null | undefined) => ["saved-posts", viewerKey ?? "anon"] as const,
  priceAlerts: (viewerKey: string | null | undefined) => ["price-alerts", viewerKey ?? "anon"] as const,
  marketNewsroom: (watchKey: string) => ["market-newsroom", watchKey] as const,
  marketNewsDetail: (newsId: string) => ["market-news-detail", newsId] as const,
  economicCalendar: (watchKey: string) => ["economic-calendar", watchKey] as const,
  economicCalendarDetail: (eventId: string) => ["economic-calendar-detail", eventId] as const,
  homeEditorialChips: () => ["home-editorial-chips"] as const,
  membershipCatalog: () => ["membership-catalog"] as const,
  membershipDetail: (creatorId: string) => ["membership-detail", creatorId] as const,
} as const;
