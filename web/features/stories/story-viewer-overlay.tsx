"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import type { StorySlide } from "@/features/stories/types";
import { messagesInboxWithPeer } from "@/features/messages/routes";

const STORY_MS = 5000;

type Props = {
  slides: StorySlide[];
  startIndex: number;
  open: boolean;
  onClose: () => void;
  onViewed: (storyId: string) => void;
};

function IconClose() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconChevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d={dir === "left" ? "M14 6l-6 6 6 6" : "M10 6l6 6-6 6"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StoryViewerOverlay({ slides, startIndex, open, onClose, onViewed }: Props) {
  const [index, setIndex] = useState(startIndex);
  const [paused, setPaused] = useState(false);
  const [mounted, setMounted] = useState(false);
  const viewedRef = useRef<Set<string>>(new Set());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const current = slides[index];

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (open) setIndex(startIndex);
  }, [open, startIndex]);

  const goNext = useCallback(() => {
    if (index < slides.length - 1) setIndex((i) => i + 1);
    else onClose();
  }, [index, onClose, slides.length]);

  const goPrev = useCallback(() => {
    if (index > 0) setIndex((i) => i - 1);
  }, [index]);

  useEffect(() => {
    if (!open || !current || paused) return;

    if (!viewedRef.current.has(current.id)) {
      const markTimer = setTimeout(() => {
        viewedRef.current.add(current.id);
        onViewed(current.id);
      }, 1000);
      timerRef.current = setTimeout(goNext, STORY_MS);
      return () => {
        clearTimeout(markTimer);
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }

    timerRef.current = setTimeout(goNext, STORY_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [open, current, paused, index, goNext, onViewed]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, goNext, goPrev]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const onTapZone = (side: "left" | "right") => {
    if (side === "left") goPrev();
    else goNext();
  };

  if (!mounted || !open || !current) return null;

  return createPortal(
    <div
      className="story-viewer"
      role="dialog"
      aria-modal
      aria-label="Hikâye"
      onClick={onClose}
    >
      {index > 0 ? (
        <button
          type="button"
          className="story-viewer__nav story-viewer__nav--prev"
          aria-label="Önceki hikâye"
          onClick={(e) => {
            e.stopPropagation();
            goPrev();
          }}
        >
          <IconChevron dir="left" />
        </button>
      ) : null}

      {index < slides.length - 1 ? (
        <button
          type="button"
          className="story-viewer__nav story-viewer__nav--next"
          aria-label="Sonraki hikâye"
          onClick={(e) => {
            e.stopPropagation();
            goNext();
          }}
        >
          <IconChevron dir="right" />
        </button>
      ) : null}

      <article className="story-viewer__frame" onClick={(e) => e.stopPropagation()}>
        <div className="story-viewer__progress" aria-hidden>
          {slides.map((s, i) => (
            <div key={s.id} className="story-viewer__progress-track">
              <div
                className="story-viewer__progress-fill"
                data-state={i < index ? "done" : i === index && !paused ? "active" : i === index ? "paused" : "idle"}
                style={i === index && !paused ? { animationDuration: `${STORY_MS}ms` } : undefined}
              />
            </div>
          ))}
        </div>

        <header className="story-viewer__header">
          <Link
            href={`/channel/${encodeURIComponent(current.userId)}`}
            className="story-viewer__user"
            onClick={onClose}
          >
            <Image
              src={current.profileImage}
              alt=""
              width={36}
              height={36}
              className="story-viewer__avatar"
              unoptimized
            />
            <div className="story-viewer__user-meta">
              <span className="story-viewer__username">{current.username}</span>
              {current.label && current.label !== current.username ? (
                <span className="story-viewer__label">{current.label}</span>
              ) : null}
            </div>
          </Link>
          <button type="button" className="story-viewer__close" onClick={onClose} aria-label="Kapat">
            <IconClose />
          </button>
        </header>

        <div className="story-viewer__stage">
          {current.mediaType === "video" ? (
            <video
              key={current.id}
              className="story-viewer__media"
              src={current.mediaUrl}
              autoPlay
              playsInline
              muted
              onPlay={() => setPaused(false)}
              onPause={() => setPaused(true)}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={current.id} src={current.mediaUrl} alt="" className="story-viewer__media" />
          )}
          <div className="story-viewer__stage-scrim" aria-hidden />

          <div className="story-viewer__zones" aria-hidden>
            <button type="button" className="story-viewer__zone story-viewer__zone--left" onClick={() => onTapZone("left")} tabIndex={-1} />
            <button type="button" className="story-viewer__zone story-viewer__zone--right" onClick={() => onTapZone("right")} tabIndex={-1} />
          </div>
        </div>

        <footer className="story-viewer__footer">
          <Link
            href={messagesInboxWithPeer(current.userId)}
            className="story-viewer__reply"
            onClick={onClose}
          >
            <span className="story-viewer__reply-placeholder">Hikâyeye yanıt ver…</span>
          </Link>
        </footer>
      </article>
    </div>,
    document.body,
  );
}
