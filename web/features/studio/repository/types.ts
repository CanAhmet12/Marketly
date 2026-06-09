/** Creator Studio — backend-ready domain tipleri */

export type StudioContentKind = "video" | "post" | "signal" | "short" | "live" | "draft" | "scheduled";

export type StudioContentStatus =
  | "published"
  | "draft"
  | "scheduled"
  | "archived"
  | "live"
  | "processing";

export type StudioVisibility = "public" | "unlisted" | "private";

export type StudioPlatformTarget = "marketly" | "web" | "mobile" | "all";

export type CreatorContentItem = {
  id: string;
  kind: StudioContentKind;
  title: string;
  preview: string;
  thumbnailUrl: string | null;
  status: StudioContentStatus;
  views: number;
  comments: number;
  likes: number;
  publishedAt: string | null;
  visibility: StudioVisibility;
  href?: string | null;
};

export type StudioDraftItem = {
  id: string;
  kind: "post" | "video" | "signal";
  title: string;
  preview: string;
  lastEditedAt: string;
  thumbnailUrl: string | null;
};

export type StudioScheduledItem = {
  id: string;
  contentKind: "post" | "video" | "signal" | "short";
  title: string;
  preview: string;
  scheduledFor: string;
  status: "pending" | "processing" | "cancelled";
  platformTarget: StudioPlatformTarget;
  thumbnailUrl: string | null;
};

export type StudioPlaylistItem = {
  id: string;
  title: string;
  description: string;
  videoCount: number;
  visibility: StudioVisibility;
  updatedAt: string;
  coverThumbnailUrl: string | null;
  /** Liste sahibi (mock/profil bağlantısı) */
  ownerId: string;
  /** Video/short gönderi kimlikleri (sıralı) */
  memberPostIds: string[];
};

export type StudioLiveStreamItem = {
  id: string;
  title: string;
  description: string;
  scheduledStart: string;
  status: "scheduled" | "live" | "ended";
  reminderCount: number;
  thumbnailUrl: string | null;
  postId?: string | null;
  channelName?: string | null;
  viewerCount?: number;
  href?: string | null;
};

export type StudioLiveActiveSession = {
  postId: string;
  channelName: string;
  title: string;
  viewerCount: number;
  startedAt: string;
  href: string;
};

export type StudioLiveCommand = {
  activeSession: StudioLiveActiveSession | null;
  scheduled: StudioLiveStreamItem[];
  endedRecent: StudioLiveStreamItem[];
};

export type StudioTimeframe = "7d" | "28d" | "90d";

export type StudioMetricPoint = { label: string; value: number };

export type StudioAudienceSegment = { label: string; percent: number };

export type AnalyticsSummary = {
  totalViews: number;
  viewsChangePercent: number;
  watchTimeSeconds: number;
  watchTimeChangePercent: number;
  engagementScore: number;
  engagementChangePercent: number;
  followerCount: number;
  followerGrowth7d: number;
  signalCopyCount: number;
  signalCopyChangePercent: number;
  publishedContentCount: number;
  publishedSubtitle: string;
};

export type StudioAnalyticsBundle = {
  summary: AnalyticsSummary;
  timeframe: StudioTimeframe;
  viewsSeries: StudioMetricPoint[];
  watchTimeSeries: StudioMetricPoint[];
  engagementSeries: StudioMetricPoint[];
  followerSeries: StudioMetricPoint[];
  audienceBreakdown: StudioAudienceSegment[];
  /** Video / gönderi / sinyal / canlı görüntülenme payı */
  contentTypeBreakdown: StudioAudienceSegment[];
  topVideos: { id: string; title: string; views: number; thumbnailUrl: string | null }[];
  topPosts: { id: string; title: string; views: number; thumbnailUrl: string | null }[];
  topAssets: { symbol: string; mentions: number; engagement: number }[];
};

export type StudioTopContentRow = {
  id: string;
  kind: StudioContentKind;
  title: string;
  views: number;
  engagement: number;
  thumbnailUrl: string | null;
};

export type StudioQuickAction = {
  id: string;
  label: string;
  href: string;
  variant: "primary" | "secondary" | "ghost";
};

export type StudioDashboardOverview = {
  totalViews: number;
  followerGrowth7d: number;
  engagementScore: number;
  publishedCount: number;
  draftCount: number;
  scheduledCount: number;
  estimatedRevenueUsd: number | null;
  metricHints: {
    totalViews: string;
    followerGrowth: string;
    engagement: string;
    published: string;
  };
  recentPerformance: StudioMetricPoint[];
  topContent: StudioTopContentRow[];
  quickActions: StudioQuickAction[];
};

export type StudioLocalMutations = {
  archivedContentIds: string[];
  deletedDraftIds: string[];
  cancelledScheduledIds: string[];
  duplicateSourceIds: string[];
};

export const defaultStudioLocalMutations = (): StudioLocalMutations => ({
  archivedContentIds: [],
  deletedDraftIds: [],
  cancelledScheduledIds: [],
  duplicateSourceIds: [],
});

/** Creator Studio — ekonomi işletim katmanı (mock + canlı seyrek) */
export type StudioEconomyTierRow = {
  key: string;
  label: string;
  visibility_label: string;
  price_placeholder: string | null;
  included_line: string;
  href_manage: string | null;
};

export type StudioEconomySignalControl = {
  id: string;
  symbol: string;
  access_mode: "public" | "preview" | "locked" | "subscriber";
  bundle_label: string | null;
  audience_hint: string | null;
  href: string;
};

export type StudioEconomyRoomControl = {
  id: string;
  label: string;
  premium: boolean;
  circle_linked: boolean;
  moderation_label: string;
  invite_flow: string;
  featured: boolean;
  href: string;
};

export type StudioEconomyAudienceIntel = {
  subscriber_momentum: string;
  room_engagement: string;
  premium_participation: string;
  discussion_quality: string;
  signal_interaction: string;
  loyalty: string;
  strategy_fit: string;
  churn_hint: string;
  heat: string;
};

export type StudioEconomyRevenueIntel = {
  revenue_band_placeholder: string;
  premium_growth_hint: string;
  membership_distribution: string;
  engagement_quality: string;
  conversion_hint: string;
};

export type StudioEconomyRevenueSegment = {
  label: string;
  pct: number;
  color: string;
  amountUsd: number;
};

/** Live/mock gelir özeti — hardcoded hero yerine */
export type StudioEconomyRevenueSnapshot = {
  estimatedTotalUsd: number | null;
  changePercent: number;
  segments: StudioEconomyRevenueSegment[];
  activeSubscribers: number;
  monetizedSignals: number;
  premiumRooms: number;
  dataSource: "live" | "mock" | "sparse";
};

export type StudioEconomyPublishingDefaults = {
  premium_default: string;
  room_target: string;
  circle_target: string;
  signal_visibility: string;
  discussion_visibility: string;
  recommendation_visibility: string;
  archive_behavior: string;
  preview_generation: string;
};

export type StudioEconomyMemberSegment = "subscriber" | "trusted" | "premium" | "room_leader" | "high_engagement" | "overlap";

export type StudioEconomyMemberRow = {
  id: string;
  name: string;
  segment: StudioEconomyMemberSegment;
  quality_label: string;
  invite_status: string | null;
  href: string;
};

export type CreatorStudioEconomyHubPayload = {
  headline: string;
  subline: string;
  data_sparse: boolean;
  creator_id: string | null;
  nav_cross: { href: string; label: string }[];
  tiers: StudioEconomyTierRow[];
  signal_controls: StudioEconomySignalControl[];
  room_controls: StudioEconomyRoomControl[];
  audience: StudioEconomyAudienceIntel;
  revenue: StudioEconomyRevenueIntel;
  publishing_defaults: StudioEconomyPublishingDefaults;
  members: StudioEconomyMemberRow[];
  revenue_snapshot?: StudioEconomyRevenueSnapshot;
};
