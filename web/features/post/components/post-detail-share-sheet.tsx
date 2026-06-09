"use client";

import { ShareSheet } from "@/components/share/share-sheet";
import { buildPostSharePreview, buildPostShareText } from "@/lib/build-share-text";
import type { PostDetail } from "../types";

type Props = {
  open: boolean;
  onClose: () => void;
  post: PostDetail;
  url: string;
};

export function PostDetailShareSheet({ open, onClose, post, url }: Props) {
  const shareText = buildPostShareText(post.author_name, post.content, post.title, url);
  const preview = buildPostSharePreview(post.author_name, post.content, post.title);

  return (
    <ShareSheet open={open} onClose={onClose} preview={preview} shareText={shareText} url={url} />
  );
}
