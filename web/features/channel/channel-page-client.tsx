"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";

import { useAuth } from "@/features/auth/use-auth";
import { ChannelFollowListSheet } from "@/features/channel/components/channel-follow-list-sheet";
import { ChannelHero } from "@/features/channel/components/channel-hero";
import { ChannelTabContent } from "@/features/channel/components/channel-tab-content";
import type { ChannelFollowListKind } from "@/features/channel/fetch-channel-follow-list";
import { fetchChannelDiscussions } from "@/features/channel/fetch-channel-discussions";
import { fetchChannelPlaylists } from "@/features/channel/fetch-channel-playlists";
import { fetchChannelRooms } from "@/features/channel/fetch-channel-rooms";
import { buildChannelAnalystReputationFromProfile } from "@/features/channel/lib/build-channel-analyst-reputation";
import { fetchChannelPosts } from "@/features/channel/fetch-channel-posts";
import { fetchChannelProfile } from "@/features/channel/fetch-channel-profile";
import { fetchChannelSignals } from "@/features/channel/fetch-channel-signals";
import { deleteFollow, fetchFollowState, insertFollow } from "@/features/channel/fetch-follow";
import type { ChannelPost, ChannelSignal, ChannelTabId, FollowState } from "@/features/channel/types";
import { isFeedPostType, isShortType, isVideoTabType, isLiveType } from "@/features/channel/channel-display-helpers";
import { ChannelSkeleton } from "@/features/channel/channel-page-parts";
import { resolveChannelZone } from "@/features/channel/lib/channel-zone";
import { channelPostToFeedPost } from "@/features/channel/channel-to-feed-adapter";
import { mapSignalsPageRowToFeedRow } from "@/features/signals/lib/map-page-row-to-feed-row";
import { getSignalsRepository } from "@/features/signals/repository";
import { EmptyState } from "@/components/states";
import { avatarUrl as fallbackAvatar } from "@/lib/avatar-url";
import { queryKeys } from "@/lib/query-keys";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isWebWriteEnabled } from "@/lib/supabase/write-guard";
import { mockChannelPosts, mockChannelProfile, mockChannelSignals, mockFollowState } from "@/mock/adapters/channel";
import { displayAssetNameForSymbol } from "@/mock/adapters/signals-source";
import { isMockDataEnabled } from "@/mock/config";
import { trackCreatorView } from "@/features/personalization/tracking";
import { useFeedEngagement } from "@/features/engagement/use-feed-engagement";
import { HubChannelShell } from "@/features/hub/components/hub-channel-shell";
import { HUB_PROFILE_PATH } from "@/features/hub/lib/hub-nav-config";

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

function publicChannelPath(channelUserId: string): string {
  return `/channel/${encodeURIComponent(channelUserId)}`;
}

function channelRouteWithQuery(base: string, params: URLSearchParams): string {
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

type Props = {
  channelUserId: string;
  initialTab?: ChannelTabId;
  /** Hub profil gibi alternatif kök — tab query bu path üzerinde kalır */
  routeBase?: string;
  embeddedInHub?: boolean;
};

/* ───────────────────────────────────────────────── main component */

export function ChannelPageClient({ channelUserId, initialTab, routeBase, embeddedInHub }: Props) {
  const router       = useRouter();
  const pathname     = usePathname() ?? "";
  const searchParams = useSearchParams();
  const rawTab = searchParams.get("tab");
  const roomFocusParam = searchParams.get("room");
  const qc   = useQueryClient();
  const { user, isInitialized, configError } = useAuth();
  const viewerId = user?.id ?? null;
  const isOwn    = Boolean(viewerId && viewerId === channelUserId);

  const publicPath = publicChannelPath(channelUserId);
  const activeRouteBase = routeBase ?? publicPath;

  const tab = resolveChannelTab(rawTab, initialTab);
  const tabRefs = useRef<Partial<Record<ChannelTabId, HTMLButtonElement | null>>>({});
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [followErr, setFollowErr] = useState<string | null>(null);
  const [followListKind, setFollowListKind] = useState<ChannelFollowListKind | null>(null);

  const channelLoginNext = channelRouteWithQuery(
    activeRouteBase,
    (() => {
      const p = new URLSearchParams();
      if (tab !== "overview") p.set("tab", tab);
      return p;
    })(),
  );
  const { handlers: engagement, applyOverlay } = useFeedEngagement({ loginNext: channelLoginNext });

  useEffect(() => {
    if (!isInitialized || !isOwn || routeBase) return;
    if (!pathname.startsWith("/channel/")) return;
    const params = new URLSearchParams(searchParams.toString());
    router.replace(channelRouteWithQuery(HUB_PROFILE_PATH, params), { scroll: false });
  }, [isInitialized, isOwn, routeBase, pathname, router, searchParams]);

  useEffect(() => {
    if (rawTab !== "shorts") return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "pulse");
    router.replace(channelRouteWithQuery(activeRouteBase, params), { scroll: false });
  }, [rawTab, activeRouteBase, router, searchParams]);

  const selectTab = useCallback(
    (id: ChannelTabId) => {
      contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      const params = new URLSearchParams();
      if (id !== "overview") params.set("tab", id);
      if (id === "rooms" && roomFocusParam) params.set("room", roomFocusParam);
      router.replace(channelRouteWithQuery(activeRouteBase, params), { scroll: false });
    },
    [activeRouteBase, roomFocusParam, router],
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
    queryFn: async () => fetchChannelDiscussions(getSupabaseBrowserClient(), channelUserId),
  });

  const playlistsQuery = useQuery({
    queryKey: queryKeys.channelPlaylists(channelUserId),
    enabled: Boolean(profile),
    queryFn: async () => fetchChannelPlaylists(getSupabaseBrowserClient(), channelUserId),
  });

  const roomsQuery = useQuery({
    queryKey: queryKeys.channelRooms(channelUserId),
    enabled: Boolean(profile),
    queryFn: () => fetchChannelRooms(channelUserId),
  });

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
  const channelPlaylists = playlistsQuery.data ?? [];
  const socialWriteEnabled = isMockDataEnabled() || isWebWriteEnabled();

  const authorName   = profile?.full_name || profile?.username || "Unknown";
  const authorHandle = profile?.username || "";
  const authorAvatar = profile?.avatar_url || null;

  const toFeedPost = useCallback(
    (p: ChannelPost) =>
      applyOverlay(channelPostToFeedPost(p, authorName, authorHandle, authorAvatar)),
    [applyOverlay, authorName, authorHandle, authorAvatar],
  );

  const videos     = useMemo(() => posts.filter((p) => isVideoTabType(p.type)), [posts]);
  const pulsePosts = useMemo(() => posts.filter((p) => isShortType(p.type)), [posts]);
  const livePosts  = useMemo(() => posts.filter((p) => isLiveType(p.type)), [posts]);
  const feedPosts  = useMemo(() => posts.filter((p) => isFeedPostType(p.type)), [posts]);
  const overview   = useMemo(() => [...posts].slice(0, 12), [posts]);
  const channelAssetTags = useMemo(() => {
    const tags = new Set<string>();
    for (const p of posts) {
      const tag = p.asset_tag?.trim();
      if (tag) tags.add(tag);
    }
    for (const s of signals) {
      const sym = s.symbol?.trim();
      if (sym) tags.add(sym);
    }
    return [...tags].slice(0, 8);
  }, [posts, signals]);

  const tabCounts = useMemo<Partial<Record<ChannelTabId, number>>>(() => ({
    posts: feedPosts.length,
    discussions: discussionsQuery.data?.length ?? 0,
    signals: signals.length,
    videos: videos.length,
    pulse: pulsePosts.length,
    live: livePosts.length,
    playlists: channelPlaylists.length,
  }), [feedPosts.length, discussionsQuery.data, signals.length, videos.length, pulsePosts.length, livePosts.length, channelPlaylists.length]);

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
      router.push(`/auth/login?next=${encodeURIComponent(activeRouteBase)}`);
      return;
    }
    followMutation.mutate(!follow.isFollowing);
  }, [channelUserId, follow.isFollowing, followMutation, isOwn, router, viewerId]);

  /* ── derived display values ── */
  const displayName = profile?.full_name?.trim() || profile?.username || "Kullanıcı";
  const handle      = profile ? `@${profile.username}` : "@…";
  const avatarSrc   = profile?.avatar_url?.trim() ? profile.avatar_url : fallbackAvatar(channelUserId, displayName);

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
    if (resolvedSignalRows.length === 0) return null;
    if (isMockDataEnabled()) {
      let replies = 0;
      let tracking = 0;
      for (const r of resolvedSignalRows) {
        const p = getSignalsRepository().getSignalThreadPack(r.id);
        if (!p) continue;
        replies += p.replyCount;
        tracking += p.reactions.tracking;
      }
      return { replies, tracking, n: resolvedSignalRows.length };
    }
    const tracking = signals.reduce((sum, s) => sum + (s.likes_count ?? 0), 0);
    return { replies: 0, tracking, n: resolvedSignalRows.length };
  }, [resolvedSignalRows, signals]);

  const channelAnalystReputation = useMemo(() => {
    if (!profile) return null;
    if (isMockDataEnabled()) {
      return getSignalsRepository().getAnalystReputationProfile(channelUserId);
    }
    return buildChannelAnalystReputationFromProfile(profile, signals.length, displayName);
  }, [channelUserId, profile, signals.length, displayName]);

  /* ── error states ── */
  const zone = resolveChannelZone(tab);

  if (configError && !isMockDataEnabled()) {
    return (
      <HubChannelShell
        embeddedInHub={embeddedInHub}
        zone="profile"
        className="ch-canvas ch-canvas--fill ms-page-wrapper--no-top"
      >
        <div className="ms-container-wide">
          <div className="ch-error-block">
            <div className="ch-error-title">Supabase yapılandırması eksik</div>
            <div className="ch-error-desc">{configError}</div>
          </div>
        </div>
      </HubChannelShell>
    );
  }

  if (!isSupabaseConfigured() && !isMockDataEnabled()) {
    return (
      <HubChannelShell
        embeddedInHub={embeddedInHub}
        zone="profile"
        className="ch-canvas ch-canvas--fill ms-page-wrapper--no-top"
      >
        <div className="ms-container-wide">
          <div className="ch-error-block">
            <div className="ch-error-desc">Ortam değişkenleri tanımlı değil; kanal yüklenemiyor.</div>
          </div>
        </div>
      </HubChannelShell>
    );
  }

  if ((!isInitialized && !isMockDataEnabled()) || (profileQuery.isLoading && !profileQuery.data)) {
    return <ChannelSkeleton />;
  }

  if (profileQuery.isError && !profile) {
    return (
      <HubChannelShell
        embeddedInHub={embeddedInHub}
        zone="profile"
        className="ch-canvas ch-canvas--fill ms-page-wrapper--no-top"
      >
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
      </HubChannelShell>
    );
  }

  if (!profile) {
    return (
      <HubChannelShell
        embeddedInHub={embeddedInHub}
        zone="profile"
        className="ch-canvas ch-canvas--fill ms-page-wrapper--no-top"
      >
        <div className="ms-container-wide">
          <div className="ch-error-block">
            <div className="ch-error-title">Kanal bulunamadı</div>
            <div className="ch-error-desc">Bu kullanıcı mevcut değil veya erişim reddedildi.</div>
            <Link href="/" className="ch-error-link">Ana sayfaya dön</Link>
          </div>
        </div>
      </HubChannelShell>
    );
  }

  /* ── RENDER ── */
  return (
    <HubChannelShell embeddedInHub={embeddedInHub} zone={zone} className="ch-canvas">
      <ChannelHero
        profile={profile}
        channelUserId={channelUserId}
        displayName={displayName}
        handle={handle}
        avatarSrc={avatarSrc}
        followersShown={followersShown}
        followingShown={followingShown}
        isOwn={isOwn}
        embeddedInHub={embeddedInHub}
        viewerId={viewerId}
        channelLoginNext={channelLoginNext}
        socialWriteEnabled={socialWriteEnabled}
        follow={follow}
        followPending={followMutation.isPending}
        followLoading={followQuery.isLoading}
        followErr={followErr}
        onFollowClick={onFollowClick}
        onOpenFollowList={setFollowListKind}
        channelAnalystReputation={channelAnalystReputation}
        channelAssetTags={channelAssetTags}
        tabs={TABS}
        tab={tab}
        tabCounts={tabCounts}
        tabRefs={tabRefs}
        onSelectTab={selectTab}
        onTabKeyDown={onTabKeyDown}
      />

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

        <ChannelTabContent
          tab={tab}
          channelUserId={channelUserId}
          channelRouteBase={activeRouteBase}
          isOwn={isOwn}
          profile={profile}
          postsLoading={postsQuery.isLoading}
          overview={overview}
          feedPosts={feedPosts}
          videos={videos}
          pulsePosts={pulsePosts}
          livePosts={livePosts}
          signalsLoading={signalsQuery.isLoading}
          signalsCount={signals.length}
          resolvedSignalRows={resolvedSignalRows}
          channelSignalsThreadBlurb={channelSignalsThreadBlurb}
          discussions={discussionsQuery.data ?? []}
          discussionsLoading={discussionsQuery.isLoading}
          roomsSurface={roomsQuery.data ?? null}
          roomFocusParam={roomFocusParam}
          playlists={channelPlaylists}
          playlistsLoading={playlistsQuery.isLoading}
          followersShown={followersShown}
          followingShown={followingShown}
          engagement={engagement}
          toFeedPost={toFeedPost}
          onSelectTab={selectTab}
        />
      </div>

      <ChannelFollowListSheet
        channelUserId={channelUserId}
        kind={followListKind}
        onClose={() => setFollowListKind(null)}
      />
    </HubChannelShell>
  );
}
