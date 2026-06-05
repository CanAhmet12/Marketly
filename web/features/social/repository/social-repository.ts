import type { PostCommentRow } from "@/features/post/types";

import type {
  ComposerDraft,
  ComposerDraftPayload,
  ComposerIntentOption,
  ComposerPublishSummary,
  ComposerPublishSummaryInput,
  ComposerQuotePreview,
  ComposerQuotePreviewParams,
  ComposerReferenceHit,
  ComposerThreadSeed,
} from "./composer-types";
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
import type {
  CloseFriend,
  Conversation,
  Message,
  NotificationItem,
  ParticipantProfile,
  SettingsBundle,
  SettingsProfileSeed,
} from "./types";

import type { AffinityContext } from "@/features/personalization/domain/personalization-types";

export type {
  ComposerDraft,
  ComposerDraftPayload,
  ComposerIntentId,
  ComposerIntentOption,
  ComposerPublishSummary,
  ComposerPublishSummaryInput,
  ComposerQuoteKind,
  ComposerQuotePreview,
  ComposerQuotePreviewParams,
  ComposerReferenceHit,
  ComposerReferenceKind,
  ComposerThreadSeed,
} from "./composer-types";
export type {
  AssetCommunityHubBundle,
  CommunitySearchHit,
  DiscoverMarketTopicBridge,
  DiscoverTopicCommunitySurface,
  HomeTopicCommunityStrip,
  TopicCommunitySummary,
} from "./community-types";
export type {
  CreatorDiscussionGravityRow,
  DiscussionDiscoveryRow,
  DiscussionDiscoverySurface,
  DiscussionDiscoveryTier,
  DiscussionEngagementQuality,
  DiscussionIntelMetrics,
  DiscussionRecommendationChip,
  DiscussionThreadEdge,
  DiscussionThreadNetwork,
  DiscussionThreadNetworkNode,
  PersonalizedDiscussionInput,
  PersonalizedDiscussionPack,
  PersonalizedDiscussionRow,
} from "./discussion-discovery-types";
export type {
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
export type {
  CreatorCommunityRoomsSurface,
  CreatorRoomNotificationStripItem,
  CreatorRoomSearchHit,
  DiscoverCreatorRoomsRail,
  MessagingCreatorRoomDigestItem,
  SignalCreatorRoomLink,
  WatchCreatorRoomsContext,
} from "./creator-room-types";
export type {
  CloseFriend,
  Conversation,
  Message,
  NotificationItem,
  ParticipantProfile,
  SettingsBundle,
  SettingsProfileSeed,
} from "./types";

/**
 * Bildirimler, DM, ayarlar, yakın arkadaşlar — UI yalnızca bu sözleşmeye bağlanır.
 * Tartışma katmanı (mock + canlı iskelet) — gönderi yorumları ve zekâ rayları.
 * TODO(Supabase): notifications, messages, user_settings, close_friends tabloları + RLS.
 */
export type SocialRepository = {
  getNotifications(userId: string): NotificationItem[];
  /** Okundu çizgisi — mock’ta localStorage; canlıda sunucu read_at ile değişir */
  getNotificationReadOverrides(): Record<string, string>;
  markNotificationRead(userId: string, notificationId: string): void;
  markAllNotificationsRead(userId: string): void;

  getConversations(userId: string): Conversation[];
  getConversationMessages(userId: string, conversationId: string): Message[];
  sendMessage(userId: string, conversationId: string, content: string): void;
  /** Mock: sohbet açılınca okunmamış sıfırlanır; canlıda RPC */
  markConversationOpened(userId: string, conversationId: string): void;

  getSettings(userId: string, profileSeed: SettingsProfileSeed | null): SettingsBundle;
  updateSettings(userId: string, patch: Partial<SettingsBundle>): SettingsBundle;
  /** Mock: localStorage sıfırlama; Supabase: oturum içi taslak temizleme */
  resetSettings(userId: string): SettingsBundle;

  getCloseFriends(userId: string): CloseFriend[];
  updateCloseFriends(userId: string, ids: string[]): void;

  getParticipantProfile(participantId: string): ParticipantProfile | null;

  /** Mock: zengin thread; canlıda `comments` sorgusu ile doldurulacak */
  listPostComments(postId: string): PostCommentRow[];

  getPostDiscussionSidecar(postId: string, ctx: PostDiscussionContext): PostDiscussionSidecar;

  isFollowingThread(userId: string | null, postId: string): boolean;
  setFollowingThread(userId: string, postId: string, on: boolean): void;

  getDiscussionThesisStance(userId: string | null, postId: string): ThesisStance | null;
  setDiscussionThesisStance(userId: string, postId: string, stance: ThesisStance): void;

  getDiscoverDiscussionIntelligence(): DiscoverDiscussionRail;

  searchDiscussionHits(query: string, limit?: number): DiscussionSearchHit[];

  getDiscussionDiscoverySurface(): DiscussionDiscoverySurface;
  getPersonalizedDiscussionRecommendations(
    input: PersonalizedDiscussionInput,
    /** SSR/hidrasyon: `usePersonalizationSnapshot().affinity` ile aynı kaynak */
    affinityOverride?: AffinityContext | null,
  ): PersonalizedDiscussionPack;
  getDiscussionThreadNetwork(anchorPostId: string): DiscussionThreadNetwork | null;
  getCreatorDiscussionGravity(limit?: number): CreatorDiscussionGravityRow[];
  getDiscussionSearchRecommendationChips(query: string | null): DiscussionRecommendationChip[];

  getSignalLinkedDiscussions(signalId: string): SignalLinkedDiscussionTeaser[];

  getAssetDiscussionTeasers(assetTag: string): AssetDiscussionTeaser[];

  getChannelDiscussionTeasers(channelUserId: string): ChannelDiscussionTeaser[];

  getDiscoverTopicCommunitySurface(): DiscoverTopicCommunitySurface;

  getDiscoverMarketTopicBridge(): DiscoverMarketTopicBridge;

  getHomeTopicCommunityStrip(): HomeTopicCommunityStrip;

  getAssetCommunityHub(symbol: string): AssetCommunityHubBundle | null;

  searchTopicCommunityHits(query: string, limit?: number): CommunitySearchHit[];

  getCreatorTopicCommunities(channelUserId: string): TopicCommunitySummary[];

  getCreatorCommunityRoomsSurface(channelUserId: string): CreatorCommunityRoomsSurface;

  getDiscoverCreatorRoomsRail(): DiscoverCreatorRoomsRail;

  searchCreatorRoomHits(query: string, limit?: number): CreatorRoomSearchHit[];

  getSignalCreatorRoomLink(signalId: string): SignalCreatorRoomLink | null;

  getWatchCreatorRoomsContext(assetTag: string): WatchCreatorRoomsContext;

  getCreatorRoomNotificationStrip(userId: string | null): CreatorRoomNotificationStripItem[];

  getMessagingCreatorRoomDigest(userId: string | null): MessagingCreatorRoomDigestItem[];

  getPostDiscussionReactions(postId: string): DiscussionReactionTally;
  toggleDiscussionReaction(userId: string, postId: string, kind: DiscussionReactionKind): DiscussionReactionTally;

  /** Yayın kompozisyonu — mock: zengin; canlı: kademeli doldurulacak */
  getComposerIntentOptions(): ComposerIntentOption[];
  getComposerQuotePreview(params: ComposerQuotePreviewParams): ComposerQuotePreview | null;
  getComposerThreadContinuationSeed(replyToPostId: string | null): ComposerThreadSeed | null;
  searchComposerReferences(query: string, limit?: number): ComposerReferenceHit[];
  listComposerDrafts(userId: string): ComposerDraft[];
  saveComposerDraft(userId: string, payload: ComposerDraftPayload, label?: string): ComposerDraft;
  deleteComposerDraft(userId: string, draftId: string): boolean;
  buildComposerPublishSummary(input: ComposerPublishSummaryInput): ComposerPublishSummary;
};
