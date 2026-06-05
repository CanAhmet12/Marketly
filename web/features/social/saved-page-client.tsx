"use client";

import Link from "next/link";

import { EmptyState } from "@/components/states";
import { useAuth } from "@/features/auth/use-auth";
import { useSavedPostsPage } from "@/features/social/hooks/use-saved-posts-page";
import { SafeAvatar } from "@/components/ui/safe-avatar";
import { isVideoLikePost } from "@/features/feed/feed-display";
import type { FeedPost } from "@/features/feed/types";
import { formatSocialRelativeTime } from "@/features/social/lib/social-format";

function postHref(post: FeedPost): string {
  if (isVideoLikePost(post)) return `/watch/${post.id}`;
  return `/post/${post.id}`;
}

export function SavedPageClient() {
  const { user, isInitialized } = useAuth();
  const { posts, ready, loading, error, unsave, refetch } = useSavedPostsPage();

  if (!isInitialized || !ready || loading) {
    return <div className="sv-page"><div className="sv-skeleton" aria-hidden /></div>;
  }

  if (!user) {
    return (
      <EmptyState
        title="Giriş gerekli"
        description="Kaydedilen gönderileri görmek için oturum açın."
        actionLabel="Giriş yap"
        actionHref="/auth/login"
        tone="social"
        compact
      />
    );
  }

  if (error) {
    return (
      <EmptyState
        title="Kayıtlar yüklenemedi"
        description={error}
        actionLabel="Tekrar dene"
        onAction={() => void refetch()}
        tone="social"
        compact
      />
    );
  }

  return (
    <div className="sv-page">
      <header className="sv-header">
        <div>
          <p className="sv-kicker">Koleksiyon</p>
          <h1 className="sv-title">Kaydedilenler</h1>
          <p className="sv-sub">Feed, watch ve gönderi detayından kaydettiğiniz içerikler.</p>
        </div>
        <span className="sv-count">{posts.length} kayıt</span>
      </header>

      {posts.length === 0 ? (
        <EmptyState
          title="Henüz kayıt yok"
          description="Gönderilerdeki kaydet simgesine dokunarak buraya ekleyin."
          actionLabel="Keşfet"
          actionHref="/discover"
          tone="social"
          compact
        />
      ) : (
        <ul className="sv-list">
          {posts.map((post) => (
            <li key={post.id} className="sv-row">
              <Link href={postHref(post)} className="sv-row-link">
                <SafeAvatar
                  src={post.author_avatar ?? ""}
                  alt=""
                  size={40}
                  className="sv-avatar"
                />
                <div className="sv-row-body">
                  <div className="sv-row-top">
                    <span className="sv-author">{post.author_name}</span>
                    <span className="sv-handle">{post.author_handle}</span>
                    <span className="sv-dot">·</span>
                    <span className="sv-time">{formatSocialRelativeTime(post.created_at)}</span>
                  </div>
                  <p className="sv-snippet">
                    {post.title?.trim() || post.content?.trim().slice(0, 160) || "Gönderi"}
                  </p>
                  {post.asset_tag && <span className="sv-tag">{post.asset_tag}</span>}
                </div>
              </Link>
              <button
                type="button"
                className="sv-unsave"
                onClick={() => void unsave(post.id)}
                aria-label="Kaydı kaldır"
              >
                Kaldır
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
