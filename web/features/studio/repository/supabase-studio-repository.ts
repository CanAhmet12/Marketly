import { STUDIO_QUICK_ACTIONS } from "./studio-quick-actions";
import { assembleCreatorStudioEconomyHub } from "./assemble-creator-studio-economy-hub";
import type { StudioRepository } from "./studio-repository";
import type {
  CreatorContentItem,
  StudioAnalyticsBundle,
  StudioDashboardOverview,
  StudioDraftItem,
  StudioLiveStreamItem,
  StudioLocalMutations,
  StudioPlaylistItem,
  StudioScheduledItem,
  StudioTimeframe,
} from "./types";

const SHELL_SUBTITLE =
  "YouTube Studio tarzı özet; finans ve sinyal katmanı Marketly kimliğiyle birleşir. Liste ve metrikler repository katmanından gelir.";

function emptyAnalytics(timeframe: StudioTimeframe): StudioAnalyticsBundle {
  const len = timeframe === "7d" ? 7 : timeframe === "28d" ? 14 : 21;
  const z = (n: number) => Array.from({ length: n }, (_, i) => ({ label: `${i + 1}`, value: 0 }));
  return {
    summary: {
      totalViews: 0,
      viewsChangePercent: 0,
      watchTimeSeconds: 0,
      watchTimeChangePercent: 0,
      engagementScore: 0,
      engagementChangePercent: 0,
      followerCount: 0,
      followerGrowth7d: 0,
      signalCopyCount: 0,
      signalCopyChangePercent: 0,
      publishedContentCount: 0,
      publishedSubtitle: "Canlı veri bekleniyor",
    },
    timeframe,
    viewsSeries: z(len),
    watchTimeSeries: z(len),
    engagementSeries: z(len),
    followerSeries: z(len),
    audienceBreakdown: [],
    contentTypeBreakdown: [],
    topVideos: [],
    topPosts: [],
    topAssets: [],
  };
}

/**
 * Üretim: Supabase `posts`, `drafts`, `scheduled_posts`, `playlists`, `stream_schedules`, analytics RPC.
 * TODO: `getSupabaseBrowserClient()` + RLS uyumlu sorgular; şimdilik güvenli boş yanıtlar.
 */
export class SupabaseStudioRepository implements StudioRepository {
  resolveEffectiveOwnerId(authUserId: string): string {
    return authUserId;
  }

  getDashboardOverview(ownerId: string, local: StudioLocalMutations): StudioDashboardOverview {
    void ownerId;
    void local;
    return {
      totalViews: 0,
      followerGrowth7d: 0,
      engagementScore: 0,
      publishedCount: 0,
      draftCount: 0,
      scheduledCount: 0,
      estimatedRevenueUsd: null,
      metricHints: {
        totalViews: "TODO: analytics RPC",
        followerGrowth: "—",
        engagement: "—",
        published: "—",
      },
      recentPerformance: Array.from({ length: 7 }, (_, i) => ({ label: `Gün ${i + 1}`, value: 0 })),
      topContent: [],
      quickActions: STUDIO_QUICK_ACTIONS,
    };
  }

  getContentItems(ownerId: string, local: StudioLocalMutations): CreatorContentItem[] {
    void ownerId;
    void local;
    return [];
  }

  getAnalyticsBundle(ownerId: string, timeframe: StudioTimeframe): StudioAnalyticsBundle {
    void ownerId;
    return emptyAnalytics(timeframe);
  }

  getDrafts(ownerId: string, local: StudioLocalMutations): StudioDraftItem[] {
    void ownerId;
    void local;
    return [];
  }

  getScheduledPosts(ownerId: string, local: StudioLocalMutations): StudioScheduledItem[] {
    void ownerId;
    void local;
    return [];
  }

  getPlaylists(ownerId: string): StudioPlaylistItem[] {
    void ownerId;
    return [];
  }

  getPlaylistById(playlistId: string): StudioPlaylistItem | null {
    void playlistId;
    return null;
  }

  getLiveSchedule(ownerId: string): StudioLiveStreamItem[] {
    void ownerId;
    return [];
  }

  getShellNotice(): string | null {
    return "Canlı Creator Studio verisi henüz bağlı değil. Supabase repository implementasyonunu tamamlayın.";
  }

  getShellSubtitle(): string {
    return SHELL_SUBTITLE;
  }

  getCreatorEconomyHub(ownerId: string) {
    return assembleCreatorStudioEconomyHub(ownerId);
  }
}
