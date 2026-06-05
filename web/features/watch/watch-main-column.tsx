"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { UseMutationResult } from "@tanstack/react-query";

import { SafeAvatar } from "@/components/ui/safe-avatar";
import { SignalDirectionPill } from "@/features/signals/components/unified-signal-primitives";
import { getSignalsRepository } from "@/features/signals/repository";
import type { WatchPostDetail } from "@/features/watch/types";
import { WatchVideoPlayer } from "@/features/watch/watch-video-player";
import { formatTimeAgo } from "@/lib/format-time-ago";
import { formatCompactCount } from "@/lib/format-compact-count";
import { signalLifecycleLabel } from "@/features/signals/domain/signal-meta";

import { authorAvatarSrc, isVideoishPost, shareWatchPost, tierDotClass } from "./watch-helpers";

function TypeBadge({ type }: { type: string | null }) {
  const t = (type ?? "").toLowerCase();
  if (t === "live") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/12 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-red-600 ring-1 ring-red-500/25">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
        Canlı
      </span>
    );
  }
  if (t === "short" || t === "pulse") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-primary-light)] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[var(--color-primary-dark)] ring-1 ring-[var(--color-primary)]/20">
        ⚡ Pulse
      </span>
    );
  }
  if (t === "video") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
        Video
      </span>
    );
  }
  return null;
}

function MarketContextBlock({ assetTag }: { assetTag: string }) {
  const clean = useMemo(() => assetTag.replace(/^#/, "").trim(), [assetTag]);
  const snapshot = useMemo(() => {
    const rows = getSignalsRepository().getFeedRows().filter((r) => r.symbol.toUpperCase() === clean.toUpperCase());
    if (!rows.length) return null;
    const activeN = rows.filter((r) => r.is_active).length;
    const best = [...rows].sort((a, b) => b.confidence - a.confidence)[0]!;
    const pulse = getSignalsRepository().getAssetSignalCommunityPulse(clean);
    return { activeN, best, pulse };
  }, [clean]);

  return (
    <div className="mt-5 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary-light)] text-[11px] font-bold text-[var(--color-primary-dark)]">
            {assetTag.replace(/^#/, "").slice(0, 2)}
          </div>
          <div>
            <p className="text-[13px] font-bold text-[var(--color-text)]">{assetTag}</p>
            <p className="text-[11px] text-[var(--color-meta)]">Piyasa bağlamı</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/markets/${encodeURIComponent(clean)}`}
            className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-1 text-[11px] font-semibold text-[var(--color-text-secondary)] transition hover:border-[var(--color-primary)]/40 hover:text-[var(--color-text)]"
          >
            Piyasa →
          </Link>
          <Link
            href={`/signals?asset=${encodeURIComponent(clean)}`}
            className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-1 text-[11px] font-semibold text-[var(--color-text-secondary)] transition hover:border-[var(--color-primary)]/40 hover:text-[var(--color-text)]"
          >
            Sinyaller →
          </Link>
        </div>
      </div>
      {snapshot?.best ? (
        <div className="mt-3 flex min-w-0 flex-wrap items-center gap-2 rounded-lg border border-[var(--ms-border-hairline)] bg-[color-mix(in_srgb,var(--color-text)_3%,var(--color-surface))] px-2.5 py-2">
          <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-meta)]">Sinyal özeti</span>
          <SignalDirectionPill direction={snapshot.best.direction} className="!py-px text-[10px]" />
          <span className="text-[12px] font-semibold tabular-nums text-[var(--color-text)]">%{snapshot.best.confidence}</span>
          <span className="truncate text-[10px] font-semibold text-[var(--color-text-secondary)]">
            {signalLifecycleLabel(snapshot.best.lifecycle_phase)}
          </span>
          <span className="text-[11px] font-medium text-[var(--color-meta)]">{snapshot.activeN} aktif çağrı</span>
        </div>
      ) : null}
      {snapshot?.pulse ? (
        <p className="mt-2 line-clamp-2 text-[11px] font-medium leading-snug text-[var(--color-text-secondary)]">
          <span className="font-bold text-[var(--color-meta)]">Sinyal topluluğu · </span>
          {snapshot.pulse.trendingSnippet}
        </p>
      ) : null}
      {!snapshot?.best ? (
        <p className="mt-3 text-[11px] font-medium text-[var(--color-meta)]">Sinyal verisi yok — piyasada veya sinyal pazarında takip edin.</p>
      ) : null}
    </div>
  );
}

const actionBtnBase =
  "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition duration-[var(--motion-fast)] active:scale-[0.97] disabled:opacity-50";

type Props = {
  post: WatchPostDetail;
  videoSrc: string | null;
  poster: string | null;
  isLiveType: boolean;
  onLike: () => void;
  onSave: () => void;
  likeMutation: UseMutationResult<unknown, Error, void, unknown>;
  saveMutation: UseMutationResult<unknown, Error, void, unknown>;
  onScrollToComments?: () => void;
};

export function WatchMainColumn({
  post,
  videoSrc,
  poster,
  isLiveType,
  onLike,
  onSave,
  likeMutation,
  saveMutation,
  onScrollToComments,
}: Props) {
  const [descExpanded, setDescExpanded] = useState(false);
  const notReallyVideo = !isVideoishPost(post) && !videoSrc;
  const displayTitle = post.title?.trim() || post.content?.slice(0, 120) || "İzle";
  const durationStr =
    post.duration && post.duration > 0
      ? post.duration >= 3600
        ? `${Math.floor(post.duration / 3600)}:${String(Math.floor((post.duration % 3600) / 60)).padStart(2, "0")}:${String(post.duration % 60).padStart(2, "0")}`
        : `${Math.floor(post.duration / 60)}:${String(post.duration % 60).padStart(2, "0")}`
      : null;

  const descriptionText = post.description?.trim() || (post.content?.trim() && post.content !== post.title ? post.content : "");
  const descLong = descriptionText.length > 220;

  return (
    <div className="space-y-0">
      {/* ── VIDEO PLAYER ── */}
      {notReallyVideo ? (
        <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-12 text-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-[var(--color-meta)]" aria-hidden>
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" strokeLinecap="round" />
          </svg>
          <p className="mt-3 text-[14px] font-semibold text-[var(--color-text)]">Bu içerik video oynatıcıda açılamıyor</p>
          <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-[var(--color-muted)]">
            Video kaynağı veya uygun format yok. Metin gönderileri için mobil uygulamayı kullanabilirsiniz.
          </p>
        </div>
      ) : (
        <WatchVideoPlayer src={videoSrc} poster={poster} isLiveType={isLiveType} />
      )}

      {/* ── TITLE + META ── */}
      <div className="pt-4">
        <div className="flex flex-wrap items-start gap-2">
          <h1 className="flex-1 text-[18px] font-bold leading-snug tracking-tight text-[var(--color-text)] md:text-[20px]">
            {displayTitle}
          </h1>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
          <TypeBadge type={post.type} />
          <span className="text-[12px] font-medium text-[var(--color-text-secondary)]">
            {formatCompactCount(post.views_count)} görüntülenme
          </span>
          <span className="text-[var(--color-divider)]">·</span>
          <span className="text-[12px] text-[var(--color-meta)]">{formatTimeAgo(post.created_at)}</span>
          {durationStr ? (
            <>
              <span className="text-[var(--color-divider)]">·</span>
              <span className="text-[12px] text-[var(--color-meta)]">{durationStr}</span>
            </>
          ) : null}
          {post.asset_tag ? (
            <>
              <span className="text-[var(--color-divider)]">·</span>
              <Link
                href={`/markets/${encodeURIComponent(post.asset_tag)}`}
                className="rounded-md bg-[var(--color-signal-tag-bg)] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--color-signal-tag-text)] ring-1 ring-[color:var(--color-ring-subtle)] transition hover:opacity-80"
              >
                #{post.asset_tag}
              </Link>
            </>
          ) : null}
        </div>
      </div>

      {/* ── ACTION ROW ── */}
      <div className="flex flex-wrap gap-2 border-b border-[var(--color-divider)] py-3">
        <button
          type="button"
          onClick={onLike}
          disabled={likeMutation.isPending}
          aria-pressed={post.is_liked}
          aria-label={post.is_liked ? "Beğeniyi kaldır" : "Beğen"}
          className={`${actionBtnBase} ${
            post.is_liked
              ? "border-[color-mix(in_srgb,var(--color-primary)_45%,var(--color-border))] bg-[var(--color-primary-light)] text-[var(--color-primary-dark)]"
              : "border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-text)] hover:border-[color-mix(in_srgb,var(--color-primary)_32%,var(--color-border))] hover:bg-[var(--color-surface-hover)]"
          }`}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill={post.is_liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeLinejoin="round" />
          </svg>
          {post.likes.toLocaleString("tr-TR")}
        </button>

        <button
          type="button"
          onClick={() => onScrollToComments?.()}
          disabled={!onScrollToComments}
          aria-label="Yorumlara git"
          className={`${actionBtnBase} border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] ${
            onScrollToComments ? "cursor-pointer hover:border-[color-mix(in_srgb,var(--color-primary)_32%,var(--color-border))] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]" : "cursor-default"
          }`}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" strokeLinejoin="round" />
          </svg>
          {post.comments.toLocaleString("tr-TR")}
        </button>

        <button
          type="button"
          onClick={onSave}
          disabled={saveMutation.isPending}
          aria-pressed={post.is_saved}
          aria-label={post.is_saved ? "Kaydedilenlerden çıkar" : "Kaydet"}
          className={`${actionBtnBase} ${
            post.is_saved
              ? "border-[color-mix(in_srgb,var(--color-primary)_45%,var(--color-border))] bg-[var(--color-primary-light)] text-[var(--color-primary-dark)]"
              : "border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-text)] hover:border-[color-mix(in_srgb,var(--color-primary)_32%,var(--color-border))] hover:bg-[var(--color-surface-hover)]"
          }`}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill={post.is_saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" strokeLinejoin="round" />
          </svg>
          {post.is_saved ? "Kaydedildi" : "Kaydet"}
        </button>

        <button
          type="button"
          onClick={() => void shareWatchPost(post)}
          aria-label="Paylaş"
          className={`${actionBtnBase} border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-text)] hover:border-[color-mix(in_srgb,var(--color-primary)_32%,var(--color-border))] hover:bg-[var(--color-surface-hover)]`}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
            <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" strokeLinecap="round" />
          </svg>
          Paylaş
        </button>
      </div>

      {/* ── CREATOR ROW ── */}
      <div className="flex flex-wrap items-center gap-3 border-b border-[var(--color-divider)] py-4">
        <Link href={`/channel/${post.user_id}`} className="group flex min-w-0 flex-1 items-center gap-3">
          <SafeAvatar
            src={authorAvatarSrc(post)}
            alt={`${post.author_name} profil fotoğrafı`}
            size={48}
            className="h-11 w-11 shrink-0 rounded-full ring-1 ring-[color:var(--color-ring-subtle)] transition group-hover:ring-[color-mix(in_srgb,var(--color-primary)_35%,transparent)]"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="truncate text-[14px] font-bold text-[var(--color-text)] group-hover:text-[var(--color-primary-dark)]">
                {post.author_name}
              </span>
              <span className={`h-2 w-2 shrink-0 rounded-full ${tierDotClass(post.author_tier)}`} title={post.author_tier} />
            </div>
            <p className="truncate text-[12px] text-[var(--color-meta)]">{post.author_handle}</p>
          </div>
        </Link>
        <Link
          href={`/channel/${post.user_id}`}
          className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-1.5 text-[13px] font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-surface-hover)]"
        >
          Profile git
        </Link>
      </div>

      {/* ── DESCRIPTION ── */}
      {descriptionText ? (
        <div className="py-4">
          <p
            className={`whitespace-pre-wrap text-[14px] leading-relaxed text-[var(--color-text-secondary)] ${
              descLong && !descExpanded ? "line-clamp-3" : ""
            }`}
          >
            {descriptionText}
          </p>
          {descLong ? (
            <button
              type="button"
              onClick={() => setDescExpanded((v) => !v)}
              className="mt-2 text-[12px] font-semibold text-[var(--color-primary-dark)] hover:underline"
            >
              {descExpanded ? "Daha az göster" : "Daha fazla göster"}
            </button>
          ) : null}
        </div>
      ) : null}

      {/* ── MARKET CONTEXT ── */}
      {post.asset_tag ? <MarketContextBlock assetTag={post.asset_tag} /> : null}
    </div>
  );
}
