"use client";

/* eslint-disable @next/next/no-img-element -- gönderi medyası / link preview rastgele domain */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, memo, type ReactNode } from "react";

import { SafeAvatar } from "@/components/ui/safe-avatar";
import { isVideoLikePost } from "@/features/feed/feed-display";
import type { FeedPost } from "@/features/feed/types";
import { avatarUrl as fallbackAvatar } from "@/lib/avatar-url";
import { formatTimeAgo } from "@/lib/format-time-ago";

function tierDotClass(tier: string): string {
  if (tier === "elite") return "bg-[var(--color-tier-elite)]";
  if (tier === "pro") return "bg-[var(--color-tier-pro)]";
  return "bg-[var(--color-tier-free)]";
}

function tierBadgeClass(tier: string): string {
  if (tier === "elite") return "border-amber-200/80 bg-amber-50 text-amber-900";
  if (tier === "pro") return "border-blue-200/80 bg-blue-50 text-blue-900";
  return "border-[var(--color-border)] bg-[var(--color-chip-bg)] text-[var(--color-text-sub)]";
}

function tierShortLabel(tier: string): string {
  if (tier === "elite") return "Elite";
  if (tier === "pro") return "Pro";
  return "Free";
}

function authorAvatarSrc(post: FeedPost): string {
  if (post.author_avatar && post.author_avatar.trim().length > 0) return post.author_avatar;
  return fallbackAvatar(post.user_id, post.author_name);
}

function videoPoster(post: FeedPost): string | null {
  if (post.thumbnail_url) return post.thumbnail_url;
  if (post.image_url) return post.image_url;
  const first = post.media_urls?.[0];
  if (first?.thumbnail_url) return first.thumbnail_url;
  if (first?.type === "image") return first.url;
  return null;
}

async function shareNative(post: FeedPost) {
  const snippet = post.content?.trim() ? `${post.content.slice(0, 140)}${post.content.length > 140 ? "…" : ""}` : post.title || "Marketly gönderisi";
  const text = `${post.author_name}: ${snippet}`;
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ title: "Marketly", text });
      return;
    } catch {
      /* iptal */
    }
  }
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    /* yok */
  }
}

function ActionButton({
  children,
  onClick,
  disabled,
  title,
  active,
  ariaPressed,
  ariaLabel,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
  active?: boolean;
  ariaPressed?: boolean;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={ariaLabel ?? title}
      aria-busy={disabled}
      {...(ariaPressed !== undefined ? { "aria-pressed": ariaPressed } : {})}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-[var(--radius-md)] px-2.5 py-1.5 text-sm font-semibold transition-colors ${
        active
          ? "text-[var(--color-primary)] bg-[var(--color-primary-light)]"
          : "text-[var(--color-text-sub)] hover:bg-[var(--color-bg)] active:scale-[0.98]"
      } ${disabled ? "engagement-pending disabled:cursor-not-allowed" : ""}`}
    >
      {children}
    </button>
  );
}

function IconHeart({ filled }: { filled?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <path
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.75"
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      />
    </svg>
  );
}

function IconComment() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 10h12M6 14h8"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M4 18V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-5 4v-4H6a2 2 0 0 1-2-2Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconBookmark({ filled }: { filled?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 4h10a2 2 0 0 1 2 2v15l-7-4-7 4V6a2 2 0 0 1 2-2Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconShare() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 3v12M8 7l4-4 4 4M5 14h14v5a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function IconPlay() {
  return (
    <svg width="56" height="56" viewBox="0 0 24 24" className="text-white drop-shadow-md" aria-hidden>
      <circle cx="12" cy="12" r="11" fill="rgba(0,0,0,0.45)" />
      <path d="M10 8l7 4-7 4V8Z" fill="#fff" />
    </svg>
  );
}

function MediaBlock({ post }: { post: FeedPost }) {
  const items = post.media_urls?.filter((m) => m.type === "image" || m.type === "gif") ?? [];
  const single = post.image_url && items.length === 0;
  if (!single && items.length === 0) return null;

  if (single) {
    return (
      <div className="mt-3 overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)]">
        <img src={post.image_url!} alt="" className="max-h-[420px] w-full object-cover" loading="lazy" />
      </div>
    );
  }

  if (items.length === 1) {
    return (
      <div className="mt-3 overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)]">
        <img src={items[0].url} alt="" className="max-h-[420px] w-full object-cover" loading="lazy" />
      </div>
    );
  }

  return (
    <div className="mt-3 grid grid-cols-2 gap-1.5">
      {items.slice(0, 4).map((m) => (
        <div key={m.url} className="aspect-square overflow-hidden rounded-lg border border-[var(--color-border)]">
          <img src={m.url} alt="" className="h-full w-full object-cover" loading="lazy" />
        </div>
      ))}
    </div>
  );
}

function LinkPreviewBlock({ preview }: { preview: NonNullable<FeedPost["link_preview"]> }) {
  return (
    <button
      type="button"
      className="mt-3 flex w-full overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] text-left transition-shadow hover:shadow-[var(--shadow-card)]"
      onClick={() => preview.url && window.open(preview.url, "_blank", "noopener,noreferrer")}
    >
      {preview.image ? (
        <div className="relative h-24 w-28 shrink-0 bg-[var(--color-divider)]">
          <img src={preview.image} alt="" className="h-full w-full object-cover" loading="lazy" />
        </div>
      ) : null}
      <div className="min-w-0 flex-1 p-3">
        <p className="text-xs font-medium text-[var(--color-muted)]">{preview.site_name || "Bağlantı"}</p>
        <p className="mt-0.5 line-clamp-2 text-sm font-semibold text-[var(--color-text)]">{preview.title || preview.url}</p>
        {preview.description ? (
          <p className="mt-1 line-clamp-2 text-xs text-[var(--color-text-sub)]">{preview.description}</p>
        ) : null}
      </div>
    </button>
  );
}

function QuotedBlock({ quoted }: { quoted: FeedPost }) {
  return (
    <div className="mt-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
      <p className="text-xs font-semibold text-[var(--color-text)]">
        {quoted.author_name}{" "}
        <span className="font-normal text-[var(--color-muted)]">{quoted.author_handle}</span>
      </p>
      <p className="mt-1 line-clamp-3 text-sm text-[var(--color-text-sub)]">{quoted.content}</p>
    </div>
  );
}

function SocialRepostEmbed({ rep }: { rep: NonNullable<FeedPost["social_repost"]> }) {
  return (
    <div className="mt-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
      <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-meta)]">
        {rep.kind === "quote_repost" ? "Alıntılı yayın" : "Yeniden paylaşım"}
      </p>
      <Link href={`/post/${rep.source_post_id}`} className="mt-1 block text-left">
        <p className="text-xs font-semibold text-[var(--color-text)]">
          {rep.source.author_name}{" "}
          <span className="font-normal text-[var(--color-muted)]">{rep.source.author_handle}</span>
        </p>
        {rep.source.asset_tag ? (
          <span className="mt-1 inline-block rounded-md bg-[var(--color-primary-light)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-primary-dark)]">
            #{rep.source.asset_tag}
          </span>
        ) : null}
        <p className="mt-1 line-clamp-4 text-sm text-[var(--color-text-sub)]">{rep.source.content_snippet}</p>
      </Link>
    </div>
  );
}

type Props = {
  post: FeedPost;
  onToggleLike: () => void;
  likePending: boolean;
  onToggleSave: () => void;
  savePending: boolean;
  isLoggedIn: boolean;
};

function FeedPostCardInner({
  post,
  onToggleLike,
  likePending,
  onToggleSave,
  savePending,
  isLoggedIn,
}: Props) {
  const router = useRouter();
  const video = isVideoLikePost(post);

  const onLikeClick = useCallback(() => {
    if (!isLoggedIn) {
      router.push(`/auth/login?next=${encodeURIComponent("/")}`);
      return;
    }
    onToggleLike();
  }, [isLoggedIn, onToggleLike, router]);

  const onSaveClick = useCallback(() => {
    if (!isLoggedIn) {
      router.push(`/auth/login?next=${encodeURIComponent("/")}`);
      return;
    }
    onToggleSave();
  }, [isLoggedIn, onToggleSave, router]);

  const header = (
    <div className="flex items-start gap-3">
      <Link href={`/channel/${post.user_id}`} className="shrink-0">
        <SafeAvatar
          src={authorAvatarSrc(post)}
          alt={`${post.author_name} profil fotoğrafı`}
          size={44}
          className="h-11 w-11 border border-[var(--color-border)]"
        />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/channel/${post.user_id}`} className="truncate text-sm font-semibold text-[var(--color-text)] hover:underline">
            {post.author_name}
          </Link>
          <span
            className={`shrink-0 rounded-[var(--radius-pill)] border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${tierBadgeClass(post.author_tier)}`}
            title={post.author_tier}
          >
            {tierShortLabel(post.author_tier)}
          </span>
          <span className={`h-2 w-2 shrink-0 rounded-full ${tierDotClass(post.author_tier)}`} title={post.author_tier} aria-hidden />
          <span className="truncate text-sm text-[var(--color-muted)]">{post.author_handle}</span>
          <span className="text-sm text-[var(--color-muted)]">·</span>
          <span className="text-sm text-[var(--color-muted)]">{formatTimeAgo(post.created_at)}</span>
        </div>
        {post.asset_tag ? (
          <span className="mt-1 inline-block rounded-md bg-[var(--color-primary-light)] px-2 py-0.5 text-xs font-semibold text-[var(--color-primary-dark)]">
            #{post.asset_tag}
          </span>
        ) : null}
      </div>
    </div>
  );

  const actions = (
    <div className="mt-3 flex flex-wrap items-center gap-1 rounded-b-[var(--radius-lg)] border-t border-[var(--color-divider)] bg-[color-mix(in_srgb,var(--color-surface-muted)_65%,transparent)] px-1 py-2 pt-3 sm:px-2">
      <ActionButton
        onClick={onLikeClick}
        disabled={likePending}
        active={post.is_liked}
        title="Beğen"
        ariaPressed={post.is_liked}
        ariaLabel={post.is_liked ? "Beğeniyi kaldır" : "Beğen"}
      >
        <IconHeart filled={post.is_liked} />
        <span>{post.likes}</span>
      </ActionButton>
      <Link
        href={`/post/${post.id}`}
        className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] px-2.5 py-1.5 text-sm font-semibold text-[var(--color-text-sub)] hover:bg-[var(--color-bg)]"
        title="Yorumlar"
        aria-label={`Yorumlar, ${post.comments} adet`}
      >
        <IconComment />
        <span>{post.comments}</span>
      </Link>
      <ActionButton
        onClick={onSaveClick}
        disabled={savePending}
        active={post.is_saved}
        title={post.is_saved ? "Kaydedildi" : "Kaydet"}
        ariaPressed={post.is_saved}
        ariaLabel={post.is_saved ? "Kaydedilenlerden çıkar" : "Kaydet"}
      >
        <IconBookmark filled={post.is_saved} />
      </ActionButton>
      <ActionButton onClick={() => void shareNative(post)} title="Paylaş" ariaLabel="Paylaş">
        <IconShare />
      </ActionButton>
    </div>
  );

  if (video) {
    const poster = videoPoster(post);
    return (
      <article
        className="group overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card-md)] transition-shadow duration-200 hover:shadow-[var(--shadow-card-hover)]"
        style={{ marginLeft: 0, marginRight: 0 }}
      >
        <div className="p-3 md:p-4">{header}</div>
        <div className="relative aspect-video w-full bg-[#0f1117]">
          {poster ? (
            <img
              src={poster}
              alt=""
              className="h-full w-full object-cover opacity-95 transition duration-300 group-hover:scale-[1.02] group-hover:opacity-100"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1a1d2e] to-[#0f1117] text-sm text-white/70">
              Önizleme yok
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <IconPlay />
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-4 pt-16">
            <p className="line-clamp-2 text-lg font-semibold text-white md:text-xl">{post.title || post.content || "Video"}</p>
            {post.type ? (
              <span className="mt-1 inline-block rounded bg-white/15 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-white/90">
                {post.type}
              </span>
            ) : null}
          </div>
        </div>
        <div className="p-3 md:p-4">
          {post.content && post.title ? <p className="text-sm leading-relaxed text-[var(--color-text-sub)]">{post.content}</p> : null}
          {actions}
        </div>
      </article>
    );
  }

  return (
    <article
      className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-[var(--shadow-card)] transition-shadow duration-200 hover:shadow-[var(--shadow-card-hover)] md:p-4"
      style={{ marginLeft: 0, marginRight: 0 }}
    >
      {header}
      {post.social_repost?.kind === "repost" ? (
        <p className="mt-2 text-[12px] font-medium text-[var(--color-meta)]">Yeniden paylaştı</p>
      ) : null}
      {post.content ? <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-[var(--color-text)]">{post.content}</p> : null}
      {!post.social_repost || post.social_repost.kind === "quote_repost" ? <MediaBlock post={post} /> : null}
      {post.link_preview?.url && (!post.social_repost || post.social_repost.kind === "quote_repost") ? <LinkPreviewBlock preview={post.link_preview} /> : null}
      {post.social_repost ? <SocialRepostEmbed rep={post.social_repost} /> : null}
      {post.quoted_post ? <QuotedBlock quoted={post.quoted_post} /> : null}
      {actions}
    </article>
  );
}

export const FeedPostCard = memo(FeedPostCardInner);
