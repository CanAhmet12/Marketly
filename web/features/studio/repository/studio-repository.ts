import type {
  CreatorContentItem,
  CreatorStudioEconomyHubPayload,
  StudioAnalyticsBundle,
  StudioDashboardOverview,
  StudioDraftItem,
  StudioLiveStreamItem,
  StudioLocalMutations,
  StudioPlaylistItem,
  StudioScheduledItem,
  StudioTimeframe,
} from "./types";

export type StudioRepository = {
  /** Mock: fixture eşleşmesi; prod: her zaman auth kullanıcı id */
  resolveEffectiveOwnerId(authUserId: string): string;
  getDashboardOverview(ownerId: string, local: StudioLocalMutations): StudioDashboardOverview;
  getContentItems(ownerId: string, local: StudioLocalMutations): CreatorContentItem[];
  getAnalyticsBundle(ownerId: string, timeframe: StudioTimeframe): StudioAnalyticsBundle;
  getDrafts(ownerId: string, local: StudioLocalMutations): StudioDraftItem[];
  getScheduledPosts(ownerId: string, local: StudioLocalMutations): StudioScheduledItem[];
  getPlaylists(ownerId: string): StudioPlaylistItem[];
  /** Tek liste (watch / playlist sayfası); canlıda Supabase */
  getPlaylistById(playlistId: string): StudioPlaylistItem | null;
  getLiveSchedule(ownerId: string): StudioLiveStreamItem[];
  getShellNotice(): string | null;
  getShellSubtitle(): string;
  /** Üretici ekonomisi — abonelik, sinyal, oda, kitle (mock: birleşik; canlı: seyrek) */
  getCreatorEconomyHub(ownerId: string): CreatorStudioEconomyHubPayload;
};
