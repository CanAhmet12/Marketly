"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { formatDurationBadge } from "@/features/feed/feed-display";
import { resolvePostDetailMedia, type PostDetailMedia } from "../post-detail-helpers";
import type { PostDetail } from "../types";

interface Props {
  post: PostDetail;
}

function ChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7L8 5Z" />
    </svg>
  );
}

function GalleryBlock({ media }: { media: Extract<PostDetailMedia, { kind: "gallery" }> }) {
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [failed, setFailed] = useState<Record<number, boolean>>({});
  const lightboxTriggerRef = useRef<HTMLElement | null>(null);

  const closeLightbox = useCallback(() => {
    setLightbox(false);
    lightboxTriggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [lightbox, closeLightbox]);

  const current = media.items[index];
  const hasMultiple = media.items.length > 1;

  const onError = useCallback(() => {
    setFailed((prev) => ({ ...prev, [index]: true }));
  }, [index]);

  if (!current || failed[index]) {
    return (
      <div className="pd-media-inset">
        <div className="pd-media-shell pd-media-shell--empty">Görsel yüklenemedi</div>
      </div>
    );
  }

  return (
    <>
      <div className="pd-media-inset">
        <div className="pd-media-shell">
          <img
            src={current.url}
            alt=""
            loading="eager"
            onClick={(e) => {
              lightboxTriggerRef.current = e.currentTarget;
              setLightbox(true);
            }}
            onError={onError}
          />

          {hasMultiple && (
            <>
              <span className="pd-media-counter">
                {index + 1}/{media.items.length}
              </span>
              {index > 0 && (
                <button
                  type="button"
                  className="pd-media-nav pd-media-nav--prev"
                  onClick={() => setIndex((i) => i - 1)}
                  aria-label="Önceki görsel"
                >
                  <ChevronLeft />
                </button>
              )}
              {index < media.items.length - 1 && (
                <button
                  type="button"
                  className="pd-media-nav pd-media-nav--next"
                  onClick={() => setIndex((i) => i + 1)}
                  aria-label="Sonraki görsel"
                >
                  <ChevronRight />
                </button>
              )}
              <div className="pd-media-dots">
                {media.items.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`pd-media-dot${i === index ? " pd-media-dot--active" : ""}`}
                    onClick={() => setIndex(i)}
                    aria-label={`Görsel ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {lightbox && (
        <div className="pd-lightbox" onClick={closeLightbox} role="dialog" aria-modal="true" aria-label="Görsel önizleme">
          <button type="button" className="pd-lightbox-close" onClick={closeLightbox} aria-label="Kapat">
            ✕
          </button>
          <img src={current.url} alt="" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </>
  );
}

function VideoBlock({ media }: { media: Extract<PostDetailMedia, { kind: "video" }> }) {
  return (
    <div className="pd-media-inset">
      <div className="pd-media-shell pd-media-shell--video">
        <div className="pd-video-frame">
          {media.poster ? (
            <img src={media.poster} alt="" loading="eager" />
          ) : (
            <div className="pd-media-shell--empty">Video önizlemesi yok</div>
          )}
          <div className="pd-video-overlay">
            <Link href={media.watchHref} className="pd-video-play">
              <PlayIcon />
              {media.duration ? formatDurationBadge(media.duration) : "İzle"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PostDetailMediaHero({ post }: Props) {
  const media = resolvePostDetailMedia(post);
  if (!media) return null;

  if (media.kind === "video") return <VideoBlock media={media} />;
  return <GalleryBlock media={media} />;
}
