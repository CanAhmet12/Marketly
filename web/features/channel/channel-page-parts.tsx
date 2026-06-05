/* eslint-disable @next/next/no-img-element -- storage URL */

import Link from "next/link";
import Image from "next/image";

import type { ChannelPost, ChannelTabId } from "@/features/channel/types";
import { formatTimeAgo } from "@/lib/format-time-ago";

import { thumbForPost } from "./channel-display-helpers";

export function ChannelSkeleton() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <div className="motion-shimmer h-40 w-full rounded-b-[var(--radius-lg)] bg-[var(--color-divider)] md:h-52" />
      <div className="mx-auto flex max-w-[1200px] flex-col gap-4 px-3 md:flex-row md:items-end md:px-6">
        <div className="motion-shimmer -mt-16 h-28 w-28 shrink-0 rounded-full border-4 border-[var(--color-surface)] bg-[var(--color-divider)] md:h-36 md:w-36" />
        <div className="flex-1 space-y-3 pt-2 md:pt-0">
          <div className="motion-shimmer h-8 w-48 rounded bg-[var(--color-divider)]" />
          <div className="motion-shimmer h-4 w-32 rounded bg-[var(--color-divider)]" />
          <div className="motion-shimmer h-10 w-28 rounded bg-[var(--color-divider)]" />
        </div>
      </div>
    </div>
  );
}

export function TabButton({
  id,
  label,
  active,
  onClick,
}: {
  id: ChannelTabId;
  label: string;
  active: boolean;
  onClick: (id: ChannelTabId) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      className={
        active
          ? "inline-flex min-h-[44px] shrink-0 items-center border-b-2 border-[var(--color-primary)] px-3 py-0 text-[13px] font-semibold text-[var(--color-text)]"
          : "inline-flex min-h-[44px] shrink-0 items-center border-b-2 border-transparent px-3 py-0 text-[13px] text-[var(--color-muted)] transition hover:text-[var(--color-text)]"
      }
    >
      {label}
    </button>
  );
}

export function PostListCard({ post }: { post: ChannelPost }) {
  const thumb = thumbForPost(post);
  const snippet = post.content?.trim() || post.title || "Gönderi";
  return (
    <Link
      href={`/post/${post.id}`}
      className="flex gap-3 rounded-xl py-2 transition duration-[var(--motion-fast)] hover:bg-[rgba(255,255,255,0.04)]"
    >
      {thumb ? (
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-[var(--color-divider)]">
          {thumb.startsWith("http") ? (
            <Image src={thumb} alt="" width={64} height={64} className="h-full w-full object-cover" sizes="64px" />
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element -- local/mock thumb */
            <img src={thumb} alt="" className="h-full w-full object-cover" />
          )}
        </div>
      ) : (
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-divider)] text-lg text-[var(--color-muted)]">
          M
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="line-clamp-3 text-sm text-[var(--color-text)]">{snippet}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[var(--color-muted)]">
          <span>{formatTimeAgo(post.created_at)}</span>
          {post.asset_tag ? (
            <span className="rounded bg-[var(--color-primary-light)] px-1.5 py-0.5 font-medium text-[var(--color-primary-dark)]">
              {post.asset_tag}
            </span>
          ) : null}
          <span className="text-[var(--color-border)]">·</span>
          <span className="font-medium text-[var(--color-primary-dark)]">Gönderiyi aç</span>
        </div>
      </div>
    </Link>
  );
}
