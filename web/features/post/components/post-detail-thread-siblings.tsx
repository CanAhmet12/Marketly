"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { getSocialRepository } from "@/features/social/repository";
import type { DiscussionThreadEdge } from "@/features/social/repository/discussion-discovery-types";
import { queryKeys } from "@/lib/query-keys";

import { PostDetailThreadSiblingsSkeleton } from "./post-detail-thread-siblings-skeleton";

const EDGE_LABELS: Record<DiscussionThreadEdge, string> = {
  reply: "Yanıt",
  quote: "Alıntı",
  topic: "Konu",
  signal: "Sinyal",
  creator: "Üretici",
};

type Props = {
  postId: string;
};

export function PostDetailThreadSiblings({ postId }: Props) {
  const query = useQuery({
    queryKey: queryKeys.postThreadNetwork(postId),
    queryFn: () => getSocialRepository().getDiscussionThreadNetwork(postId),
  });

  if (query.isLoading) return <PostDetailThreadSiblingsSkeleton />;

  const net = query.data;
  if (!net) return null;

  const siblings = net.chain.filter((n) => n.post_id !== postId);
  const related = net.related_discussions.filter((n) => n.post_id !== postId);
  const unique = Array.from(
    new Map([...siblings, ...related].map((n) => [n.post_id, n])).values(),
  ).slice(0, 5);

  if (unique.length === 0) return null;

  return (
    <section className="pd-thread-siblings" aria-label="Thread'deki diğer gönderiler">
      <h3 className="pd-thread-siblings__title">Thread&apos;deki diğer gönderiler</h3>
      <ul className="pd-thread-siblings__list">
        {unique.map((n) => (
          <li key={n.post_id}>
            <Link href={n.href} className="pd-thread-siblings__link">
              <span className="pd-thread-siblings__label">{n.title}</span>
              <span className="pd-thread-siblings__edge">{EDGE_LABELS[n.edge] ?? n.edge}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
