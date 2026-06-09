"use client";

import Image from "next/image";
import Link from "next/link";
import { memo, useCallback, useMemo, useState } from "react";

import { useDoubleTap } from "@/hooks/use-double-tap";

import type { FeedPost } from "@/features/feed/types";
import type { MarketAssetView } from "@/features/markets/types";
import type { HomeEngagementHandlers } from "@/features/home/home-engagement";
import type { EditorialCardModel } from "@/features/home/editorial/feed-post-to-editorial-card";
import { feedPostToEditorialCardModel } from "@/features/home/editorial/feed-post-to-editorial-card";
import { formatCompactCount } from "@/features/home/editorial/format-compact-count";
import { cn } from "@/lib/cn";

import type { HomeVisualPost } from "./mock-data";
import { ShareSheet } from "@/components/share/share-sheet";
import { useFeedPostPrefetch } from "@/features/home/hooks/use-feed-post-prefetch";
import { buildPostSharePreview, buildPostShareText } from "@/lib/build-share-text";
import { HomeFeedPostMenu } from "./home-feed-post-menu";
import { PostAssetMarketStrip } from "./post-asset-market-strip";
import {
  MentionText,
  PostLinkPreview,
  PostMediaGrid,
  PostQuotedEmbed,
  PostSocialRepostBanner,
  PostSocialRepostEmbed,
  tierBadgeClass,
  tierShortLabel,
} from "./post-card-blocks";

/** Markets sayfasındaki kategori kimlik renkleri — post tinting için */
const POST_CATEGORY_COLORS: Record<string, string> = {
  crypto: "#f59e0b",
  stocks: "#3b82f6",
  forex: "#10b981",
  commodity: "#f97316",
  index: "#8b5cf6",
};

type PropsStatic = {
  mode?: "static";
  post: HomeVisualPost;
  lead?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

type PropsFeed = {
  mode: "feed";
  post: FeedPost;
  lead?: boolean;
  engagement: HomeEngagementHandlers;
  assetMap?: Map<string, MarketAssetView> | null;
  className?: string;
  style?: React.CSSProperties;
};

type Props = PropsStatic | PropsFeed;

function IconHeart({ filled }: { filled?: boolean }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} aria-hidden>
      <path
        d="M12 21s-6.716-4.432-9-8.5C.5 8.5 2.5 5 6.5 5c2 0 3.5 1.5 5.5 4 2-2.5 3.5-4 5.5-4 4 0 6 3.5 4.5 7.5C18.716 16.568 12 21 12 21Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconBubble() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 18.5c-1.5 0-2.5-1-2.5-2.5V7c0-1.5 1-2.5 2.5-2.5h11C18.5 4.5 19.5 5.5 19.5 7v9c0 1.5-1 2.5-2.5 2.5H10l-4 3v-3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconBookmark({ filled }: { filled?: boolean }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} aria-hidden>
      <path
        d="M5 4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v16l-7-4-7 4V4Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconShare() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3v12M8 7l4-4 4 4M5 14h14v5a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EditorialArticleInner({
  vm,
  lead,
  priority,
  feedExtras,
  assetMap,
  className,
  style,
}: {
  vm: EditorialCardModel;
  lead: boolean;
  priority: boolean;
  feedExtras?: {
    post: FeedPost;
    engagement: HomeEngagementHandlers;
  };
  assetMap?: Map<string, MarketAssetView> | null;
  className?: string;
  style?: React.CSSProperties;
}) {
  const post = feedExtras?.post;
  const assetTag = post?.asset_tag?.trim().toUpperCase() ?? null;
  const assetData = assetTag ? (assetMap?.get(assetTag) ?? null) : null;
  const [shareOpen, setShareOpen] = useState(false);
  const [likeBurst, setLikeBurst] = useState<{ x: number; y: number } | null>(null);
  const postHref = `/post/${vm.id}`;
  const commentHref = `${postHref}#yorumlar`;
  const postUrl =
    typeof window !== "undefined" ? `${window.location.origin}${postHref}` : postHref;
  const prefetchPost = useFeedPostPrefetch(feedExtras ? postHref : null);

  const sharePayload = useMemo(() => {
    if (!post) return null;
    return {
      preview: buildPostSharePreview(post.author_name, post.content, post.title),
      shareText: buildPostShareText(post.author_name, post.content, post.title, postUrl),
      url: postUrl,
    };
  }, [post, postUrl]);

  const onCardWarm = useCallback(() => {
    prefetchPost();
  }, [prefetchPost]);

  const handleDoubleLike = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      if (!feedExtras) return;
      const el = e.currentTarget as HTMLElement;
      const rect = el.getBoundingClientRect();
      const clientX = "changedTouches" in e ? (e.changedTouches[0]?.clientX ?? rect.width / 2) : e.clientX;
      const clientY = "changedTouches" in e ? (e.changedTouches[0]?.clientY ?? rect.height / 2) : e.clientY;
      setLikeBurst({ x: clientX - rect.left, y: clientY - rect.top });
      window.setTimeout(() => setLikeBurst(null), 720);
      if (!feedExtras.engagement.isLoggedIn) {
        feedExtras.engagement.onRequireAuth?.();
        return;
      }
      if (!feedExtras.post.is_liked) {
        void feedExtras.engagement.onToggleLike(feedExtras.post);
      }
    },
    [feedExtras],
  );

  const onCardDoubleTap = useDoubleTap(handleDoubleLike);

  const catColor = assetData?.category ? (POST_CATEGORY_COLORS[assetData.category] ?? null) : null;
  const articleStyle: React.CSSProperties = {
    ...style,
    ...(catColor ? ({ "--hv-post-cat": catColor } as React.CSSProperties) : {}),
  };

  const tierLabel = post ? tierShortLabel(post.author_tier) : tierShortLabel(vm.badge);
  const tierClass = post ? tierBadgeClass(post.author_tier) : tierBadgeClass(vm.badge);

  const showQuoteMedia = !post?.social_repost || post.social_repost.kind === "quote_repost";
  const hasMedia = showQuoteMedia && Boolean(vm.mediaUrl || (post?.media_urls?.length ?? 0) > 0 || post?.image_url);
  const hasLinkPreview = showQuoteMedia && Boolean(post?.link_preview?.url);
  const isPureRepost = post?.social_repost?.kind === "repost";
  const bodyLong = vm.body.length > 160;

  return (
    <article
      className={cn(
        lead ? "hv-ref-article hv-ref-article--lead" : "hv-ref-article",
        catColor && "hv-ref-article--cat-tinted",
        className,
      )}
      style={articleStyle}
      onMouseEnter={feedExtras ? onCardWarm : undefined}
      onFocusCapture={feedExtras ? onCardWarm : undefined}
      onClick={feedExtras ? onCardDoubleTap : undefined}
    >
      {likeBurst ? (
        <span
          className="hv-ref-article__like-burst"
          style={{ left: likeBurst.x, top: likeBurst.y }}
          aria-hidden
        >
          <IconHeart filled />
        </span>
      ) : null}
      {lead ? <span className="hv-ref-article__lead-badge">Öne çıkan</span> : null}
      <div className="hv-ref-article__head">
        <div className="hv-ref-article__avatar">
          {vm.avatarUrl ? (
            <Image src={vm.avatarUrl} alt="" width={48} height={48} sizes="48px" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-[0.65rem] font-semibold text-[var(--hv-meta)]" aria-hidden>
              {vm.creatorName.slice(0, 1)}
            </span>
          )}
        </div>
        <div className="hv-ref-article__meta">
          <div className="hv-ref-article__name-row">
            {feedExtras ? (
              <Link href={`/channel/${feedExtras.post.user_id}`} className="hv-ref-article__name hover:opacity-90">
                {vm.creatorName}
              </Link>
            ) : (
              <span className="hv-ref-article__name">{vm.creatorName}</span>
            )}
            {tierLabel ? <span className={tierClass}>{tierLabel}</span> : null}
          </div>
          <div className="hv-ref-article__handle">
            <span>{vm.handle}</span>
            <span className="hv-ref-article__handle-sep" aria-hidden>
              ·
            </span>
            <time>{vm.timeLabel}</time>
            {feedExtras && (feedExtras.post.views_count ?? 0) > 0 ? (
              <>
                <span className="hv-ref-article__handle-sep" aria-hidden>
                  ·
                </span>
                <span className="hv-ref-article__handle-views">
                  {formatCompactCount(feedExtras.post.views_count ?? 0)} görüntüleme
                </span>
              </>
            ) : null}
          </div>
        </div>
        {feedExtras ? (
          <HomeFeedPostMenu post={feedExtras.post} onShare={() => setShareOpen(true)} />
        ) : null}
      </div>

      <div className="hv-ref-article__flow">
        {post?.social_repost ? <PostSocialRepostBanner rep={post.social_repost} /> : null}

        {assetTag ? <PostAssetMarketStrip symbol={assetTag} asset={assetData} /> : null}

        {feedExtras ? (
          <h2 className="hv-ref-article__title">
            <Link href={postHref} className="text-inherit no-underline hover:opacity-95">
              {vm.title}
            </Link>
          </h2>
        ) : (
          <h2 className="hv-ref-article__title">{vm.title}</h2>
        )}

        {vm.body ? (
          <div className="hv-ref-article__body-wrap">
            {feedExtras ? (
              <Link href={postHref} className="hv-ref-article__body block text-inherit no-underline hover:opacity-95">
                <MentionText text={vm.body} />
              </Link>
            ) : (
              <p className="hv-ref-article__body">{vm.body}</p>
            )}
            {bodyLong && feedExtras ? (
              <Link href={postHref} className="hv-ref-article__read-more">
                Devamını oku
              </Link>
            ) : null}
          </div>
        ) : null}

        {post && hasMedia && !isPureRepost ? (
          <Link href={postHref} className="hv-ref-article__media-wrap block">
            <PostMediaGrid post={post} priority={priority} />
          </Link>
        ) : null}

        {!post && vm.mediaUrl ? (
          <div className="hv-ref-article__media-wrap">
            <div className="hv-ref-article__media hv-ref-article__media--single">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={vm.mediaUrl}
                alt=""
                width={vm.mediaWidth}
                height={vm.mediaHeight}
                className="hv-ref-article__media-img"
                loading={priority ? "eager" : "lazy"}
                decoding="async"
              />
            </div>
          </div>
        ) : null}

        {post && hasLinkPreview && post.link_preview ? <PostLinkPreview preview={post.link_preview} /> : null}

        {post?.social_repost ? <PostSocialRepostEmbed rep={post.social_repost} /> : null}
        {post?.quoted_post ? <PostQuotedEmbed quoted={post.quoted_post} /> : null}

        {vm.topics.length > 0 ? (
          <div className="hv-ref-article__chips">
            {vm.topics.map((t) => (
              <Link
                key={t}
                href={`/results?q=${encodeURIComponent(t.replace(/^#/, ""))}`}
                className="hv-ref-article__chip"
              >
                {t}
              </Link>
            ))}
          </div>
        ) : null}

        {feedExtras && post && post.comments > 0 ? (
          <Link href={commentHref} prefetch className="hv-ref-article__comment-teaser">
            <IconBubble />
            <span>
              <strong>{vm.commentsLabel}</strong> yorum — tartışmaya katıl
            </span>
            <span className="hv-ref-article__comment-teaser-arrow" aria-hidden>
              →
            </span>
          </Link>
        ) : null}

        <div className="hv-ref-article__engage">
        {feedExtras ? (
          <>
            <button
              type="button"
              className={cn(
                "hv-ref-article__engage-btn",
                feedExtras.post.is_liked && "hv-ref-article__engage-btn--active",
                feedExtras.engagement.likePendingPostId === feedExtras.post.id && "engagement-pending",
              )}
              aria-pressed={feedExtras.post.is_liked}
              aria-label={feedExtras.post.is_liked ? "Beğeniyi kaldır" : "Beğen"}
              aria-busy={feedExtras.engagement.likePendingPostId === feedExtras.post.id}
              disabled={feedExtras.engagement.likePendingPostId === feedExtras.post.id}
              onClick={() => {
                if (!feedExtras.engagement.isLoggedIn) {
                  feedExtras.engagement.onRequireAuth?.();
                  return;
                }
                void feedExtras.engagement.onToggleLike(feedExtras.post);
              }}
            >
              <IconHeart filled={feedExtras.post.is_liked} />
              <strong>{vm.likesLabel}</strong>
            </button>
            <Link href={commentHref} className="hv-ref-article__engage-btn">
              <IconBubble />
              <strong>{vm.commentsLabel}</strong>
            </Link>
            <button
              type="button"
              className={cn(
                "hv-ref-article__engage-btn",
                feedExtras.engagement.savePendingPostId === feedExtras.post.id && "engagement-pending",
                feedExtras.post.is_saved && "hv-ref-article__engage-btn--active",
              )}
              aria-pressed={feedExtras.post.is_saved}
              aria-label={feedExtras.post.is_saved ? "Kaydı kaldır" : "Kaydet"}
              aria-busy={feedExtras.engagement.savePendingPostId === feedExtras.post.id}
              disabled={feedExtras.engagement.savePendingPostId === feedExtras.post.id}
              onClick={() => {
                if (!feedExtras.engagement.isLoggedIn) {
                  feedExtras.engagement.onRequireAuth?.();
                  return;
                }
                void feedExtras.engagement.onToggleSave(feedExtras.post);
              }}
            >
              <IconBookmark filled={feedExtras.post.is_saved} />
              <span className="hv-ref-article__engage-label">
                {feedExtras.post.is_saved ? "Kayıtlı" : "Kaydet"}
              </span>
            </button>
            <button
              type="button"
              className="hv-ref-article__engage-btn"
              aria-label="Paylaş"
              onClick={() => setShareOpen(true)}
            >
              <IconShare />
              <span className="hv-ref-article__engage-label">Paylaş</span>
            </button>
          </>
        ) : (
          <>
            <span className="hv-ref-article__engage-stat">
              <IconHeart /> <strong>{vm.likesLabel}</strong>
            </span>
            <span className="hv-ref-article__engage-stat">
              <IconBubble /> <strong>{vm.commentsLabel}</strong>
            </span>
            <span className="hv-ref-article__engage-stat">
              <IconShare /> <strong>{vm.repostsLabel}</strong>
            </span>
          </>
        )}
        </div>
      </div>

      {sharePayload ? (
        <ShareSheet
          open={shareOpen}
          onClose={() => setShareOpen(false)}
          preview={sharePayload.preview}
          shareText={sharePayload.shareText}
          url={sharePayload.url}
        />
      ) : null}
    </article>
  );
}

function HomeVisualPostCardInner(props: Props) {
  if (props.mode === "feed") {
    const vm = feedPostToEditorialCardModel(props.post);
    return (
      <EditorialArticleInner
        vm={vm}
        lead={props.lead ?? false}
        priority={props.lead ?? false}
        feedExtras={{ post: props.post, engagement: props.engagement }}
        assetMap={props.assetMap}
        className={props.className}
        style={props.style}
      />
    );
  }
  const p = props.post;
  const vm: EditorialCardModel = {
    id: p.id,
    creatorName: p.creatorName,
    handle: p.handle,
    badge: p.badge,
    avatarUrl: p.avatarUrl,
    timeLabel: p.timeLabel,
    title: p.title,
    body: p.body,
    mediaUrl: p.mediaUrl,
    mediaWidth: p.mediaWidth,
    mediaHeight: p.mediaHeight,
    topics: p.topics,
    likesLabel: p.likes,
    commentsLabel: p.comments,
    repostsLabel: p.reposts,
  };
  return (
    <EditorialArticleInner
      vm={vm}
      lead={props.lead ?? false}
      priority={p.id === "p1"}
      className={props.className}
      style={props.style}
    />
  );
}

export const HomeVisualPostCard = memo(HomeVisualPostCardInner);
