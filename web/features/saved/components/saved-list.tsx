import type { FeedPost } from "@/features/feed/types";
import { SavedRow } from "@/features/saved/components/saved-row";

type Props = {
  posts: FeedPost[];
  onUnsave: (postId: string) => void;
};

export function SavedList({ posts, onUnsave }: Props) {
  return (
    <ul className="sv-feed-list">
      {posts.map((post) => (
        <SavedRow key={post.id} post={post} onUnsave={onUnsave} />
      ))}
    </ul>
  );
}
