"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";

import { useAuth } from "@/features/auth/use-auth";
import { fetchChannelPosts } from "@/features/channel/fetch-channel-posts";
import { fetchChannelProfile } from "@/features/channel/fetch-channel-profile";
import { fetchChannelSignals } from "@/features/channel/fetch-channel-signals";
import { deleteFollow, fetchFollowState, insertFollow } from "@/features/channel/fetch-follow";
import type { ChannelPost, ChannelSignal, ChannelTabId, FollowState } from "@/features/channel/types";
import {
  fmtCount,
  isFeedPostType,
  isShortType,
  isVideoTabType,
  isLiveType,
  resolveVideoUrl,
  tierChip,
} from "@/features/channel/channel-display-helpers";
import { ChannelSkeleton, PostListCard } from "@/features/channel/channel-page-parts";
import { CreatorCommunityRoomsPanel } from "@/features/social/components/creator-community-rooms-panel";
import { CreatorDiscussionGravityStrip } from "@/features/social/components/creator-discussion-gravity-strip";
import { ChannelMarketCommunityInset } from "@/features/markets/components/channel-market-community-inset";
import { channelPostToFeedPost } from "@/features/channel/channel-to-feed-adapter";
import { PulseCard } from "@/features/discover/cards/PulseCard";
import { VideoCard } from "@/features/discover/cards/VideoCard";
import { LiveCard } from "@/features/discover/cards/LiveCard";
import { UnifiedSignalCompactCard } from "@/features/signals/components/unified-signal-primitives";
import { mapSignalsPageRowToFeedRow } from "@/features/signals/lib/map-page-row-to-feed-row";
import { analystBadgeLabelTr } from "@/features/signals/intelligence/badge-labels";
import { getSignalsRepository } from "@/features/signals/repository";
import { getSocialRepository } from "@/features/social/repository";
import { getStudioRepository } from "@/features/studio/repository";
import { EmptyState } from "@/components/states";
import { avatarUrl as fallbackAvatar } from "@/lib/avatar-url";
import { queryKeys } from "@/lib/query-keys";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { mockChannelPosts, mockChannelProfile, mockChannelSignals, mockFollowState } from "@/mock/adapters/channel";
import { displayAssetNameForSymbol } from "@/mock/adapters/signals-source";
import { isMockDataEnabled } from "@/mock/config";
import { trackCreatorView } from "@/features/personalization/tracking";
import { RecommendationNetworkRails } from "@/features/personalization/components/recommendation-network-rails";
import { cn } from "@/lib/cn";
import type { HomeEngagementHandlers } from "@/features/home/home-engagement";

/* ───────────────────────────────────────────────── constants */

const EMPTY_POSTS: ChannelPost[]   = [];
const EMPTY_SIGNALS: ChannelSignal[] = [];
const EMPTY_FOLLOW: FollowState    = { isFollowing: false, followersCount: 0, followingCount: 0 };

const TABS: { id: ChannelTabId; label: string }[] = [
  { id: "overview",     label: "Ana Sayfa" },
  { id: "posts",        label: "Gönderiler" },
  { id: "discussions",  label: "Tartışma" },
  { id: "rooms",        label: "Odalar" },
  { id: "signals",      label: "Sinyaller" },
  { id: "videos",       label: "Videolar" },
  { id: "pulse",        label: "Pulse" },
  { id: "live",         label: "Canlı" },
  { id: "playlists",    label: "Listeler" },
  { id: "about",        label: "Hakkında" },
];

const TAB_ORDER: ChannelTabId[] = TABS.map((t) => t.id);

function resolveChannelTab(raw: string | null, fallback?: ChannelTabId): ChannelTabId {
  const normalized = raw === "shorts" ? "pulse" : raw;
  if (normalized && TAB_ORDER.includes(normalized as ChannelTabId)) {
    return normalized as ChannelTabId;
  }
  return fallback ?? "overview";
}

type Props = { channelUserId: string; initialTab?: ChannelTabId };

/* ───────────────────────────────────────────────── helpers */

function SectionHeader({
  title, onMore,
}: { title: string; onMore?: () => void }) {
  return (
    <div className="ch-section-header">
      <span className="ch-section-title">{title}</span>
      {onMore && (
        <button type="button" className="ch-section-more" onClick={onMore}>
          Tümünü gör →
        </button>
      )}
    </div>
  );
}

/* ───────────────────────────────────────────────── main component */

export function ChannelPageClient({ channelUserId, initialTab }: Props) {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get("tab");
  const roomFocusParam = searchParams.get("room");
  const qc   = useQueryClient();
  const { user, isInitialized, configError } = useAuth();
  const viewerId = user?.id ?? null;
  const isOwn    = Boolean(viewerId && viewerId === channelUserId);

  const tab = resolveChannelTab(rawTab, initialTab);
  const tabRefs = useRef<Partial<Record<ChannelTabId, HTMLButtonElement | null>>>({});
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [followErr, setFollowErr] = useState<string | null>(null);

  useEffect(() => {
    if (rawTab !== "shorts") return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "pulse");
    router.replace(`/channel/${encodeURIComponent(channelUserId)}?${params.toString()}`, { scroll: false });
  }, [rawTab, channelUserId, router, searchParams]);

  const selectTab = useCallback(
    (id: ChannelTabId) => {
      contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      const params = new URLSearchParams();
      if (id !== "overview") params.set("tab", id);
      if (id === "rooms" && roomFocusParam) params.set("room", roomFocusParam);
      const qs = params.toString();
      router.replace(
        qs ? `/channel/${encodeURIComponent(channelUserId)}?${qs}` : `/channel/${encodeURIComponent(channelUserId)}`,
        { scroll: false },
      );
    },
    [channelUserId, roomFocusParam, router],
  );

  const onTabKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>, current: ChannelTabId) => {
      const idx = TAB_ORDER.indexOf(current);
      if (idx < 0) return;
      let nextIdx = idx;
      if (e.key === "ArrowRight") nextIdx = (idx + 1) % TAB_ORDER.length;
      else if (e.key === "ArrowLeft") nextIdx = (idx - 1 + TAB_ORDER.length) % TAB_ORDER.length;
      else return;
      e.preventDefault();
      const next = TAB_ORDER[nextIdx]!;
      tabRefs.current[next]?.focus();
      selectTab(next);
    },
    [selectTab],
  );

  /* ── queries ── */
  const profileQuery = useQuery({
    queryKey: queryKeys.channelProfile(channelUserId),
    enabled: (isMockDataEnabled() || (isInitialized && isSupabaseConfigured())) && Boolean(channelUserId),
    queryFn: async () => {
      if (isMockDataEnabled()) return mockChannelProfile(channelUserId);
      return fetchChannelProfile(getSupabaseBrowserClient(), channelUserId);
    },
  });

  const profile = profileQuery.data;

  useEffect(() => {
    if (!profile) return;
    trackCreatorView(profile.id, "channel_profile");
  }, [profile]);

  const channelPlaylists = useMemo(() => {
    if (!isMockDataEnabled()) return [];
    return getStudioRepository().getPlaylists(channelUserId);
  }, [channelUserId]);

  const postsQuery = useQuery({
    queryKey: queryKeys.channelPosts(channelUserId),
    enabled: Boolean(profile),
    queryFn: async () => {
      if (isMockDataEnabled()) return mockChannelPosts(channelUserId);
      return fetchChannelPosts(getSupabaseBrowserClient(), channelUserId);
    },
  });

  const signalsQuery = useQuery({
    queryKey: queryKeys.channelSignals(channelUserId),
    enabled: Boolean(profile),
    queryFn: async () => {
      if (isMockDataEnabled()) return mockChannelSignals(channelUserId);
      return fetchChannelSignals(getSupabaseBrowserClient(), channelUserId);
    },
  });

  const discussionsQuery = useQuery({
    queryKey: queryKeys.channelDiscussions(channelUserId),
    enabled: Boolean(profile),
    queryFn: async () => getSocialRepository().getChannelDiscussionTeasers(channelUserId),
  });

  const roomsSurface = useMemo(() => {
    if (!isMockDataEnabled()) return null;
    return getSocialRepository().getCreatorCommunityRoomsSurface(channelUserId);
  }, [channelUserId]);

  const followQuery = useQuery({
    queryKey: queryKeys.channelFollow(channelUserId, viewerId),
    enabled: Boolean(profile),
    queryFn: async () => {
      if (isMockDataEnabled()) return mockFollowState(channelUserId);
      return fetchFollowState(getSupabaseBrowserClient(), viewerId, channelUserId);
    },
  });

  const posts   = postsQuery.data    ?? EMPTY_POSTS;
  const signals = signalsQuery.data  ?? EMPTY_SIGNALS;
  const follow: FollowState = followQuery.data ?? EMPTY_FOLLOW;

  const authorName   = profile?.full_name || profile?.username || "Unknown";
  const authorHandle = profile?.username || "";
  const authorAvatar = profile?.avatar_url || null;

  const toFeedPost = useCallback(
    (p: ChannelPost) => channelPostToFeedPost(p, authorName, authorHandle, authorAvatar),
    [authorName, authorHandle, authorAvatar],
  );

  const engagement: HomeEngagementHandlers = useMemo(() => ({
    isLoggedIn:         Boolean(viewerId),
    likePendingPostId:  null,
    savePendingPostId:  null,
    onToggleLike: () => {},
    onToggleSave: () => {},
    onRequireAuth: () => router.push("/auth/login"),
  }), [viewerId, router]);

  const videos     = useMemo(() => posts.filter((p) => isVideoTabType(p.type)), [posts]);
  const pulsePosts = useMemo(() => posts.filter((p) => isShortType(p.type)), [posts]);
  const livePosts  = useMemo(() => posts.filter((p) => isLiveType(p.type)), [posts]);
  const feedPosts  = useMemo(() => posts.filter((p) => isFeedPostType(p.type)), [posts]);
  const overview   = useMemo(() => [...posts].slice(0, 12), [posts]);

  /* ── follow mutation ── */
  const followMutation = useMutation({
    mutationFn: async (next: boolean) => {
      if (isMockDataEnabled()) return;
      if (!viewerId) throw new Error("login");
      const c = getSupabaseBrowserClient();
      if (next) {
        const r = await insertFollow(c, viewerId, channelUserId);
        if (!r.ok) throw new Error(r.error ?? "follow");
      } else {
        const r = await deleteFollow(c, viewerId, channelUserId);
        if (!r.ok) throw new Error(r.error ?? "unfollow");
      }
    },
    onMutate: async (nextFollowing: boolean) => {
      setFollowErr(null);
      await qc.cancelQueries({ queryKey: queryKeys.channelFollow(channelUserId, viewerId) });
      const prev = qc.getQueryData<FollowState>(queryKeys.channelFollow(channelUserId, viewerId));
      qc.setQueryData(queryKeys.channelFollow(channelUserId, viewerId), (old: FollowState | undefined) => {
        const o = old ?? { isFollowing: false, followersCount: 0, followingCount: 0 };
        const delta = nextFollowing && !o.isFollowing ? 1 : !nextFollowing && o.isFollowing ? -1 : 0;
        return { ...o, isFollowing: nextFollowing, followersCount: Math.max(0, o.followersCount + delta) };
      });
      return { prev };
    },
    onError: (e: Error, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(queryKeys.channelFollow(channelUserId, viewerId), ctx.prev);
      setFollowErr(e.message === "login" ? "Takip için giriş yapın." : e.message || "İşlem başarısız.");
    },
    onSettled: () => {
      if (isMockDataEnabled()) return;
      void qc.invalidateQueries({ queryKey: queryKeys.channelFollowByChannel(channelUserId) });
    },
  });

  const onFollowClick = useCallback(() => {
    if (isOwn) return;
    if (!viewerId) {
      router.push(`/auth/login?next=${encodeURIComponent(`/channel/${channelUserId}`)}`);
      return;
    }
    followMutation.mutate(!follow.isFollowing);
  }, [channelUserId, follow.isFollowing, followMutation, isOwn, router, viewerId]);

  /* ── derived display values ── */
  const displayName = profile?.full_name?.trim() || profile?.username || "Kullanıcı";
  const handle      = profile ? `@${profile.username}` : "@…";
  const avatarSrc   = profile?.avatar_url?.trim() ? profile.avatar_url : fallbackAvatar(channelUserId, displayName);
  const tier        = tierChip(profile?.tier ?? "free");

  const followersShown = followQuery.isSuccess ? follow.followersCount : profile?.follower_count ?? 0;
  const followingShown = followQuery.isSuccess ? follow.followingCount : profile?.following_count ?? 0;

  /* ── resolved signals ── */
  const resolvedSignalRows = useMemo(() => {
    const feedMap = new Map(getSignalsRepository().getFeedRows().map((r) => [r.id, r]));
    return signals.map((sig) => {
      const found = feedMap.get(sig.id);
      if (found) return found;
      const assetName = isMockDataEnabled() ? displayAssetNameForSymbol(sig.symbol) : sig.symbol;
      const pageRow = {
        ...sig,
        creator_display: displayName,
        asset_display_name: assetName,
        detail_href: `/signals?asset=${encodeURIComponent(sig.symbol)}`,
      };
      return mapSignalsPageRowToFeedRow(pageRow, {
        id: channelUserId,
        display: displayName,
        avatar_url: profile?.avatar_url ?? authorAvatar,
        verified: Boolean(profile?.verified),
        follower_count: profile?.follower_count ?? 0,
        accuracy: profile?.signal_accuracy ?? null,
        specialties: profile?.specialties ?? null,
        tier: profile?.tier ?? "free",
        strategy_style: profile?.strategy_style ?? null,
      });
    });
  }, [signals, channelUserId, displayName, authorAvatar, profile]);

  const channelSignalsThreadBlurb = useMemo(() => {
    if (!isMockDataEnabled() || resolvedSignalRows.length === 0) return null;
    let replies = 0, tracking = 0, creatorRows = 0;
    for (const r of resolvedSignalRows) {
      const p = getSignalsRepository().getSignalThreadPack(r.id);
      if (!p) continue;
      replies    += p.replyCount;
      tracking   += p.reactions.tracking;
      creatorRows += p.entries.filter((e) => e.role === "creator").length;
    }
    return { replies, tracking, creatorRows, n: resolvedSignalRows.length };
  }, [resolvedSignalRows]);

  const channelAnalystReputation = useMemo(() => {
    if (!isMockDataEnabled()) return null;
    return getSignalsRepository().getAnalystReputationProfile(channelUserId);
  }, [channelUserId]);

  /* ── error states ── */
  if (configError && !isMockDataEnabled()) {
    return (
      <div className="ch-canvas ms-page-wrapper--no-top" style={{ width: "100%", minWidth: 0 }}>
        <div className="ms-container-wide">
          <div className="ch-error-block">
            <div className="ch-error-title">Supabase yapılandırması eksik</div>
            <div className="ch-error-desc">{configError}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!isSupabaseConfigured() && !isMockDataEnabled()) {
    return (
      <div className="ch-canvas ms-page-wrapper--no-top" style={{ width: "100%", minWidth: 0 }}>
        <div className="ms-container-wide">
          <div className="ch-error-block">
            <div className="ch-error-desc">Ortam değişkenleri tanımlı değil; kanal yüklenemiyor.</div>
          </div>
        </div>
      </div>
    );
  }

  if ((!isInitialized && !isMockDataEnabled()) || (profileQuery.isLoading && !profileQuery.data)) {
    return <ChannelSkeleton />;
  }

  if (profileQuery.isError && !profile) {
    return (
      <div className="ch-canvas ms-page-wrapper--no-top" style={{ width: "100%", minWidth: 0 }}>
        <div className="ms-container-wide">
          <EmptyState
            title="Kanal yüklenemedi"
            description="Bağlantını kontrol edip tekrar dene."
            actionLabel="Tekrar dene"
            onAction={() => void profileQuery.refetch()}
            secondaryActionLabel="Üreticiler"
            secondaryActionHref="/creators"
            compact
          />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="ch-canvas ms-page-wrapper--no-top" style={{ width: "100%", minWidth: 0 }}>
        <div className="ms-container-wide">
          <div className="ch-error-block">
            <div className="ch-error-title">Kanal bulunamadı</div>
            <div className="ch-error-desc">Bu kullanıcı mevcut değil veya erişim reddedildi.</div>
            <Link href="/" className="ch-error-link">Ana sayfaya dön</Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── RENDER ── */
  return (
    <div className="ch-canvas">

      {/* ── COVER ── */}
      <div className="ch-cover">
        {profile.cover_url?.trim() ? (
          <img src={profile.cover_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        ) : (
          <div className="ch-cover-gradient" />
        )}
        <div className="ch-cover-fade" />
      </div>

      {/* ── HERO ── */}
      <div className="ch-hero">
        <div className="ch-hero-row">

          {/* Avatar */}
          <div className="ch-avatar-wrap">
            <img src={avatarSrc} alt="" className="ch-avatar" />
          </div>

          {/* Identity */}
          <div className="ch-identity">
            <div className="ch-name-row">
              <h1 className="ch-name">{displayName}</h1>
              {profile.verified && <span className="ch-verified-badge">VERIFIED</span>}
              {tier.label && (
                <span className={cn("ch-tier-badge", tier.label === "ELITE" ? "ch-tier-elite" : "ch-tier-pro")}>
                  {tier.label}
                </span>
              )}
            </div>

            <div className="ch-handle-row">
              <span>{handle}</span>
              {profile.strategy_style && (
                <>
                  <span className="ch-handle-sep">·</span>
                  <span className="ch-strategy">{profile.strategy_style}</span>
                </>
              )}
              {profile.location && (
                <>
                  <span className="ch-handle-sep">·</span>
                  <span>{profile.location}</span>
                </>
              )}
            </div>

            {profile.bio?.trim() && (
              <p className="ch-bio">{profile.bio}</p>
            )}

            {profile.specialties && profile.specialties.length > 0 && (
              <div className="ch-specialties">
                {profile.specialties.map((s) => (
                  <span key={s} className="ch-spec">{s}</span>
                ))}
              </div>
            )}

            {/* Stats */}
            <div className="ch-stats-row">
              <div className="ch-stat">
                <span className="ch-stat-value">{fmtCount(followersShown)}</span>
                <span className="ch-stat-label">Takipçi</span>
              </div>
              <div className="ch-stat">
                <span className="ch-stat-value">{fmtCount(followingShown)}</span>
                <span className="ch-stat-label">Takip</span>
              </div>
              {profile.total_views ? (
                <div className="ch-stat">
                  <span className="ch-stat-value">{fmtCount(profile.total_views)}</span>
                  <span className="ch-stat-label">Görüntülenme</span>
                </div>
              ) : null}
              {profile.signal_accuracy != null ? (
                <div className="ch-stat">
                  <span className="ch-stat-value">%{profile.signal_accuracy}</span>
                  <span className="ch-stat-label">Sinyal Doğruluk</span>
                </div>
              ) : null}
              {profile.subscriber_count > 0 ? (
                <div className="ch-stat">
                  <span className="ch-stat-value">{fmtCount(profile.subscriber_count)}</span>
                  <span className="ch-stat-label">Abone</span>
                </div>
              ) : null}
            </div>

            {/* Analyst reputation (mock) */}
            {channelAnalystReputation && (
              <div className="ch-reputation">
                <div className="ch-reputation-title">Sinyal İtibarı</div>
                <div className="ch-reputation-headline">{channelAnalystReputation.headline}</div>
                <div className="ch-reputation-scores">
                  <span className="ch-rep-score">Güven {channelAnalystReputation.scores.trustScore}</span>
                  <span className="ch-rep-score">Tutarlılık {channelAnalystReputation.scores.consistencyScore}</span>
                  <span className="ch-rep-score">Risk-adj {channelAnalystReputation.scores.riskAdjustedPerformance}</span>
                </div>
                {channelAnalystReputation.badges.length > 0 && (
                  <div className="ch-rep-badges">
                    {channelAnalystReputation.badges.map((b) => (
                      <span key={b} className="ch-rep-badge">{analystBadgeLabelTr(b)}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="ch-actions">
              {isOwn ? (
                <>
                  <Link href="/studio" className="ch-btn ch-btn--ghost">Studio</Link>
                  <Link href="/upload" className="ch-btn ch-btn--follow">İçerik Ekle</Link>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={onFollowClick}
                    disabled={followMutation.isPending || followQuery.isLoading}
                    className={cn("ch-btn", follow.isFollowing ? "ch-btn--following" : "ch-btn--follow")}
                    aria-pressed={follow.isFollowing}
                    aria-label={follow.isFollowing ? "Takibi bırak" : "Takip et"}
                  >
                    {follow.isFollowing ? "Takiptesin" : "Takip Et"}
                  </button>
                  {profile.subscription_price ? (
                    <Link
                      href={`/subscriptions/${encodeURIComponent(channelUserId)}`}
                      className="ch-btn ch-btn--subscribe"
                    >
                      Abone Ol · ₺{profile.subscription_price}/ay
                    </Link>
                  ) : null}
                </>
              )}
              {followErr && <span className="ch-follow-err">{followErr}</span>}
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="ch-tabs" role="tablist" aria-label="Kanal sekmeleri">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              ref={(el) => {
                tabRefs.current[id] = el;
              }}
              id={`ch-tab-${id}`}
              type="button"
              role="tab"
              aria-selected={tab === id}
              aria-controls={`ch-panel-${id}`}
              tabIndex={tab === id ? 0 : -1}
              onClick={() => selectTab(id)}
              onKeyDown={(e) => onTabKeyDown(e, id)}
              className={cn("ch-tab", tab === id && "ch-tab--active")}
            >
              {label}
            </button>
          ))}
        </div>

        <ChannelMarketCommunityInset channelUserId={channelUserId} />

        {isMockDataEnabled() && (
          <div style={{ marginTop: 16 }}>
            <RecommendationNetworkRails viewerId={viewerId} excludeCreatorId={channelUserId} />
          </div>
        )}
      </div>

      {/* ── TAB CONTENT ── */}
      <div
        ref={contentRef}
        className="ch-content-area"
        role="tabpanel"
        id={`ch-panel-${tab}`}
        aria-labelledby={`ch-tab-${tab}`}
      >
        {postsQuery.isError ? (
          <div className="ch-feed-error" role="alert">
            <p className="ch-feed-error__text">İçerikler yüklenemedi.</p>
            <button type="button" className="ch-feed-error__retry" onClick={() => void postsQuery.refetch()}>
              Tekrar dene
            </button>
          </div>
        ) : null}

        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>

            {/* Recent content */}
            <section>
              <SectionHeader title="Son İçerikler" onMore={overview.length > 8 ? () => selectTab("videos") : undefined} />
              {postsQuery.isLoading ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, animation: "pulse 1.5s ease-in-out infinite" }}>
                  {[1,2,3,4].map((i) => (
                    <div key={i} style={{ aspectRatio: "16/9", borderRadius: 4, background: "rgba(255,255,255,0.06)" }} />
                  ))}
                </div>
              ) : overview.length === 0 ? (
                <EmptyState title="Henüz içerik yok" description="Bu kullanıcı henüz içerik paylaşmadı." compact />
              ) : (
                <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(2, 1fr)" }}
                  className="sm:grid-cols-3 lg:grid-cols-4">
                  {overview.slice(0, 8).map((p, i) =>
                    isShortType(p.type) ? (
                      <PulseCard key={p.id} post={toFeedPost(p)} engagement={engagement} index={i} />
                    ) : isVideoTabType(p.type) || resolveVideoUrl(p) ? (
                      <VideoCard key={p.id} post={toFeedPost(p)} engagement={engagement} index={i} />
                    ) : isLiveType(p.type) ? (
                      <LiveCard key={p.id} post={toFeedPost(p)} engagement={engagement} index={i} />
                    ) : (
                      <PostListCard key={p.id} post={p} />
                    ),
                  )}
                </div>
              )}
            </section>

            {/* Recent signals */}
            {signals.length > 0 && (
              <section>
                <SectionHeader title="Son Sinyaller" onMore={signals.length > 3 ? () => selectTab("signals") : undefined} />
                <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(1,1fr)" }}
                  className="md:grid-cols-2 lg:grid-cols-3">
                  {resolvedSignalRows.slice(0, 3).map((row) => (
                    <UnifiedSignalCompactCard key={row.id} row={row}
                      onActivate={() => void router.push(`/signals?asset=${encodeURIComponent(row.symbol)}`)} />
                  ))}
                </div>
              </section>
            )}

            {/* Community rooms */}
            {roomsSurface && roomsSurface.rooms.length > 0 && (
              <section>
                <SectionHeader title="Topluluk Odaları" onMore={() => selectTab("rooms")} />
                <div className="ch-room-pills">
                  {roomsSurface.rooms.slice(0, 4).map((r) => (
                    <Link
                      key={r.id}
                      href={`/channel/${encodeURIComponent(channelUserId)}?tab=rooms&room=${encodeURIComponent(r.id)}`}
                      className="ch-room-pill"
                    >
                      {r.label}
                      {r.is_premium && <span className="ch-room-pill-sub">· abone</span>}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {isMockDataEnabled() && (
              <section>
                <CreatorDiscussionGravityStrip highlightCreatorId={channelUserId} />
              </section>
            )}

            {/* Recent posts */}
            {feedPosts.length > 0 && (
              <section>
                <SectionHeader title="Son Gönderiler" onMore={feedPosts.length > 4 ? () => selectTab("posts") : undefined} />
                <div className="ch-post-list">
                  {feedPosts.slice(0, 4).map((p) => <PostListCard key={p.id} post={p} />)}
                </div>
              </section>
            )}
          </div>
        )}

        {/* ── POSTS ── */}
        {tab === "posts" && (
          <div style={{ maxWidth: 640 }}>
            {feedPosts.length === 0 ? (
              <EmptyState title="Gönderi yok" description="Bu kullanıcı henüz metin gönderisi paylaşmadı." compact />
            ) : (
              <div className="ch-post-list">
                {feedPosts.map((p) => <PostListCard key={p.id} post={p} />)}
              </div>
            )}
          </div>
        )}

        {/* ── DISCUSSIONS ── */}
        {tab === "discussions" && (
          <div style={{ maxWidth: 640 }}>
            {discussionsQuery.isLoading ? (
              <p style={{ fontSize: 12, color: "var(--ch-meta)" }}>Tartışmalar yükleniyor…</p>
            ) : (discussionsQuery.data ?? []).length === 0 ? (
              <EmptyState title="Tartışma yok" description="Bu kanalda tartışma trafiği görünmüyor." compact />
            ) : (
              <div className="ch-post-list">
                {(discussionsQuery.data ?? []).map((d) => (
                  <Link key={d.post_id} href={d.href} className="ch-post-item">
                    <div className="ch-post-excerpt">{d.excerpt}</div>
                    <div className="ch-post-meta">
                      <span>{d.comments} yorum</span>
                      {d.asset_tag && (
                        <><span>·</span><span className="ch-post-tag">#{d.asset_tag}</span></>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ROOMS ── */}
        {tab === "rooms" && (
          <div style={{ maxWidth: 900 }}>
            <CreatorCommunityRoomsPanel channelUserId={channelUserId} focusRoomId={roomFocusParam} />
          </div>
        )}

        {/* ── SIGNALS ── */}
        {tab === "signals" && (
          <div>
            {signalsQuery.isLoading ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10, animation: "pulse 1.5s ease-in-out infinite" }}>
                {[1,2,3,4].map((i) => (
                  <div key={i} style={{ height: 100, borderRadius: 4, background: "rgba(255,255,255,0.06)" }} />
                ))}
              </div>
            ) : signals.length === 0 ? (
              <EmptyState title="Sinyal yok" description="Bu kullanıcı henüz sinyal paylaşmadı." compact />
            ) : (
              <>
                {profile.subscription_price && (
                  <div className="ch-signal-banner">
                    <span className="ch-signal-banner-title">Ücretli sinyal akışı</span>
                    — Aboneler strateji paketleri ve kilitli seviyelere erişir.{" "}
                    <Link href={`/subscriptions/${encodeURIComponent(channelUserId)}`} className="ch-signal-link">Planlar</Link>
                    {" · "}
                    <Link href="/close-friends" className="ch-signal-link" style={{ color: "var(--ch-text-2)" }}>Özel daireler</Link>
                  </div>
                )}
                {channelSignalsThreadBlurb && (
                  <div className="ch-thread-blurb">
                    <div className="ch-thread-blurb-title">Canlı Thread Özeti</div>
                    <div className="ch-thread-blurb-text">
                      {channelSignalsThreadBlurb.n} çağrı · {channelSignalsThreadBlurb.replies} yanıt · {channelSignalsThreadBlurb.tracking} izleme
                    </div>
                  </div>
                )}
                <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr" }}
                  className="md:grid-cols-2 xl:grid-cols-3">
                  {resolvedSignalRows.map((row) => (
                    <UnifiedSignalCompactCard key={row.id} row={row}
                      onActivate={() => void router.push(`/signals?asset=${encodeURIComponent(row.symbol)}`)} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── VIDEOS ── */}
        {tab === "videos" && (
          videos.length === 0 ? (
            <EmptyState title="Video yok" description="Bu kullanıcı henüz video paylaşmadı." compact />
          ) : (
            <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(2,1fr)" }}
              className="lg:grid-cols-3 xl:grid-cols-4">
              {videos.map((p, i) => <VideoCard key={p.id} post={toFeedPost(p)} engagement={engagement} index={i} />)}
            </div>
          )
        )}

        {/* ── PULSE ── */}
        {tab === "pulse" && (
          pulsePosts.length === 0 ? (
            <EmptyState title="Pulse içeriği yok" description="Bu kullanıcı henüz kısa video paylaşmadı." compact />
          ) : (
            <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(2,1fr)" }}
              className="sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {pulsePosts.map((p, i) => <PulseCard key={p.id} post={toFeedPost(p)} engagement={engagement} index={i} />)}
            </div>
          )
        )}

        {/* ── LIVE ── */}
        {tab === "live" && (
          livePosts.length === 0 ? (
            <EmptyState title="Canlı yayın yok" description="Şu anda aktif veya geçmiş canlı yayın bulunmuyor."
              actionLabel="Keşfet · Canlı" actionHref="/discover?tab=live" compact />
          ) : (
            <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(2,1fr)" }}
              className="lg:grid-cols-3 xl:grid-cols-4">
              {livePosts.map((p, i) => <LiveCard key={p.id} post={toFeedPost(p)} engagement={engagement} index={i} />)}
            </div>
          )
        )}

        {/* ── PLAYLISTS ── */}
        {tab === "playlists" && (
          channelPlaylists.length === 0 ? (
            <EmptyState title="Liste yok" description="Bu kanal için henüz oynatma listesi yok."
              actionLabel="Studio · Listeler" actionHref="/studio/playlists" compact />
          ) : (
            <div className="ch-playlists" style={{ maxWidth: 560 }}>
              {channelPlaylists.map((pl) => (
                <Link key={pl.id} href={`/playlist/${encodeURIComponent(pl.id)}`} className="ch-playlist-row">
                  <div style={{ minWidth: 0 }}>
                    <div className="ch-playlist-title">{pl.title}</div>
                    <div className="ch-playlist-meta">{pl.videoCount} video · {pl.visibility}</div>
                  </div>
                  <span className="ch-playlist-arrow">→</span>
                </Link>
              ))}
            </div>
          )
        )}

        {/* ── ABOUT ── */}
        {tab === "about" && (
          <div className="ch-about">
            {profile.bio?.trim() && (
              <div className="ch-about-section">
                <div className="ch-about-title">Hakkında</div>
                <p className="ch-about-bio">{profile.bio}</p>
              </div>
            )}

            <div className="ch-about-section">
              <div className="ch-about-title">İstatistikler</div>
              <dl className="ch-about-dl">
                {[
                  { label: "Katılım tarihi", value: new Date(profile.created_at).toLocaleDateString("tr-TR", { year: "numeric", month: "long" }) },
                  { label: "Takipçi",         value: fmtCount(followersShown) },
                  { label: "Takip",            value: fmtCount(followingShown) },
                  profile.total_views ? { label: "Toplam görüntülenme", value: fmtCount(profile.total_views) } : null,
                  profile.signal_accuracy != null ? { label: "Sinyal doğruluk oranı", value: `%${profile.signal_accuracy}` } : null,
                  profile.streak_days > 0 ? { label: "Aktif seri (gün)", value: String(profile.streak_days) } : null,
                  profile.marketcoin > 0 ? { label: "Marketcoin", value: fmtCount(profile.marketcoin) } : null,
                  profile.subscriber_count > 0 ? { label: "Abone sayısı", value: fmtCount(profile.subscriber_count) } : null,
                  profile.subscription_price ? { label: "Abonelik ücreti", value: `₺${profile.subscription_price}/ay` } : null,
                ].filter(Boolean).map((row) => (
                  <div key={row!.label} className="ch-about-row">
                    <dt className="ch-about-key">{row!.label}</dt>
                    <dd className="ch-about-val">{row!.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {profile.specialties && profile.specialties.length > 0 && (
              <div className="ch-about-section">
                <div className="ch-about-title">Uzmanlık Alanları</div>
                <div className="ch-specialties">
                  {profile.specialties.map((s) => <span key={s} className="ch-spec">{s}</span>)}
                </div>
              </div>
            )}

            {(profile.strategy_style || profile.website || profile.location) && (
              <div className="ch-about-section">
                <div className="ch-about-title">Detaylar</div>
                <dl className="ch-about-dl">
                  {profile.strategy_style && (
                    <div className="ch-about-row">
                      <dt className="ch-about-key">Strateji stili</dt>
                      <dd className="ch-about-val">{profile.strategy_style}</dd>
                    </div>
                  )}
                  {profile.location && (
                    <div className="ch-about-row">
                      <dt className="ch-about-key">Konum</dt>
                      <dd className="ch-about-val">{profile.location}</dd>
                    </div>
                  )}
                  {profile.website && (
                    <div className="ch-about-row">
                      <dt className="ch-about-key">Web sitesi</dt>
                      <dd>
                        <a href={`https://${profile.website}`} target="_blank" rel="noopener noreferrer"
                          className="ch-about-link">
                          {profile.website}
                        </a>
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
