import type { FeedPost } from "@/features/feed/types";

import { formatCompactCount } from "./format-compact-count";
import { formatRelativeShort } from "./format-relative-short";

export type EditorialCardModel = {
  id: string;
  creatorName: string;
  handle: string;
  badge: string;
  avatarUrl: string;
  timeLabel: string;
  title: string;
  body: string;
  mediaUrl: string | null;
  mediaWidth: number;
  mediaHeight: number;
  topics: string[];
  likesLabel: string;
  commentsLabel: string;
  repostsLabel: string;
};

function firstMediaUrl(post: FeedPost): string | null {
  const m = post.media_urls?.[0];
  if (m?.url) return m.url;
  if (post.image_url) return post.image_url;
  if (post.thumbnail_url) return post.thumbnail_url;
  return null;
}

function topicTags(post: FeedPost): string[] {
  const tags: string[] = [];
  if (post.asset_tag?.trim()) tags.push(post.asset_tag.trim());
  const re = /#([A-Za-zğüşöçıİĞÜŞÖÇ0-9_]+)/g;
  const seen = new Set(tags.map((t) => t.toLowerCase()));
  let m: RegExpExecArray | null;
  const content = post.content ?? "";
  while ((m = re.exec(content)) !== null) {
    const t = m[1];
    if (!seen.has(t.toLowerCase())) {
      seen.add(t.toLowerCase());
      tags.push(t);
      if (tags.length >= 6) break;
    }
  }
  return tags;
}

function displayHeadline(post: FeedPost): string {
  const t = post.title?.trim();
  if (t) return t;
  const c = (post.content ?? "").trim();
  if (!c) return "Gönderi";
  const line = c.split(/\r?\n/)[0] ?? c;
  return line.length > 140 ? `${line.slice(0, 137)}…` : line;
}

function displayBody(post: FeedPost): string {
  const t = post.title?.trim();
  const c = (post.content ?? "").trim();
  if (t) return c;
  const lines = c.split(/\r?\n/);
  if (lines.length <= 1) return "";
  return lines.slice(1).join("\n").trim();
}

export function feedPostToEditorialCardModel(post: FeedPost): EditorialCardModel {
  const handle = post.author_handle.startsWith("@") ? post.author_handle : `@${post.author_handle}`;
  const mediaUrl = firstMediaUrl(post);
  const tw = post.media_urls?.[0]?.width ?? 1200;
  const th = post.media_urls?.[0]?.height ?? 675;

  return {
    id: post.id,
    creatorName: post.author_name,
    handle,
    badge: post.author_tier,
    avatarUrl: post.author_avatar ?? "",
    timeLabel: formatRelativeShort(post.created_at),
    title: displayHeadline(post),
    body: displayBody(post),
    mediaUrl,
    mediaWidth: tw,
    mediaHeight: th,
    topics: topicTags(post),
    likesLabel: formatCompactCount(post.likes),
    commentsLabel: formatCompactCount(post.comments),
    repostsLabel: "—",
  };
}
