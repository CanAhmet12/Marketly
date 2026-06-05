"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { SafeAvatar } from "@/components/ui/safe-avatar";
import type { FeedPost } from "@/features/feed/types";
import { authorAvatarSrc, gridCardTitle } from "@/features/feed/feed-display";
import { formatCompactCount } from "@/lib/format-compact-count";
import { cn } from "@/lib/cn";

import { pulsePosterUrl, pulseTitle, resolvePulseVideoUrl } from "./pulse-media";

type Props = {
  post: FeedPost;
  active: boolean;
  onLike: () => void;
  onOpenComments?: () => void;
  onRequireAuth?: () => void;
  isLoggedIn: boolean;
};

export function PulseSlide({ post, active, onLike, onOpenComments, onRequireAuth, isLoggedIn }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [liked, setLiked] = useState(post.is_liked);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [heartBurst, setHeartBurst] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [needsTap, setNeedsTap] = useState(false);
  const lastTapRef = useRef(0);

  const src = resolvePulseVideoUrl(post);
  const poster = pulsePosterUrl(post);
  const title = pulseTitle(post);

  useEffect(() => {
    setLiked(post.is_liked);
    setLikeCount(post.likes);
    setVideoError(false);
    setNeedsTap(false);
  }, [post.id, post.is_liked, post.likes]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !src) return;
    if (active) {
      void v.play()
        .then(() => setNeedsTap(false))
        .catch(() => setNeedsTap(true));
    } else {
      v.pause();
      v.currentTime = 0;
    }
  }, [active, src, post.id]);

  const tryPlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    void v.play()
      .then(() => setNeedsTap(false))
      .catch(() => setNeedsTap(true));
  }, []);

  const handleDoubleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < 320) {
      if (!isLoggedIn) {
        onRequireAuth?.();
        return;
      }
      if (!liked) {
        setLiked(true);
        setLikeCount((n) => n + 1);
        onLike();
      }
      setHeartBurst(true);
      window.setTimeout(() => setHeartBurst(false), 700);
    }
    lastTapRef.current = now;
  }, [isLoggedIn, liked, onLike, onRequireAuth]);

  return (
    <section className="pulse-slide" data-active={active ? "true" : undefined}>
      <div
        className="pulse-slide__media"
        onClick={() => {
          if (needsTap) tryPlay();
          handleDoubleTap();
        }}
        role="presentation"
      >
        {src && !videoError ? (
          <video
            ref={videoRef}
            className="pulse-slide__video"
            src={src}
            poster={poster ?? undefined}
            playsInline
            loop
            muted
            autoPlay={active}
            preload={active ? "auto" : "metadata"}
            onError={() => setVideoError(true)}
            onLoadedData={() => {
              if (active) tryPlay();
            }}
          />
        ) : poster ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={poster} alt="" className="pulse-slide__poster" />
            {videoError && src ? (
              <button
                type="button"
                className="pulse-slide__retry"
                onClick={(e) => {
                  e.stopPropagation();
                  setVideoError(false);
                }}
              >
                Tekrar dene
              </button>
            ) : null}
          </>
        ) : (
          <div className="pulse-slide__empty">
            Video yüklenemedi
            {src ? (
              <button
                type="button"
                className="pulse-slide__retry"
                onClick={(e) => {
                  e.stopPropagation();
                  setVideoError(false);
                }}
              >
                Tekrar dene
              </button>
            ) : null}
          </div>
        )}
        {needsTap && src && !videoError ? (
          <div className="pulse-slide__play-hint">Oynatmak için dokun</div>
        ) : null}
        <div className="pulse-slide__scrim" aria-hidden />
        {heartBurst ? (
          <div className="pulse-slide__heart-burst" aria-hidden>
            ♥
          </div>
        ) : null}
      </div>

      <div className="pulse-slide__actions">
        <button
          type="button"
          className={cn("pulse-slide__action", liked && "pulse-slide__action--active")}
          aria-label={liked ? "Beğeniyi geri al" : "Beğen"}
          aria-pressed={liked}
          onClick={() => {
            if (!isLoggedIn) {
              onRequireAuth?.();
              return;
            }
            setLiked((v) => !v);
            setLikeCount((n) => Math.max(0, n + (liked ? -1 : 1)));
            onLike();
          }}
        >
          <span aria-hidden>{liked ? "♥" : "♡"}</span>
          <span className="pulse-slide__action-count">{formatCompactCount(likeCount)}</span>
        </button>
        <button
          type="button"
          className="pulse-slide__action"
          aria-label="Yorumlar"
          onClick={() => onOpenComments?.()}
        >
          <span aria-hidden>💬</span>
          <span className="pulse-slide__action-count">{formatCompactCount(post.comments)}</span>
        </button>
        <Link href={`/channel/${post.user_id}`} className="pulse-slide__action pulse-slide__action--avatar" aria-label="Kanal">
          <SafeAvatar src={authorAvatarSrc(post)} alt="" size={40} className="h-10 w-10 rounded-full ring-2 ring-white/80" />
        </Link>
      </div>

      <div className="pulse-slide__meta">
        <Link href={`/channel/${post.user_id}`} className="pulse-slide__author">
          @{post.author_handle.replace(/^@/, "")}
        </Link>
        <p className="pulse-slide__title">{title}</p>
        {post.asset_tag ? <span className="pulse-slide__tag">{post.asset_tag}</span> : null}
      </div>
    </section>
  );
}

export { gridCardTitle };
