import { isLivePost, isPulsePost, isVideoLikePost, pickGridThumbnail, pickDurationSeconds } from "@/features/feed/feed-display";
import { liveHrefForPostId } from "@/features/live/live-href";
import { pulseHrefForPostId } from "@/features/pulse/pulse-href";
import type { PostCommentRow, PostDetail } from "@/features/post/types";
import { avatarUrl as fallbackAvatar } from "@/lib/avatar-url";

export type PostDetailImageItem = { url: string; type: "image" | "gif" };

export type PostDetailMedia =
  | { kind: "gallery"; items: PostDetailImageItem[] }
  | { kind: "video"; poster: string | null; watchHref: string; duration: number | null }
  | null;

export type PostDetailShellKind = "live" | "pulse" | "video";

export type PostDetailShellHint = {
  kind: PostDetailShellKind;
  href: string;
  title: string;
  description: string;
  cta: string;
  topbarLabel: string;
};

/** `/post/[id]` üzerinde kanonik route farklıysa banner + shell accent */
export function resolvePostDetailShellHint(post: PostDetail): PostDetailShellHint | null {
  if (isPulsePost(post)) {
    return {
      kind: "pulse",
      href: pulseHrefForPostId(post.id),
      title: "Pulse gönderisi",
      description: "Kısa form içerik tam ekran Pulse deneyiminde daha iyi çalışır.",
      cta: "Pulse'ta izle",
      topbarLabel: "Pulse",
    };
  }
  if (isLivePost(post)) {
    return {
      kind: "live",
      href: liveHrefForPostId(post.id),
      title: "Canlı yayın",
      description: "Sohbet ve yayın kontrolleri canlı sayfada açılır.",
      cta: "Canlıya git",
      topbarLabel: "Canlı",
    };
  }
  if (isVideoLikePost(post)) {
    return {
      kind: "video",
      href: `/watch/${post.id}`,
      title: "Video gönderisi",
      description: "Oynatıcı, bölümler ve ilgili videolar watch sayfasında.",
      cta: "Videoyu izle",
      topbarLabel: "Video",
    };
  }
  return null;
}

/** Görsel / video medyasını tek noktadan çöz — feed ile uyumlu fallback zinciri */
export function resolvePostDetailMedia(post: PostDetail): PostDetailMedia {
  const hasVideoMedia = post.media_urls?.some((m) => m.type === "video") ?? false;
  const video = isVideoLikePost(post) || Boolean(post.video_url?.trim()) || hasVideoMedia;

  if (video) {
    const href = isPulsePost(post)
      ? pulseHrefForPostId(post.id)
      : isLivePost(post)
        ? liveHrefForPostId(post.id)
        : `/watch/${post.id}`;
    return {
      kind: "video",
      poster: pickGridThumbnail(post),
      watchHref: href,
      duration: pickDurationSeconds(post),
    };
  }

  const items =
    post.media_urls?.filter((m) => m.type === "image" || m.type === "gif").map((m) => ({
      url: m.url,
      type: m.type as "image" | "gif",
    })) ?? [];

  if (items.length > 0) return { kind: "gallery", items };

  if (post.image_url?.trim()) {
    return { kind: "gallery", items: [{ url: post.image_url, type: "image" }] };
  }

  const thumb = post.thumbnail_url?.trim();
  if (thumb) return { kind: "gallery", items: [{ url: thumb, type: "image" }] };

  return null;
}

export function tierDotClass(tier: string): string {
  if (tier === "elite") return "bg-[var(--color-tier-elite)]";
  if (tier === "pro") return "bg-[var(--color-tier-pro)]";
  return "bg-[var(--color-tier-free)]";
}

export function authorAvatarSrc(post: Pick<PostDetail, "user_id" | "author_avatar" | "author_name">): string {
  if (post.author_avatar?.trim()) return post.author_avatar;
  return fallbackAvatar(post.user_id, post.author_name);
}

export function isVideoLike(post: Pick<PostDetail, "type">): boolean {
  const t = post.type ?? "";
  return t === "video" || t === "short" || t === "live";
}

export function videoPoster(post: PostDetail): string | null {
  if (post.thumbnail_url?.trim()) return post.thumbnail_url;
  if (post.image_url?.trim()) return post.image_url;
  const first = post.media_urls?.[0];
  if (first?.thumbnail_url) return first.thumbnail_url;
  if (first?.type === "image") return first.url;
  return null;
}

export const EMPTY_COMMENTS: PostCommentRow[] = [];

export function partitionThread(comments: PostCommentRow[]) {
  const tops = comments.filter((c) => !c.parent_comment_id);
  const topIds = new Set(tops.map((c) => c.id));
  const replies = comments.filter((c) => c.parent_comment_id && topIds.has(c.parent_comment_id));
  const byParent = new Map<string, PostCommentRow[]>();
  for (const r of replies) {
    const pid = r.parent_comment_id!;
    if (!byParent.has(pid)) byParent.set(pid, []);
    byParent.get(pid)!.push(r);
  }
  return { tops, byParent };
}

export type CommentTreeNode = { comment: PostCommentRow; children: CommentTreeNode[] };

export const MAX_COMMENT_DEPTH = 3;

export function commentDepthFromParent(parentId: string | null, byId: Map<string, PostCommentRow>): number {
  let d = 0;
  let cur = parentId;
  while (cur) {
    const row = byId.get(cur);
    if (!row) break;
    d += 1;
    cur = row.parent_comment_id;
    if (d > 20) break;
  }
  return d;
}

export function buildCommentForest(comments: PostCommentRow[]): CommentTreeNode[] {
  const children = new Map<string | null, PostCommentRow[]>();
  for (const c of comments) {
    const pid = c.parent_comment_id ?? null;
    if (!children.has(pid)) children.set(pid, []);
    children.get(pid)!.push(c);
  }
  const sortFn = (a: PostCommentRow, b: PostCommentRow) =>
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  const roots = (children.get(null) ?? []).sort(sortFn);

  function attach(row: PostCommentRow): CommentTreeNode {
    const ch = (children.get(row.id) ?? []).sort(sortFn).map(attach);
    return { comment: row, children: ch };
  }
  return roots.map(attach);
}

export async function sharePostDetail(post: PostDetail, url: string): Promise<void> {
  const snippet = post.content?.trim()
    ? `${post.content.slice(0, 140)}${post.content.length > 140 ? "…" : ""}`
    : post.title || "Marketly gönderisi";
  const text = `${post.author_name}: ${snippet}\n${url}`;
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
