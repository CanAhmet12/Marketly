"use client";

import Image from "next/image";
import Link from "next/link";
import { memo } from "react";

import type { FeedPost } from "@/features/feed/types";
import type { HomeEngagementHandlers } from "@/features/home/home-engagement";
import type { EditorialCardModel } from "@/features/home/editorial/feed-post-to-editorial-card";
import { feedPostToEditorialCardModel } from "@/features/home/editorial/feed-post-to-editorial-card";
import { cn } from "@/lib/cn";

import type { HomeVisualPost } from "./mock-data";

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

function IconRepost() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 9V4h5M19 15v5h-5M19 9 14 4H9M5 15l5 5h5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
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
  className?: string;
  style?: React.CSSProperties;
}) {
  const postHref = `/post/${vm.id}`;
  const commentHref = `${postHref}#yorumlar`;

  return (
    <article
      className={cn(lead ? "hv-ref-article hv-ref-article--lead" : "hv-ref-article", className)}
      style={style}
    >
      <div className="hv-ref-article__row">
        <div className="hv-ref-article__text-stack">
          <div className="hv-ref-article__lede">
            <div className="hv-ref-article__head">
              <div className="hv-ref-article__avatar">
                {vm.avatarUrl ? (
                  <Image src={vm.avatarUrl} alt="" width={46} height={46} sizes="46px" className="h-full w-full object-cover" />
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
                  {vm.badge ? <span className="hv-ref-article__badge">{vm.badge}</span> : null}
                </div>
                <div className="hv-ref-article__handle">
                  {vm.handle} · {vm.timeLabel}
                </div>
              </div>
            </div>
            {feedExtras ? (
              <h2 className="hv-ref-article__title">
                <Link href={postHref} className="text-inherit no-underline hover:opacity-95">
                  {vm.title}
                </Link>
              </h2>
            ) : (
              <h2 className="hv-ref-article__title">{vm.title}</h2>
            )}
          </div>
          {vm.body ? (
            feedExtras ? (
              <Link href={postHref} className="hv-ref-article__body block text-inherit no-underline hover:opacity-95">
                {vm.body}
              </Link>
            ) : (
              <p className="hv-ref-article__body">{vm.body}</p>
            )
          ) : null}
        </div>
        {vm.mediaUrl ? (
          <Link href={postHref} className="hv-ref-article__thumb block shrink-0">
            <Image
              src={vm.mediaUrl}
              alt=""
              width={vm.mediaWidth}
              height={vm.mediaHeight}
              className="hv-ref-article__thumb-img"
              sizes="(max-width: 640px) 92vw, (max-width: 1200px) 45vw, 520px"
              priority={priority}
            />
          </Link>
        ) : null}
      </div>
      {vm.topics.length > 0 ? (
        <div className="hv-ref-article__chips">
          {vm.topics.map((t) => (
            <span key={t} className="hv-ref-article__chip">
              {t}
            </span>
          ))}
        </div>
      ) : null}
      <div className="hv-ref-article__engage">
        {feedExtras ? (
          <>
            <button
              type="button"
              className={cn(
                "inline-flex cursor-pointer items-center gap-[var(--hv-s-2)] border-none bg-transparent p-0 font-inherit text-inherit",
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
              <IconHeart filled={feedExtras.post.is_liked} /> <strong>{vm.likesLabel}</strong>
            </button>
            <Link href={commentHref} className="inline-flex items-center gap-[var(--hv-s-2)] text-inherit no-underline hover:opacity-90">
              <IconBubble /> <strong>{vm.commentsLabel}</strong>
            </Link>
            <button
              type="button"
              className={cn(
                "inline-flex cursor-pointer items-center gap-[var(--hv-s-2)] border-none bg-transparent p-0 font-inherit text-inherit",
                feedExtras.engagement.savePendingPostId === feedExtras.post.id && "engagement-pending",
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
              <span className="text-[0.72rem] font-semibold opacity-90">{feedExtras.post.is_saved ? "Kayıtlı" : "Kaydet"}</span>
            </button>
          </>
        ) : (
          <>
            <span>
              <IconHeart /> <strong>{vm.likesLabel}</strong>
            </span>
            <span>
              <IconBubble /> <strong>{vm.commentsLabel}</strong>
            </span>
            <span>
              <IconRepost /> <strong>{vm.repostsLabel}</strong>
            </span>
          </>
        )}
      </div>
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
