import { getPersonalizationRepository } from "@/features/personalization/repository";
import type { AffinityContext } from "@/features/personalization/domain/personalization-types";
import { getMockNotificationsForUser } from "@/mock/adapters/notifications";
import {
  getMockConversationsForUser,
  getMockSeedMessages,
  mockParticipantProfile,
} from "@/mock/adapters/messages";
import { getDefaultMockSettings } from "@/mock/adapters/settings-preferences";
import {
  buildCreatorCommunityRoomsSurface,
  buildCreatorRoomNotificationStrip,
  buildDiscoverCreatorRoomsRail,
  buildMessagingCreatorRoomDigest,
  buildSignalCreatorRoomLink,
  buildWatchCreatorRoomsContext,
  searchMockCreatorRoomHits,
} from "@/mock/adapters/social-creator-rooms-data";
import {
  buildAssetCommunityHub,
  buildCreatorTopicCommunities,
  buildDiscoverMarketTopicBridge,
  buildDiscoverTopicCommunitySurface,
  buildHomeTopicCommunityStrip,
  searchMockTopicCommunityHits,
} from "@/mock/adapters/social-community-data";
import {
  buildDiscoverDiscussionRail,
  buildMockPostCommentsList,
  buildPostDiscussionSidecar,
  mockAssetDiscussionTeasers,
  mockChannelDiscussionTeasers,
  mockSignalLinkedDiscussions,
  searchMockDiscussionHits,
} from "@/mock/adapters/social-discussion-data";
import {
  buildComposerPublishSummaryData,
  buildComposerThreadSeed,
  deleteComposerDraftData,
  listComposerDraftsData,
  pickActiveQuotePreview,
  saveComposerDraftData,
  searchComposerReferencesData,
} from "@/mock/adapters/social-composer-data";
import {
  buildCreatorDiscussionGravity,
  buildDiscussionDiscoverySurface,
  buildDiscussionSearchRecommendationChips,
  buildDiscussionThreadNetwork,
  buildPersonalizedDiscussionRecommendations,
} from "@/mock/adapters/social-discussion-discovery-data";
import { MOCK_PROFILE_BY_ID, MOCK_PROFILES } from "@/mock/fixtures/profiles";

import type { SocialRepository } from "./social-repository";
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
import type { PersonalizedDiscussionInput } from "./discussion-discovery-types";
import type { DiscussionReactionKind, DiscussionReactionTally, PostDiscussionContext, ThesisStance } from "./discussion-types";
import type {
  CloseFriend,
  Conversation,
  Message,
  ParticipantProfile,
  SettingsBundle,
  SettingsProfileSeed,
} from "./types";

const LS_READ = "marketly-mock-notifications-read-v1";
const LS_SENT = "marketly-mock-dm-sent-v1";
const LS_CONV = "marketly-mock-dm-conv-snapshot-v1";

type ConversationSnapshot = {
  updated_at?: string;
  last_message?: Conversation["last_message"];
  unread_count?: number;
};
const LS_SETTINGS = "marketly-mock-settings-bundle-v1";
const LS_CLOSE = "marketly-mock-close-friends-v1";
const LS_FOLLOW_THREAD = "marketly-mock-follow-thread-v1";
const LS_THESIS = "marketly-mock-thesis-stance-v1";
const LS_REACT_USER = "marketly-mock-disc-react-user-v1";
const LS_REACT_COUNT = "marketly-mock-disc-react-count-v1";

function hashPost(postId: string): number {
  let h = 0;
  for (let i = 0; i < postId.length; i++) h = (h * 31 + postId.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function seedTally(postId: string): DiscussionReactionTally {
  const h = hashPost(postId);
  return { insightful: 4 + (h % 8), thanks: 2 + (h % 4), debate: 1 + (h % 3) };
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* */
  }
}

function deepMerge<T extends object>(base: T, patch: Partial<T>): T {
  const out = { ...base } as Record<string, unknown>;
  for (const k of Object.keys(patch) as (keyof T)[]) {
    const pv = patch[k];
    if (pv == null) continue;
    const bv = out[k as string];
    if (bv && typeof bv === "object" && !Array.isArray(bv) && typeof pv === "object" && !Array.isArray(pv)) {
      out[k as string] = deepMerge(bv as object, pv as object);
    } else {
      out[k as string] = pv as unknown;
    }
  }
  return out as T;
}

export class MockSocialRepository implements SocialRepository {
  private settingsProfileSeedByUser = new Map<string, SettingsProfileSeed | null>();

  private effectiveSettingsBundle(userId: string): SettingsBundle {
    const seed = this.settingsProfileSeedByUser.get(userId) ?? null;
    const def = getDefaultMockSettings(seed);
    const saved = readJson<Partial<SettingsBundle> | null>(LS_SETTINGS, null);
    return saved ? deepMerge(def, saved) : def;
  }

  getNotifications(userId: string) {
    return getMockNotificationsForUser(userId);
  }

  getNotificationReadOverrides(): Record<string, string> {
    const o = readJson<unknown>(LS_READ, {});
    return o && typeof o === "object" && !Array.isArray(o) ? (o as Record<string, string>) : {};
  }

  markNotificationRead(_userId: string, notificationId: string): void {
    const next = { ...this.getNotificationReadOverrides(), [notificationId]: new Date().toISOString() };
    writeJson(LS_READ, next);
  }

  markAllNotificationsRead(userId: string): void {
    const next = { ...this.getNotificationReadOverrides() };
    const t = new Date().toISOString();
    for (const r of this.getNotifications(userId)) {
      const read = r.read_at ?? next[r.id];
      if (!read) next[r.id] = t;
    }
    writeJson(LS_READ, next);
  }

  private readConversationSnapshots(): Record<string, ConversationSnapshot> {
    const o = readJson<unknown>(LS_CONV, {});
    return o && typeof o === "object" && !Array.isArray(o) ? (o as Record<string, ConversationSnapshot>) : {};
  }

  private writeConversationSnapshots(next: Record<string, ConversationSnapshot>) {
    writeJson(LS_CONV, next);
  }

  getConversations(userId: string) {
    const base = getMockConversationsForUser(userId);
    const snap = this.readConversationSnapshots();
    const merged = base.map((c) => {
      const s = snap[c.id];
      if (!s) return c;
      return {
        ...c,
        updated_at: s.updated_at ?? c.updated_at,
        last_message: s.last_message ?? c.last_message,
        unread_count: typeof s.unread_count === "number" ? s.unread_count : c.unread_count,
      };
    });
    return merged.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  }

  markConversationOpened(_userId: string, conversationId: string): void {
    const snap = this.readConversationSnapshots();
    snap[conversationId] = { ...snap[conversationId], unread_count: 0 };
    this.writeConversationSnapshots(snap);
  }

  private readSent(): Record<string, Message[]> {
    const o = readJson<unknown>(LS_SENT, {});
    return o && typeof o === "object" && !Array.isArray(o) ? (o as Record<string, Message[]>) : {};
  }

  getConversationMessages(userId: string, conversationId: string): Message[] {
    const seed = getMockSeedMessages(conversationId, userId);
    const extra = this.readSent()[conversationId] ?? [];
    return [...seed, ...extra].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  sendMessage(userId: string, conversationId: string, content: string): void {
    const text = content.trim();
    if (!text) return;
    const row: Message = {
      id: `msg-local-${Date.now()}`,
      conversation_id: conversationId,
      sender_id: userId,
      content: text,
      created_at: new Date().toISOString(),
      read_at: new Date().toISOString(),
    };
    const all = this.readSent();
    const cur = all[conversationId] ?? [];
    writeJson(LS_SENT, { ...all, [conversationId]: [...cur, row] });

    const cSnap = this.readConversationSnapshots();
    cSnap[conversationId] = {
      ...cSnap[conversationId],
      updated_at: row.created_at,
      unread_count: 0,
      last_message: {
        id: row.id,
        sender_id: userId,
        content: text,
        created_at: row.created_at,
        read_at: row.read_at,
      },
    };
    this.writeConversationSnapshots(cSnap);
  }

  getSettings(userId: string, profileSeed: SettingsProfileSeed | null): SettingsBundle {
    this.settingsProfileSeedByUser.set(userId, profileSeed);
    return this.effectiveSettingsBundle(userId);
  }

  updateSettings(userId: string, patch: Partial<SettingsBundle>): SettingsBundle {
    const next = deepMerge(this.effectiveSettingsBundle(userId), patch);
    writeJson(LS_SETTINGS, next);
    return next;
  }

  resetSettings(userId: string): SettingsBundle {
    try {
      localStorage.removeItem(LS_SETTINGS);
    } catch {
      /* */
    }
    return this.getSettings(userId, this.settingsProfileSeedByUser.get(userId) ?? null);
  }

  getCloseFriends(userId: string): CloseFriend[] {
    void userId;
    const ids = readJson<string[] | null>(LS_CLOSE, null);
    const resolved = ids?.length ? ids : MOCK_PROFILES.slice(0, 6).map((p) => p.id);
    const out: CloseFriend[] = [];
    for (const id of resolved) {
      const p = MOCK_PROFILE_BY_ID[id];
      if (p) {
        out.push({
          id: p.id,
          username: p.username,
          full_name: p.full_name ?? null,
          avatar_url: p.avatar_url ?? null,
          verified: p.verified,
        });
      }
    }
    return out;
  }

  updateCloseFriends(userId: string, ids: string[]): void {
    void userId;
    writeJson(LS_CLOSE, ids);
  }

  getParticipantProfile(participantId: string): ParticipantProfile | null {
    const raw = mockParticipantProfile(participantId);
    if (!raw) return null;
    return {
      id: raw.id,
      username: raw.username,
      full_name: raw.full_name ?? null,
      avatar_url: raw.avatar_url ?? null,
      verified: raw.verified,
    };
  }

  listPostComments(postId: string) {
    return buildMockPostCommentsList(postId);
  }

  getPostDiscussionSidecar(postId: string, ctx: PostDiscussionContext) {
    return buildPostDiscussionSidecar(postId, ctx);
  }

  private readFollowMap(): Record<string, string[]> {
    const o = readJson<unknown>(LS_FOLLOW_THREAD, {});
    return o && typeof o === "object" && !Array.isArray(o) ? (o as Record<string, string[]>) : {};
  }

  isFollowingThread(userId: string | null, postId: string): boolean {
    if (!userId) return false;
    const m = this.readFollowMap();
    return (m[userId] ?? []).includes(postId);
  }

  setFollowingThread(userId: string, postId: string, on: boolean): void {
    const m = { ...this.readFollowMap() };
    const cur = new Set(m[userId] ?? []);
    if (on) cur.add(postId);
    else cur.delete(postId);
    m[userId] = [...cur];
    writeJson(LS_FOLLOW_THREAD, m);
  }

  private thesisKey(userId: string, postId: string) {
    return `${userId}::${postId}`;
  }

  private readThesisMap(): Record<string, ThesisStance> {
    const o = readJson<unknown>(LS_THESIS, {});
    return o && typeof o === "object" && !Array.isArray(o) ? (o as Record<string, ThesisStance>) : {};
  }

  getDiscussionThesisStance(userId: string | null, postId: string): ThesisStance | null {
    if (!userId) return null;
    return this.readThesisMap()[this.thesisKey(userId, postId)] ?? null;
  }

  setDiscussionThesisStance(userId: string, postId: string, stance: ThesisStance): void {
    const next = { ...this.readThesisMap(), [this.thesisKey(userId, postId)]: stance };
    writeJson(LS_THESIS, next);
  }

  getDiscoverDiscussionIntelligence() {
    return buildDiscoverDiscussionRail();
  }

  searchDiscussionHits(query: string, limit = 24) {
    return searchMockDiscussionHits(query, limit);
  }

  getDiscussionDiscoverySurface() {
    return buildDiscussionDiscoverySurface();
  }

  getPersonalizedDiscussionRecommendations(
    input: PersonalizedDiscussionInput,
    affinityOverride?: AffinityContext | null,
  ) {
    const affinity =
      affinityOverride === undefined ? getPersonalizationRepository().getAffinityContext() : affinityOverride;
    return buildPersonalizedDiscussionRecommendations(input, affinity);
  }

  getDiscussionThreadNetwork(anchorPostId: string) {
    return buildDiscussionThreadNetwork(anchorPostId);
  }

  getCreatorDiscussionGravity(limit?: number) {
    return buildCreatorDiscussionGravity(limit ?? 8);
  }

  getDiscussionSearchRecommendationChips(query: string | null) {
    return buildDiscussionSearchRecommendationChips(query);
  }

  getSignalLinkedDiscussions(signalId: string) {
    return mockSignalLinkedDiscussions(signalId);
  }

  getAssetDiscussionTeasers(assetTag: string) {
    return mockAssetDiscussionTeasers(assetTag);
  }

  getChannelDiscussionTeasers(channelUserId: string) {
    return mockChannelDiscussionTeasers(channelUserId);
  }

  getDiscoverTopicCommunitySurface() {
    return buildDiscoverTopicCommunitySurface();
  }

  getDiscoverMarketTopicBridge() {
    return buildDiscoverMarketTopicBridge();
  }

  getHomeTopicCommunityStrip() {
    return buildHomeTopicCommunityStrip();
  }

  getAssetCommunityHub(symbol: string) {
    return buildAssetCommunityHub(symbol);
  }

  searchTopicCommunityHits(query: string, limit = 24) {
    return searchMockTopicCommunityHits(query, limit);
  }

  getCreatorTopicCommunities(channelUserId: string) {
    return buildCreatorTopicCommunities(channelUserId);
  }

  getCreatorCommunityRoomsSurface(channelUserId: string) {
    return buildCreatorCommunityRoomsSurface(channelUserId);
  }

  getDiscoverCreatorRoomsRail() {
    return buildDiscoverCreatorRoomsRail();
  }

  searchCreatorRoomHits(query: string, limit = 20) {
    return searchMockCreatorRoomHits(query, limit);
  }

  getSignalCreatorRoomLink(signalId: string) {
    return buildSignalCreatorRoomLink(signalId);
  }

  getWatchCreatorRoomsContext(assetTag: string) {
    return buildWatchCreatorRoomsContext(assetTag);
  }

  getCreatorRoomNotificationStrip(userId: string | null) {
    return buildCreatorRoomNotificationStrip(userId);
  }

  getMessagingCreatorRoomDigest(userId: string | null) {
    return buildMessagingCreatorRoomDigest(userId);
  }

  getPostDiscussionReactions(postId: string): DiscussionReactionTally {
    const base = seedTally(postId);
    const deltas = readJson<Record<string, Partial<DiscussionReactionTally>>>(LS_REACT_COUNT, {});
    const d = deltas[postId] ?? {};
    return {
      insightful: base.insightful + (d.insightful ?? 0),
      thanks: base.thanks + (d.thanks ?? 0),
      debate: base.debate + (d.debate ?? 0),
    };
  }

  toggleDiscussionReaction(userId: string, postId: string, kind: DiscussionReactionKind): DiscussionReactionTally {
    const userMap = readJson<Record<string, DiscussionReactionKind | "">>(LS_REACT_USER, {});
    const prevKey = `${postId}::${userId}`;
    const prev = userMap[prevKey] ?? "";
    const deltas = readJson<Record<string, Partial<DiscussionReactionTally>>>(LS_REACT_COUNT, {});
    const d = { ...(deltas[postId] ?? {}) };
    if (prev === kind) {
      d[kind] = Math.max(0, (d[kind] ?? 0) - 1);
      userMap[prevKey] = "";
    } else {
      if (prev) d[prev] = Math.max(0, (d[prev] ?? 0) - 1);
      d[kind] = (d[kind] ?? 0) + 1;
      userMap[prevKey] = kind;
    }
    writeJson(LS_REACT_COUNT, { ...deltas, [postId]: d });
    writeJson(LS_REACT_USER, userMap);
    return this.getPostDiscussionReactions(postId);
  }

  getComposerIntentOptions(): ComposerIntentOption[] {
    return [...COMPOSER_INTENT_OPTIONS];
  }

  getComposerQuotePreview(params: ComposerQuotePreviewParams): ComposerQuotePreview | null {
    return pickActiveQuotePreview(params.quotedPostId ?? null, params.quotedSignalId ?? null, params.discussionAnchorPostId ?? null);
  }

  getComposerThreadContinuationSeed(replyToPostId: string | null): ComposerThreadSeed | null {
    return buildComposerThreadSeed(replyToPostId);
  }

  searchComposerReferences(query: string, limit = 14): ComposerReferenceHit[] {
    return searchComposerReferencesData(query, limit);
  }

  listComposerDrafts(userId: string): ComposerDraft[] {
    return listComposerDraftsData(userId);
  }

  saveComposerDraft(userId: string, payload: ComposerDraftPayload, label?: string): ComposerDraft {
    return saveComposerDraftData(userId, payload, label);
  }

  deleteComposerDraft(userId: string, draftId: string): boolean {
    return deleteComposerDraftData(userId, draftId);
  }

  buildComposerPublishSummary(input: ComposerPublishSummaryInput): ComposerPublishSummary {
    return buildComposerPublishSummaryData(input);
  }
}
