"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { SafeAvatar } from "@/components/ui/safe-avatar";
import { deleteFollow, fetchFollowState, insertFollow } from "@/features/channel/fetch-follow";
import { getSocialRepository } from "@/features/social/repository";
import type { DiscussionTimelineRow } from "@/features/social/repository/discussion-types";
import { mockFollowState } from "@/mock/adapters/channel";
import { isMockDataEnabled } from "@/mock/config";
import { queryKeys } from "@/lib/query-keys";
import { cn } from "@/lib/cn";
import { formatCompactCount } from "@/lib/format-compact-count";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { avatarUrl } from "@/lib/avatar-url";
import { authorAvatarSrc } from "../post-detail-helpers";
import { postDetailTierLabel } from "../post-detail-labels";
import type { PostDetail } from "../types";
import { PostDetailMarketContext } from "./post-detail-market-context";
import { PostDetailSideSkeleton } from "./post-detail-side-skeleton";

interface Props {
  post: PostDetail;
  postId: string;
  viewerId: string | null;
}

function timelineTagLabel(tag: DiscussionTimelineRow["tag"]): string {
  const m: Record<DiscussionTimelineRow["tag"], string> = {
    active: "Aktif",
    trending: "Trend",
    creator: "Üretici",
    signal: "Sinyal",
    macro: "Makro",
    asset: "Varlık",
  };
  return m[tag] ?? tag;
}

function signalDirection(label: string): "buy" | "sell" | "hold" {
  const l = label.toLowerCase();
  if (l.includes("sell") || l.includes("sat")) return "sell";
  if (l.includes("buy") || l.includes("al")) return "buy";
  return "hold";
}

function SideModule({
  title,
  accent,
  children,
  className,
}: {
  title: string;
  accent?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`pd-side-module${className ? ` ${className}` : ""}`}
      style={accent ? ({ "--pd-side-accent": accent } as CSSProperties) : undefined}
    >
      <span className="pd-side-module-accent" aria-hidden />
      <div className="pd-side-module-inner">
        <h3 className="pd-side-title">{title}</h3>
        {children}
      </div>
    </div>
  );
}

export function PostDetailSidebar({ post, postId, viewerId }: Props) {
  const qc = useQueryClient();
  const asset = post.asset_tag?.replace(/^#/, "").trim();
  const uploadQuote = `/upload?quotePost=${encodeURIComponent(post.id)}&intent=quote_repost`;
  const uploadThread = `/upload?replyThread=${encodeURIComponent(post.id)}&intent=thread_continue`;

  const followQuery = useQuery({
    queryKey: queryKeys.channelFollow(post.user_id, viewerId),
    enabled: Boolean(post.user_id),
    queryFn: async () => {
      if (isMockDataEnabled()) return mockFollowState(post.user_id);
      if (!isSupabaseConfigured()) return { isFollowing: false, followersCount: 0, followingCount: 0 };
      return fetchFollowState(getSupabaseBrowserClient(), viewerId, post.user_id);
    },
  });

  const follow = followQuery.data ?? { isFollowing: false, followersCount: 0, followingCount: 0 };

  const followMutation = useMutation({
    mutationFn: async (next: boolean) => {
      if (!viewerId) throw new Error("auth");
      const c = getSupabaseBrowserClient();
      if (next) {
        const r = await insertFollow(c, viewerId, post.user_id);
        if (!r.ok) throw new Error(r.error);
      } else {
        const r = await deleteFollow(c, viewerId, post.user_id);
        if (!r.ok) throw new Error(r.error);
      }
    },
    onMutate: async (next) => {
      await qc.cancelQueries({ queryKey: queryKeys.channelFollow(post.user_id, viewerId) });
      qc.setQueryData(queryKeys.channelFollow(post.user_id, viewerId), (old: typeof follow) => ({
        ...old!,
        isFollowing: next,
        followersCount: Math.max(0, (old?.followersCount ?? 0) + (next ? 1 : -1)),
      }));
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.channelFollow(post.user_id, viewerId) });
    },
  });

  const sidecarQuery = useQuery({
    queryKey: queryKeys.postDiscussionSidecar(postId, viewerId ?? "anon"),
    enabled: Boolean(post),
    queryFn: () =>
      getSocialRepository().getPostDiscussionSidecar(postId, {
        viewerId,
        postAuthorId: post.user_id,
        assetTag: post.asset_tag,
      }),
  });

  const sidecar = sidecarQuery.data;
  const isSelf = viewerId === post.user_id;
  const [mobileOpen, setMobileOpen] = useState(false);
  const tierLabel = postDetailTierLabel(post.author_tier);
  const tierKey = post.author_tier.toLowerCase();

  return (
    <aside className={cn("pd-sidebar-col", mobileOpen && "pd-sidebar-col--open")}>
      <button
        type="button"
        className="pd-sidebar-mobile-toggle"
        aria-expanded={mobileOpen}
        aria-controls="pd-sidebar-mobile-body"
        onClick={() => setMobileOpen((v) => !v)}
      >
        <span className="pd-sidebar-mobile-toggle__copy">
          <span className="pd-sidebar-mobile-toggle__title">Yazar ve bağlam</span>
          <span className="pd-sidebar-mobile-toggle__meta">
            {post.author_name}
            {asset ? ` · #${asset}` : ""}
          </span>
        </span>
        <svg
          className="pd-sidebar-mobile-toggle__chevron"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div id="pd-sidebar-mobile-body" className="pd-sidebar-mobile-body">
      <SideModule title="Yazar" className="pd-side-module--author">
        <Link href={`/channel/${post.user_id}`} className="pd-side-author">
          <SafeAvatar
            src={authorAvatarSrc(post)}
            alt={post.author_name}
            size={42}
            className="pd-avatar"
          />
          <div className="min-w-0">
            <div className="pd-side-author-name-row">
              <span className="pd-side-author-name">{post.author_name}</span>
              {tierLabel && tierKey === "elite" ? (
                <span className="pd-side-tier pd-side-tier--elite">{tierLabel}</span>
              ) : null}
              {tierLabel && tierKey === "pro" ? (
                <span className="pd-side-tier pd-side-tier--pro">{tierLabel}</span>
              ) : null}
            </div>
            <div className="pd-side-author-handle">{post.author_handle}</div>
            <div className="pd-side-followers">
              {formatCompactCount(follow.followersCount)} takipçi
            </div>
          </div>
        </Link>

        <div className="pd-side-author-actions">
          {!isSelf && viewerId ? (
            <button
              type="button"
              className={`pd-follow-btn${follow.isFollowing ? " pd-follow-btn--active" : ""}`}
              disabled={followMutation.isPending}
              onClick={() => void followMutation.mutateAsync(!follow.isFollowing)}
            >
              {follow.isFollowing ? "Takip ediliyor" : "Takip et"}
            </button>
          ) : null}
          <Link href={`/channel/${post.user_id}`} className="pd-side-link">
            Profili gör →
          </Link>
        </div>
      </SideModule>

      {asset && <PostDetailMarketContext assetTag={asset} />}

      {sidecarQuery.isLoading ? <PostDetailSideSkeleton /> : null}

      {sidecar?.summary && (
        <SideModule title="Tartışma özeti" accent="var(--pd-accent)">
          <p className="pd-side-summary">{sidecar.summary}</p>
        </SideModule>
      )}

      {sidecar?.continuationHref && (
        <SideModule title="Devam" accent="#60a5fa">
          <Link href={sidecar.continuationHref} className="pd-side-highlight-link">
            Thread devamını gör →
          </Link>
        </SideModule>
      )}

      {(sidecar?.timelineRows?.length ?? 0) > 0 && (
        <SideModule title="Tartışma akışı" accent="#a78bfa">
          <ul className="pd-side-timeline">
            {sidecar!.timelineRows.slice(0, 4).map((row) => (
              <li key={row.id}>
                <Link href={row.href} className="pd-side-timeline-link">
                  <span className="pd-side-timeline-main">
                    <span className="pd-side-timeline-label">{row.label}</span>
                    <span className="pd-side-timeline-sub">{row.sub}</span>
                  </span>
                  <span className="pd-side-timeline-meta">
                    <span className={`pd-side-timeline-tag pd-side-timeline-tag--${row.tag}`}>
                      {timelineTagLabel(row.tag)}
                    </span>
                    <span className="pd-side-timeline-heat">{row.heat}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </SideModule>
      )}

      {(sidecar?.relatedPosts?.length ?? 0) > 0 && (
        <SideModule title="İlgili gönderiler" accent="#34d399">
          <ul className="pd-related-list">
            {sidecar!.relatedPosts.slice(0, 4).map((rp) => (
              <li key={rp.id}>
                <Link href={rp.href} className="pd-related-link">
                  <span className="pd-related-row">
                    <span className="pd-related-title">{rp.title}</span>
                    {rp.asset_tag ? (
                      <span className="pd-related-asset">{rp.asset_tag.replace(/^#/, "")}</span>
                    ) : null}
                  </span>
                  {rp.comments > 0 && (
                    <span className="pd-related-meta">{formatCompactCount(rp.comments)} yorum</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </SideModule>
      )}

      {(sidecar?.relatedSignals?.length ?? 0) > 0 && (
        <SideModule title="Bağlı sinyaller" accent="#f59e0b">
          <ul className="pd-related-list pd-related-list--signals">
            {sidecar!.relatedSignals.slice(0, 3).map((s) => {
              const dir = signalDirection(s.label);
              return (
                <li key={s.id}>
                  <Link href={s.href} className="pd-related-link pd-related-link--signal">
                    <span className="pd-signal-symbol">{s.symbol}</span>
                    <span className={`pd-signal-dir pd-signal-dir--${dir}`}>{s.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </SideModule>
      )}

      {(sidecar?.activeParticipants?.length ?? 0) > 0 && (
        <SideModule title="Aktif katılımcılar" accent="#38bdf8">
          <ul className="pd-participant-list">
            {sidecar!.activeParticipants.slice(0, 5).map((p, i) => (
              <li key={p.user_id}>
                <Link href={`/channel/${p.user_id}`} className="pd-participant-link">
                  <span className="pd-participant-rank">{i + 1}</span>
                  <SafeAvatar
                    src={p.avatar?.trim() || avatarUrl(p.user_id, p.name)}
                    alt={p.name}
                    size={24}
                    className="pd-participant-av"
                  />
                  <span className="pd-participant-name">{p.name}</span>
                  <span className="pd-participant-score">{p.contributor_score}</span>
                </Link>
              </li>
            ))}
          </ul>
        </SideModule>
      )}

      {(sidecar?.networkHints?.length ?? 0) > 0 && (
        <SideModule title="Ağ ipuçları" accent="#94a3b8">
          <ul className="pd-network-list">
            {sidecar!.networkHints.slice(0, 4).map((h) => (
              <li key={h.id}>
                <Link href={h.href} className="pd-network-link">
                  {h.text}
                </Link>
              </li>
            ))}
          </ul>
        </SideModule>
      )}

      <SideModule title="Eylemler" accent="var(--pd-accent)">
        <Link href={uploadQuote} className="pd-side-action">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <polyline points="17 1 21 5 17 9" />
            <path d="M3 11V9a4 4 0 0 1 4-4h14" />
          </svg>
          Alıntılı paylaş
        </Link>
        <Link href={uploadThread} className="pd-side-action">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <line x1="12" y1="5" x2="12" y2="19" />
            <polyline points="19 12 12 19 5 12" />
          </svg>
          Zincire devam et
        </Link>
        {post.thread_id && (
          <Link href={`/post/${post.thread_id}`} className="pd-side-action">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M4 6h16M4 12h10M4 18h6" />
            </svg>
            Thread kökü
          </Link>
        )}
      </SideModule>
      </div>
    </aside>
  );
}
