"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { EmptyState } from "@/components/states";
import { ChannelSectionHeader } from "@/features/channel/components/channel-section-header";
import { ChannelFeedPostCard } from "@/features/channel/channel-page-parts";
import { fmtCount } from "@/features/channel/channel-display-helpers";
import type { ChannelPost, ChannelProfile, ChannelTabId } from "@/features/channel/types";
import { CreatorCommunityRoomsPanel } from "@/features/social/components/creator-community-rooms-panel";
import { PulseCard } from "@/features/discover/cards/PulseCard";
import { VideoCard } from "@/features/discover/cards/VideoCard";
import { LiveCard } from "@/features/discover/cards/LiveCard";
import { UnifiedSignalCompactCard } from "@/features/signals/components/unified-signal-primitives";
import type { SignalsFeedRow } from "@/features/signals/repository/types";
import type { HomeEngagementHandlers } from "@/features/home/home-engagement";
import type { ChannelDiscussionTeaser } from "@/features/social/repository/discussion-types";
import type { CreatorCommunityRoomsSurface } from "@/features/social/repository/creator-room-types";
import type { StudioPlaylistItem } from "@/features/studio/repository/types";
import type { FeedPost } from "@/features/feed/types";

export type ChannelTabContentProps = {
  tab: ChannelTabId;
  channelUserId: string;
  channelRouteBase?: string;
  isOwn: boolean;
  profile: ChannelProfile;
  postsLoading: boolean;
  feedPosts: ChannelPost[];
  videos: ChannelPost[];
  pulsePosts: ChannelPost[];
  livePosts: ChannelPost[];
  signalsLoading: boolean;
  signalsCount: number;
  resolvedSignalRows: SignalsFeedRow[];
  channelSignalsThreadBlurb: { replies: number; tracking: number; n: number } | null;
  discussions: ChannelDiscussionTeaser[];
  discussionsLoading: boolean;
  roomsSurface: CreatorCommunityRoomsSurface | null;
  roomFocusParam: string | null;
  playlists: StudioPlaylistItem[];
  playlistsLoading: boolean;
  followersShown: number;
  followingShown: number;
  engagement: HomeEngagementHandlers;
  toFeedPost: (p: ChannelPost) => FeedPost;
  onSelectTab: (id: ChannelTabId) => void;
};

function ChannelVideoGrid({
  items,
  engagement,
  toFeedPost,
}: {
  items: ChannelPost[];
  engagement: HomeEngagementHandlers;
  toFeedPost: (p: ChannelPost) => FeedPost;
}) {
  return (
    <div className="ch-grid ch-grid--videos">
      {items.map((p, i) => (
        <VideoCard key={p.id} post={toFeedPost(p)} engagement={engagement} index={i} surface="channel" />
      ))}
    </div>
  );
}

function ChannelPulseGrid({
  items,
  engagement,
  toFeedPost,
}: {
  items: ChannelPost[];
  engagement: HomeEngagementHandlers;
  toFeedPost: (p: ChannelPost) => FeedPost;
}) {
  return (
    <div className="ch-grid ch-grid--pulse">
      {items.map((p, i) => (
        <PulseCard key={p.id} post={toFeedPost(p)} engagement={engagement} index={i} surface="channel" />
      ))}
    </div>
  );
}

function ChannelLiveGrid({
  items,
  engagement,
  toFeedPost,
}: {
  items: ChannelPost[];
  engagement: HomeEngagementHandlers;
  toFeedPost: (p: ChannelPost) => FeedPost;
}) {
  return (
    <div className="ch-grid ch-grid--live">
      {items.map((p, i) => (
        <LiveCard key={p.id} post={toFeedPost(p)} engagement={engagement} index={i} />
      ))}
    </div>
  );
}

function ChannelFeedList({
  items,
  engagement,
  toFeedPost,
}: {
  items: ChannelPost[];
  engagement: HomeEngagementHandlers;
  toFeedPost: (p: ChannelPost) => FeedPost;
}) {
  return (
    <div className="ch-feed-list">
      {items.map((p) => (
        <ChannelFeedPostCard key={p.id} feedPost={toFeedPost(p)} engagement={engagement} />
      ))}
    </div>
  );
}

export function ChannelTabContent(props: ChannelTabContentProps) {
  const router = useRouter();
  const {
    tab,
    channelUserId,
    channelRouteBase,
    isOwn,
    profile,
    postsLoading,
    feedPosts,
    videos,
    pulsePosts,
    livePosts,
    signalsLoading,
    signalsCount,
    resolvedSignalRows,
    channelSignalsThreadBlurb,
    discussions,
    discussionsLoading,
    roomsSurface,
    roomFocusParam,
    playlists,
    playlistsLoading,
    followersShown,
    followingShown,
    engagement,
    toFeedPost,
    onSelectTab,
  } = props;

  const channelBase = channelRouteBase ?? `/channel/${encodeURIComponent(channelUserId)}`;

  if (tab === "overview") {
    const hasMedia = videos.length > 0 || pulsePosts.length > 0 || livePosts.length > 0;

    return (
      <div className="ch-overview-stack">
        {postsLoading && !hasMedia && feedPosts.length === 0 ? (
          <div className="ch-grid ch-grid--videos ch-grid--shimmer">
            {[1, 2, 3].map((i) => (
              <div key={i} className="ch-shimmer-block ch-shimmer-block--video" />
            ))}
          </div>
        ) : null}

        {videos.length > 0 ? (
          <section className="ch-overview-section">
            <ChannelSectionHeader
              title="Videolar"
              onMore={videos.length > 4 ? () => onSelectTab("videos") : undefined}
            />
            {postsLoading ? (
              <div className="ch-grid ch-grid--videos ch-grid--shimmer">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="ch-shimmer-block ch-shimmer-block--video" />
                ))}
              </div>
            ) : (
              <ChannelVideoGrid items={videos.slice(0, 4)} engagement={engagement} toFeedPost={toFeedPost} />
            )}
          </section>
        ) : null}

        {pulsePosts.length > 0 ? (
          <section className="ch-overview-section">
            <ChannelSectionHeader
              title="Pulse"
              onMore={pulsePosts.length > 6 ? () => onSelectTab("pulse") : undefined}
            />
            {postsLoading ? (
              <div className="ch-grid ch-grid--pulse ch-grid--shimmer">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="ch-shimmer-block ch-shimmer-block--pulse" />
                ))}
              </div>
            ) : (
              <ChannelPulseGrid items={pulsePosts.slice(0, 6)} engagement={engagement} toFeedPost={toFeedPost} />
            )}
          </section>
        ) : null}

        {livePosts.length > 0 ? (
          <section className="ch-overview-section">
            <ChannelSectionHeader
              title="Canlı"
              onMore={livePosts.length > 3 ? () => onSelectTab("live") : undefined}
            />
            <ChannelLiveGrid items={livePosts.slice(0, 3)} engagement={engagement} toFeedPost={toFeedPost} />
          </section>
        ) : null}

        {!postsLoading && !hasMedia && feedPosts.length === 0 && signalsCount === 0 ? (
          <EmptyState title="Henüz içerik yok" description="Bu kullanıcı henüz içerik paylaşmadı." compact />
        ) : null}

        {signalsCount > 0 ? (
          <section className="ch-overview-section">
            <ChannelSectionHeader
              title="Son Sinyaller"
              onMore={signalsCount > 3 ? () => onSelectTab("signals") : undefined}
            />
            <div className="ch-grid ch-grid--signals">
              {resolvedSignalRows.slice(0, 3).map((row) => (
                <UnifiedSignalCompactCard
                  key={row.id}
                  row={row}
                  onActivate={() => void router.push(`/signals?asset=${encodeURIComponent(row.symbol)}`)}
                />
              ))}
            </div>
          </section>
        ) : null}

        {roomsSurface && roomsSurface.rooms.length > 0 ? (
          <section className="ch-overview-section">
            <ChannelSectionHeader title="Topluluk Odaları" onMore={() => onSelectTab("rooms")} />
            <div className="ch-room-pills">
              {roomsSurface.rooms.slice(0, 4).map((r) => (
                <Link
                  key={r.id}
                  href={`${channelBase}?tab=rooms&room=${encodeURIComponent(r.id)}`}
                  className="ch-room-pill"
                >
                  {r.label}
                  {r.is_premium ? <span className="ch-room-pill-sub">· abone</span> : null}
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {discussions.length > 0 ? (
          <section className="ch-overview-section">
            <ChannelSectionHeader title="Tartışmalar" onMore={() => onSelectTab("discussions")} />
            <div className="ch-post-list">
              {discussions.slice(0, 3).map((d) => (
                <Link key={d.post_id} href={d.href} className="ch-post-item">
                  <div className="ch-post-excerpt">{d.excerpt}</div>
                  <div className="ch-post-meta">
                    <span>{d.comments} yorum</span>
                    {d.asset_tag ? (
                      <>
                        <span>·</span>
                        <span className="ch-post-tag">#{d.asset_tag}</span>
                      </>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {feedPosts.length > 0 ? (
          <section className="ch-overview-section ch-overview-section--feed">
            <ChannelSectionHeader
              title="Gönderiler"
              onMore={feedPosts.length > 3 ? () => onSelectTab("posts") : undefined}
            />
            <ChannelFeedList items={feedPosts.slice(0, 3)} engagement={engagement} toFeedPost={toFeedPost} />
          </section>
        ) : null}
      </div>
    );
  }

  if (tab === "posts") {
    return (
      <div className="ch-panel ch-panel--feed">
        {feedPosts.length === 0 ? (
          <EmptyState title="Gönderi yok" description="Bu kullanıcı henüz metin gönderisi paylaşmadı." compact />
        ) : (
          <ChannelFeedList items={feedPosts} engagement={engagement} toFeedPost={toFeedPost} />
        )}
      </div>
    );
  }

  if (tab === "discussions") {
    return (
      <div className="ch-panel ch-panel--narrow">
        {discussionsLoading ? (
          <p className="ch-tab-loading">Tartışmalar yükleniyor…</p>
        ) : discussions.length === 0 ? (
          <EmptyState title="Tartışma yok" description="Bu kanalda tartışma trafiği görünmüyor." compact />
        ) : (
          <div className="ch-post-list">
            {discussions.map((d) => (
              <Link key={d.post_id} href={d.href} className="ch-post-item">
                <div className="ch-post-excerpt">{d.excerpt}</div>
                <div className="ch-post-meta">
                  <span>{d.comments} yorum</span>
                  {d.asset_tag ? (
                    <>
                      <span>·</span>
                      <span className="ch-post-tag">#{d.asset_tag}</span>
                    </>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (tab === "rooms") {
    return (
      <div className="ch-panel ch-panel--wide">
        <CreatorCommunityRoomsPanel channelUserId={channelUserId} focusRoomId={roomFocusParam} />
      </div>
    );
  }

  if (tab === "signals") {
    return (
      <div className="ch-panel">
        {signalsLoading ? (
          <div className="ch-grid ch-grid--signals ch-grid--shimmer">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="ch-shimmer-block ch-shimmer-block--signal" />
            ))}
          </div>
        ) : signalsCount === 0 ? (
          <EmptyState title="Sinyal yok" description="Bu kullanıcı henüz sinyal paylaşmadı." compact />
        ) : (
          <>
            {profile.subscription_price ? (
              <div className="ch-signal-banner">
                <span className="ch-signal-banner-title">Ücretli sinyal akışı</span>
                — Aboneler strateji paketleri ve kilitli seviyelere erişir.{" "}
                <Link href={`/subscriptions/${encodeURIComponent(channelUserId)}`} className="ch-signal-link">
                  Planlar
                </Link>
                {" · "}
                <Link href="/hub/close-friends" className="ch-signal-link ch-signal-link--muted">
                  Özel daireler
                </Link>
              </div>
            ) : null}
            {channelSignalsThreadBlurb ? (
              <div className="ch-thread-blurb">
                <div className="ch-thread-blurb-title">Canlı Thread Özeti</div>
                <div className="ch-thread-blurb-text">
                  {channelSignalsThreadBlurb.n} çağrı · {channelSignalsThreadBlurb.replies} yanıt ·{" "}
                  {channelSignalsThreadBlurb.tracking} izleme
                </div>
              </div>
            ) : null}
            <div className="ch-grid ch-grid--signals">
              {resolvedSignalRows.map((row) => (
                <UnifiedSignalCompactCard
                  key={row.id}
                  row={row}
                  onActivate={() => void router.push(`/signals?asset=${encodeURIComponent(row.symbol)}`)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  if (tab === "videos") {
    return videos.length === 0 ? (
      <EmptyState title="Video yok" description="Bu kullanıcı henüz video paylaşmadı." compact />
    ) : (
      <ChannelVideoGrid items={videos} engagement={engagement} toFeedPost={toFeedPost} />
    );
  }

  if (tab === "pulse") {
    return pulsePosts.length === 0 ? (
      <EmptyState title="Pulse içeriği yok" description="Bu kullanıcı henüz kısa video paylaşmadı." compact />
    ) : (
      <ChannelPulseGrid items={pulsePosts} engagement={engagement} toFeedPost={toFeedPost} />
    );
  }

  if (tab === "live") {
    return livePosts.length === 0 ? (
      <EmptyState
        title="Canlı yayın yok"
        description="Şu anda aktif veya geçmiş canlı yayın bulunmuyor."
        compact
      />
    ) : (
      <ChannelLiveGrid items={livePosts} engagement={engagement} toFeedPost={toFeedPost} />
    );
  }

  if (tab === "playlists") {
    return playlistsLoading ? (
      <p className="ch-tab-loading">Listeler yükleniyor…</p>
    ) : playlists.length === 0 ? (
      <EmptyState
        title="Liste yok"
        description="Bu kanal için henüz oynatma listesi yok."
        actionLabel={isOwn ? "Studio · Listeler" : undefined}
        actionHref={isOwn ? "/studio/playlists" : undefined}
        compact
      />
    ) : (
      <div className="ch-playlists ch-playlists--panel">
        {playlists.map((pl) => (
          <Link key={pl.id} href={`/playlist/${encodeURIComponent(pl.id)}`} className="ch-playlist-row">
            <div className="ch-playlist-row-main">
              <div className="ch-playlist-title">{pl.title}</div>
              <div className="ch-playlist-meta">{pl.videoCount} video · {pl.visibility}</div>
            </div>
            <span className="ch-playlist-arrow">→</span>
          </Link>
        ))}
      </div>
    );
  }

  if (tab === "about") {
    return (
      <div className="ch-about">
        {profile.bio?.trim() ? (
          <div className="ch-about-section">
            <div className="ch-about-title">Hakkında</div>
            <p className="ch-about-bio">{profile.bio}</p>
          </div>
        ) : null}

        <div className="ch-about-section">
          <div className="ch-about-title">İstatistikler</div>
          <dl className="ch-about-dl">
            {[
              {
                label: "Katılım tarihi",
                value: new Date(profile.created_at).toLocaleDateString("tr-TR", { year: "numeric", month: "long" }),
              },
              { label: "Takipçi", value: fmtCount(followersShown) },
              { label: "Takip", value: fmtCount(followingShown) },
              profile.total_views ? { label: "Toplam görüntülenme", value: fmtCount(profile.total_views) } : null,
              profile.signal_accuracy != null
                ? { label: "Sinyal doğruluk oranı", value: `%${profile.signal_accuracy}` }
                : null,
              profile.streak_days > 0 ? { label: "Aktif seri (gün)", value: String(profile.streak_days) } : null,
              profile.marketcoin > 0 ? { label: "Marketcoin", value: fmtCount(profile.marketcoin) } : null,
              profile.subscriber_count > 0 ? { label: "Abone sayısı", value: fmtCount(profile.subscriber_count) } : null,
              profile.subscription_price
                ? { label: "Abonelik ücreti", value: `₺${profile.subscription_price}/ay` }
                : null,
            ]
              .filter(Boolean)
              .map((row) => (
                <div key={row!.label} className="ch-about-row">
                  <dt className="ch-about-key">{row!.label}</dt>
                  <dd className="ch-about-val">{row!.value}</dd>
                </div>
              ))}
          </dl>
        </div>

        {profile.specialties && profile.specialties.length > 0 ? (
          <div className="ch-about-section">
            <div className="ch-about-title">Uzmanlık Alanları</div>
            <div className="ch-specialties">
              {profile.specialties.map((s) => (
                <span key={s} className="ch-spec">
                  {s}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {profile.strategy_style || profile.website || profile.location ? (
          <div className="ch-about-section">
            <div className="ch-about-title">Detaylar</div>
            <dl className="ch-about-dl">
              {profile.strategy_style ? (
                <div className="ch-about-row">
                  <dt className="ch-about-key">Strateji stili</dt>
                  <dd className="ch-about-val">{profile.strategy_style}</dd>
                </div>
              ) : null}
              {profile.location ? (
                <div className="ch-about-row">
                  <dt className="ch-about-key">Konum</dt>
                  <dd className="ch-about-val">{profile.location}</dd>
                </div>
              ) : null}
              {profile.website ? (
                <div className="ch-about-row">
                  <dt className="ch-about-key">Web sitesi</dt>
                  <dd>
                    <a
                      href={`https://${profile.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ch-about-link"
                    >
                      {profile.website}
                    </a>
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>
        ) : null}
      </div>
    );
  }

  return null;
}
