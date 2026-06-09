import { getDiscussionRecommendationsCache } from "@/features/social/discussion-recommendations-cache";
import { AlgoFlags } from "@/lib/algo-flags";
import { getDefaultMockSettings } from "@/mock/adapters/settings-preferences";

import type { AffinityContext } from "@/features/personalization/domain/personalization-types";
import type { PostCommentRow } from "@/features/post/types";

import type { SocialRepository } from "./social-repository";
import type {
  AssetCommunityHubBundle,
  CommunitySearchHit,
  DiscoverMarketTopicBridge,
  DiscoverTopicCommunitySurface,
  HomeTopicCommunityStrip,
  TopicCommunitySummary,
} from "./community-types";
import type {
  AssetDiscussionTeaser,
  ChannelDiscussionTeaser,
  DiscoverDiscussionRail,
  DiscussionReactionKind,
  DiscussionReactionTally,
  DiscussionSearchHit,
  PostDiscussionContext,
  PostDiscussionSidecar,
  SignalLinkedDiscussionTeaser,
  ThesisStance,
} from "./discussion-types";
import type {
  CreatorDiscussionGravityRow,
  DiscussionDiscoverySurface,
  DiscussionRecommendationChip,
  DiscussionThreadNetwork,
  PersonalizedDiscussionInput,
  PersonalizedDiscussionPack,
} from "./discussion-discovery-types";
import type {
  CreatorCommunityRoomsSurface,
  CreatorRoomNotificationStripItem,
  CreatorRoomSearchHit,
  DiscoverCreatorRoomsRail,
  MessagingCreatorRoomDigestItem,
  SignalCreatorRoomLink,
  WatchCreatorRoomsContext,
} from "./creator-room-types";
import type { CloseFriend, Conversation, Message, NotificationItem, ParticipantProfile, SettingsBundle } from "./types";
import {
  COMPOSER_INTENT_OPTIONS,
  type ComposerDraft,
  type ComposerDraftPayload,
  type ComposerIntentOption,
  type ComposerPublishSummary,
  type ComposerPublishSummaryInput,
  type ComposerQuotePreview,
  type ComposerQuotePreviewParams,
  type ComposerReferenceHit,
  type ComposerThreadSeed,
} from "./composer-types";

const EMPTY_DISCUSSION_SIDECAR: PostDiscussionSidecar = {
  summary: null,
  continuationHref: null,
  timelineRows: [],
  relatedPosts: [],
  relatedSignals: [],
  activeParticipants: [],
  networkHints: [],
};

const EMPTY_RAIL: DiscoverDiscussionRail = {
  activeThreads: [],
  trendingTopics: [],
  creatorActive: [],
};

const EMPTY_DISCOVERY_SURFACE: DiscussionDiscoverySurface = {
  headline: "Tartışma keşfi",
  subline: "Canlı veri bağlandığında öneriler burada görünecek.",
  trending: [],
  rising: [],
  creator_active: [],
  active_debates: [],
  market_moving: [],
  signal_linked_chain: [],
  macro_chains: [],
  fast_growing: [],
};

const EMPTY_PERSONALIZED: PersonalizedDiscussionPack = {
  for_you: [],
  watchlist: [],
  followed_creators: [],
  portfolio: [],
  room_suggestions: [],
  topic_suggestions: [],
};

const EMPTY_TALLY: DiscussionReactionTally = { insightful: 0, thanks: 0, debate: 0 };

const EMPTY_TOPIC_SURFACE: DiscoverTopicCommunitySurface = {
  intelligenceHeadline: "",
  trending: [],
  rising: [],
  creatorHeavy: [],
  fastestGrowing: [],
  premiumHints: [],
  macroDebateTopics: [],
};

const EMPTY_TOPIC_BRIDGE: DiscoverMarketTopicBridge = { crossAssetChains: [], topicChips: [] };

const EMPTY_HOME_TOPIC_STRIP: HomeTopicCommunityStrip = {
  trending_chips: [],
  rising_chips: [],
  creator_lane: [],
};

const EMPTY_CREATOR_ROOMS_SURFACE: CreatorCommunityRoomsSurface = {
  creator_id: "",
  rooms: [],
  feed: [],
  pinned_notes: [],
  top_participants: [],
  intelligence: {
    active_members_label: "",
    heat_peak_label: "",
    topic_overlap_label: "",
    premium_participation_label: "",
    related_room_labels: [],
  },
  network: [],
};

const EMPTY_DISCOVER_CREATOR_RAIL: DiscoverCreatorRoomsRail = {
  headline: "",
  spotlight: [],
  collaboration_chips: [],
};

/**
 * Canlı backend henüz bağlı değil — sayfalar boş / varsayılan ile kırılmaz.
 * TODO: `notifications` select/update RPC; `conversations` + `messages`; `user_settings` JSON;
 * TODO: `close_friends` edge list; profil JOIN `getParticipantProfile` → `profiles` tek satır.
 */
export class SupabaseSocialRepository implements SocialRepository {
  private settingsSession = new Map<string, SettingsBundle>();
  private settingsProfileSeedByUser = new Map<string, Parameters<SocialRepository["getSettings"]>[1]>();

  getNotifications(userId: string): NotificationItem[] {
    void userId;
    return [];
  }

  getNotificationReadOverrides(): Record<string, string> {
    return {};
  }

  markNotificationRead(userId: string, notificationId: string): void {
    void userId;
    void notificationId;
    /* TODO: PATCH notification read_at */
  }

  markAllNotificationsRead(userId: string): void {
    void userId;
    /* TODO: bulk mark read */
  }

  getConversations(userId: string): Conversation[] {
    void userId;
    return [];
  }

  getConversationMessages(userId: string, conversationId: string): Message[] {
    void userId;
    void conversationId;
    return [];
  }

  sendMessage(userId: string, conversationId: string, content: string): void {
    void userId;
    void conversationId;
    void content;
    /* TODO: insert dm row + realtime */
  }

  markConversationOpened(userId: string, conversationId: string): void {
    void userId;
    void conversationId;
    /* TODO: mark dm thread read */
  }

  getSettings(userId: string, profileSeed: Parameters<SocialRepository["getSettings"]>[1]): SettingsBundle {
    this.settingsProfileSeedByUser.set(userId, profileSeed);
    return this.settingsSession.get(userId) ?? getDefaultMockSettings(profileSeed);
  }

  updateSettings(userId: string, patch: Partial<SettingsBundle>): SettingsBundle {
    const seed = this.settingsProfileSeedByUser.get(userId) ?? null;
    const cur = this.getSettings(userId, seed);
    const next: SettingsBundle = {
      ...cur,
      ...patch,
      profile: patch.profile ? { ...cur.profile, ...patch.profile } : cur.profile,
      notifications: patch.notifications ? { ...cur.notifications, ...patch.notifications } : cur.notifications,
      privacy: patch.privacy ? { ...cur.privacy, ...patch.privacy } : cur.privacy,
      appearance: patch.appearance ? { ...cur.appearance, ...patch.appearance } : cur.appearance,
      security: patch.security ? { ...cur.security, ...patch.security } : cur.security,
    };
    this.settingsSession.set(userId, next);
    return next;
  }

  resetSettings(userId: string): SettingsBundle {
    this.settingsSession.delete(userId);
    const seed = this.settingsProfileSeedByUser.get(userId) ?? null;
    return this.getSettings(userId, seed);
  }

  getCloseFriends(userId: string): CloseFriend[] {
    void userId;
    return [];
  }

  updateCloseFriends(userId: string, ids: string[]): void {
    void userId;
    void ids;
    /* TODO: replace close friend edges */
  }

  getParticipantProfile(participantId: string): ParticipantProfile | null {
    void participantId;
    return null;
  }

  listPostComments(postId: string): PostCommentRow[] {
    void postId;
    return [];
  }

  getPostDiscussionSidecar(postId: string, ctx: PostDiscussionContext): PostDiscussionSidecar {
    void postId;
    void ctx;
    return { ...EMPTY_DISCUSSION_SIDECAR };
  }

  isFollowingThread(userId: string | null, postId: string): boolean {
    void userId;
    void postId;
    return false;
  }

  setFollowingThread(userId: string, postId: string, on: boolean): void {
    void userId;
    void postId;
    void on;
  }

  getDiscussionThesisStance(userId: string | null, postId: string): ThesisStance | null {
    void userId;
    void postId;
    return null;
  }

  setDiscussionThesisStance(userId: string, postId: string, stance: ThesisStance): void {
    void userId;
    void postId;
    void stance;
  }

  getDiscoverDiscussionIntelligence(): DiscoverDiscussionRail {
    return { ...EMPTY_RAIL };
  }

  searchDiscussionHits(query: string, limit?: number): DiscussionSearchHit[] {
    void query;
    void limit;
    return [];
  }

  getDiscussionDiscoverySurface(): DiscussionDiscoverySurface {
    return { ...EMPTY_DISCOVERY_SURFACE };
  }

  getPersonalizedDiscussionRecommendations(
    input: PersonalizedDiscussionInput,
    _affinityOverride?: AffinityContext | null,
  ): PersonalizedDiscussionPack {
    void _affinityOverride;
    if (AlgoFlags.discussionRecommendations) {
      const cached = getDiscussionRecommendationsCache(input.viewerId);
      const hasAny =
        cached.for_you.length +
          cached.watchlist.length +
          cached.followed_creators.length +
          cached.portfolio.length >
        0;
      if (hasAny) return cached;
    }
    return { ...EMPTY_PERSONALIZED };
  }

  getDiscussionThreadNetwork(anchorPostId: string): DiscussionThreadNetwork | null {
    void anchorPostId;
    return null;
  }

  getCreatorDiscussionGravity(limit?: number): CreatorDiscussionGravityRow[] {
    void limit;
    return [];
  }

  getDiscussionSearchRecommendationChips(query: string | null): DiscussionRecommendationChip[] {
    void query;
    return [];
  }

  getSignalLinkedDiscussions(signalId: string): SignalLinkedDiscussionTeaser[] {
    void signalId;
    return [];
  }

  getAssetDiscussionTeasers(assetTag: string): AssetDiscussionTeaser[] {
    void assetTag;
    return [];
  }

  getChannelDiscussionTeasers(channelUserId: string): ChannelDiscussionTeaser[] {
    void channelUserId;
    return [];
  }

  getDiscoverTopicCommunitySurface(): DiscoverTopicCommunitySurface {
    return { ...EMPTY_TOPIC_SURFACE };
  }

  getDiscoverMarketTopicBridge(): DiscoverMarketTopicBridge {
    return { ...EMPTY_TOPIC_BRIDGE, crossAssetChains: [], topicChips: [] };
  }

  getHomeTopicCommunityStrip(): HomeTopicCommunityStrip {
    return { ...EMPTY_HOME_TOPIC_STRIP };
  }

  getAssetCommunityHub(symbol: string): AssetCommunityHubBundle | null {
    void symbol;
    return null;
  }

  searchTopicCommunityHits(query: string, limit?: number): CommunitySearchHit[] {
    void query;
    void limit;
    return [];
  }

  getCreatorTopicCommunities(channelUserId: string): TopicCommunitySummary[] {
    void channelUserId;
    return [];
  }

  getCreatorCommunityRoomsSurface(channelUserId: string): CreatorCommunityRoomsSurface {
    return { ...EMPTY_CREATOR_ROOMS_SURFACE, creator_id: channelUserId };
  }

  getDiscoverCreatorRoomsRail(): DiscoverCreatorRoomsRail {
    return { ...EMPTY_DISCOVER_CREATOR_RAIL };
  }

  searchCreatorRoomHits(query: string, limit?: number): CreatorRoomSearchHit[] {
    void query;
    void limit;
    return [];
  }

  getSignalCreatorRoomLink(signalId: string): SignalCreatorRoomLink | null {
    void signalId;
    return null;
  }

  getWatchCreatorRoomsContext(assetTag: string): WatchCreatorRoomsContext {
    void assetTag;
    return { lines: [] };
  }

  getCreatorRoomNotificationStrip(userId: string | null): CreatorRoomNotificationStripItem[] {
    void userId;
    return [];
  }

  getMessagingCreatorRoomDigest(userId: string | null): MessagingCreatorRoomDigestItem[] {
    void userId;
    return [];
  }

  getPostDiscussionReactions(postId: string): DiscussionReactionTally {
    void postId;
    return { ...EMPTY_TALLY };
  }

  toggleDiscussionReaction(userId: string, postId: string, kind: DiscussionReactionKind): DiscussionReactionTally {
    void userId;
    void postId;
    void kind;
    return { ...EMPTY_TALLY };
  }

  getComposerIntentOptions(): ComposerIntentOption[] {
    return [...COMPOSER_INTENT_OPTIONS];
  }

  getComposerQuotePreview(params: ComposerQuotePreviewParams): ComposerQuotePreview | null {
    void params;
    return null;
  }

  getComposerThreadContinuationSeed(replyToPostId: string | null): ComposerThreadSeed | null {
    void replyToPostId;
    return null;
  }

  searchComposerReferences(query: string, limit?: number): ComposerReferenceHit[] {
    void query;
    void limit;
    return [];
  }

  listComposerDrafts(userId: string): ComposerDraft[] {
    void userId;
    return [];
  }

  saveComposerDraft(userId: string, payload: ComposerDraftPayload, label?: string): ComposerDraft {
    return {
      id: `local-${Date.now()}`,
      userId,
      updatedAt: new Date().toISOString(),
      label: label?.trim() || "Taslak",
      payload,
    };
  }

  deleteComposerDraft(userId: string, draftId: string): boolean {
    void userId;
    void draftId;
    return false;
  }

  buildComposerPublishSummary(input: ComposerPublishSummaryInput): ComposerPublishSummary {
    const intentLabel = input.intentId
      ? COMPOSER_INTENT_OPTIONS.find((o) => o.id === input.intentId)?.label ?? input.intentId
      : "Genel yayın";
    const lines = [`Niyet: ${intentLabel}`, `Tür: ${input.contentKind}`];
    if (input.titlePreview?.trim()) lines.push(`Başlık: ${input.titlePreview.trim().slice(0, 80)}`);
    if (input.assetTag?.trim()) lines.push(`Varlık: #${input.assetTag.trim().toUpperCase()}`);
    if (input.quotedPostId) lines.push(`Alıntı gönderi: ${input.quotedPostId}`);
    if (input.replyToPostId) lines.push(`Zincir üstü: ${input.replyToPostId}`);
    const aud = input.circleAudienceId?.trim();
    if (aud && aud !== "public") lines.push(`Hedef daire: ${aud}`);
    else lines.push("Hedef kitle: genel akış");
    const warnings: string[] = [];
    if (!input.contentPreview.trim()) warnings.push("İçerik boş.");
    return { lines, warnings };
  }
}
