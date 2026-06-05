import type { FeedPost } from "./types";

/** Aynı `id` birden fazla sayfada / birleşimde gelirse listeyi stabil tekilleştirir (React key uyarısı önlenir). */
export function dedupeFeedPostsById(posts: readonly FeedPost[]): FeedPost[] {
  const seen = new Set<string>();
  const out: FeedPost[] = [];
  for (const p of posts) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    out.push(p);
  }
  return out;
}
