/* eslint-disable @next/next/no-img-element */

import type { FeedPost } from "@/features/feed/types";
import type { PostDetail } from "@/features/post/types";

export function QuotedBlock({ quoted }: { quoted: FeedPost }) {
  return (
    <div className="mt-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
      <p className="text-xs font-semibold text-[var(--color-text)]">
        {quoted.author_name} <span className="font-normal text-[var(--color-muted)]">{quoted.author_handle}</span>
      </p>
      <p className="mt-1 line-clamp-4 text-sm text-[var(--color-text-sub)]">{quoted.content}</p>
    </div>
  );
}

export function MediaBlock({ post }: { post: PostDetail }) {
  const items = post.media_urls?.filter((m) => m.type === "image" || m.type === "gif") ?? [];
  const single = post.image_url && items.length === 0;
  if (!single && items.length === 0) return null;

  if (single) {
    return (
      <div className="mt-3 overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)]">
        <img src={post.image_url!} alt="" className="max-h-[480px] w-full object-cover" loading="lazy" />
      </div>
    );
  }

  if (items.length === 1) {
    return (
      <div className="mt-3 overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)]">
        <img src={items[0].url} alt="" className="max-h-[480px] w-full object-cover" loading="lazy" />
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

export function LinkPreviewBlock({ preview }: { preview: NonNullable<PostDetail["link_preview"]> }) {
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
