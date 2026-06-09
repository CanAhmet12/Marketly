/** posts tablosu — `likes`/`comments` ve `likes_count`/`comments_count` çift sütun uyumu */

export function readPostLikes(row: Record<string, unknown>): number {
  if (typeof row.likes === "number") return row.likes;
  if (typeof row.likes_count === "number") return row.likes_count;
  return 0;
}

export function readPostComments(row: Record<string, unknown>): number {
  if (typeof row.comments === "number") return row.comments;
  if (typeof row.comments_count === "number") return row.comments_count;
  return 0;
}
