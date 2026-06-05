"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { SafeAvatar } from "@/components/ui/safe-avatar";
import { deleteFollow, fetchFollowState, insertFollow } from "@/features/channel/fetch-follow";
import { getSocialRepository } from "@/features/social/repository";
import { mockFollowState } from "@/mock/adapters/channel";
import { isMockDataEnabled } from "@/mock/config";
import { queryKeys } from "@/lib/query-keys";
import { formatCompactCount } from "@/lib/format-compact-count";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { avatarUrl } from "@/lib/avatar-url";
import { authorAvatarSrc } from "../post-detail-helpers";
import type { PostDetail } from "../types";
import { PostDetailMarketContext } from "./post-detail-market-context";

interface Props {
  post: PostDetail;
  postId: string;
  viewerId: string | null;
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

  return (
    <aside className="pd-sidebar-col">
      <div className="pd-side-block">
        <h3 className="pd-side-title">Yazar</h3>
        <Link href={`/channel/${post.user_id}`} className="pd-side-author">
          <SafeAvatar
            src={authorAvatarSrc(post)}
            alt={post.author_name}
            size={42}
            className="pd-avatar"
          />
          <div className="min-w-0">
            <div className="pd-side-author-name">{post.author_name}</div>
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
      </div>

      {asset && <PostDetailMarketContext assetTag={asset} />}

      {sidecar?.summary && (
        <div className="pd-side-block">
          <h3 className="pd-side-title">Tartışma özeti</h3>
          <p className="pd-side-summary">{sidecar.summary}</p>
        </div>
      )}

      {sidecar?.continuationHref && (
        <div className="pd-side-block">
          <Link href={sidecar.continuationHref} className="pd-side-highlight-link">
            Thread devamını gör →
          </Link>
        </div>
      )}

      {(sidecar?.relatedPosts?.length ?? 0) > 0 && (
        <div className="pd-side-block">
          <h3 className="pd-side-title">İlgili gönderiler</h3>
          <ul className="pd-related-list">
            {sidecar!.relatedPosts.slice(0, 4).map((rp) => (
              <li key={rp.id}>
                <Link href={rp.href} className="pd-related-link">
                  <span className="pd-related-title">{rp.title}</span>
                  {rp.comments > 0 && (
                    <span className="pd-related-meta">{rp.comments} yorum</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {(sidecar?.relatedSignals?.length ?? 0) > 0 && (
        <div className="pd-side-block">
          <h3 className="pd-side-title">Bağlı sinyaller</h3>
          <ul className="pd-related-list">
            {sidecar!.relatedSignals.slice(0, 3).map((s) => (
              <li key={s.id}>
                <Link href={s.href} className="pd-related-link">
                  <span className="pd-related-title">{s.symbol}</span>
                  <span className="pd-related-meta">{s.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {(sidecar?.activeParticipants?.length ?? 0) > 0 && (
        <div className="pd-side-block">
          <h3 className="pd-side-title">Aktif katılımcılar</h3>
          <ul className="pd-participant-list">
            {sidecar!.activeParticipants.slice(0, 5).map((p) => (
              <li key={p.user_id}>
                <Link href={`/channel/${p.user_id}`} className="pd-participant-link">
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
        </div>
      )}

      {(sidecar?.networkHints?.length ?? 0) > 0 && (
        <div className="pd-side-block">
          <h3 className="pd-side-title">Ağ ipuçları</h3>
          <ul className="pd-network-list">
            {sidecar!.networkHints.slice(0, 4).map((h) => (
              <li key={h.id}>
                <Link href={h.href} className="pd-network-link">
                  {h.text}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="pd-side-block">
        <h3 className="pd-side-title">Eylemler</h3>
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
      </div>
    </aside>
  );
}
