"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { FeedPost } from "@/features/feed/types";
import type { FeedRecommendationFeedbackAction } from "@/features/personalization/domain/personalization-types";
import { getPersonalizationRepository } from "@/features/personalization/repository";
import { cn } from "@/lib/cn";

type Props = {
  post: FeedPost;
  className?: string;
  onShare?: () => void;
};

export function HomeFeedPostMenu({ post, className, onShare }: Props) {
  const [open, setOpen] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const flash = useCallback((msg: string) => {
    setHint(msg);
    window.setTimeout(() => setHint(null), 2200);
  }, []);

  const feedback = useCallback(
    (action: FeedRecommendationFeedbackAction, msg: string) => {
      getPersonalizationRepository().applyFeedFeedback(action);
      setOpen(false);
      flash(msg);
    },
    [flash],
  );

  const postUrl =
    typeof window !== "undefined" ? `${window.location.origin}/post/${post.id}` : `/post/${post.id}`;

  const asset = post.asset_tag?.trim().replace(/^#/, "").toUpperCase() ?? null;

  return (
    <div className={cn("hv-ref-article__menu", className)} ref={rootRef}>
      <button
        type="button"
        className="hv-ref-article__menu-btn"
        aria-label="Gönderi seçenekleri"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <circle cx="5" cy="12" r="1.75" />
          <circle cx="12" cy="12" r="1.75" />
          <circle cx="19" cy="12" r="1.75" />
        </svg>
      </button>

      {hint ? <span className="hv-ref-article__menu-hint">{hint}</span> : null}

      {open ? (
        <div className="hv-ref-article__menu-popover" role="menu">
          <button
            type="button"
            role="menuitem"
            className="hv-ref-article__menu-item"
            onClick={() => feedback({ type: "hide_post", postId: post.id }, "Gönderi gizlendi")}
          >
            Bu gönderiyi gizle
          </button>
          <button
            type="button"
            role="menuitem"
            className="hv-ref-article__menu-item"
            onClick={() => feedback({ type: "less_like", postId: post.id }, "Daha az benzer içerik")}
          >
            Daha az göster
          </button>
          <button
            type="button"
            role="menuitem"
            className="hv-ref-article__menu-item"
            onClick={() => feedback({ type: "mute_creator", creatorId: post.user_id }, "Üretici sessize alındı")}
          >
            {post.author_name} — sessize al
          </button>
          {asset ? (
            <button
              type="button"
              role="menuitem"
              className="hv-ref-article__menu-item"
              onClick={() => feedback({ type: "mute_asset", symbol: asset }, `${asset} gizlendi`)}
            >
              #{asset} — daha az göster
            </button>
          ) : null}
          <button
            type="button"
            role="menuitem"
            className="hv-ref-article__menu-item"
            onClick={() => {
              void navigator.clipboard.writeText(postUrl).then(() => flash("Bağlantı kopyalandı"));
              setOpen(false);
            }}
          >
            Bağlantıyı kopyala
          </button>
          <button
            type="button"
            role="menuitem"
            className="hv-ref-article__menu-item"
            onClick={() => {
              onShare?.();
              setOpen(false);
            }}
          >
            Paylaş
          </button>
        </div>
      ) : null}
    </div>
  );
}
