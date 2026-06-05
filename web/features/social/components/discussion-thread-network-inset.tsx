"use client";

import Link from "next/link";
import { useMemo } from "react";

import { getSocialRepository } from "@/features/social/repository";
import { isMockDataEnabled } from "@/mock/config";

type Props = { postId: string };

/** Gönderi detay — bağlı tartışma ağı özeti (SocialRepository). */
export function DiscussionThreadNetworkInset({ postId }: Props) {
  const net = useMemo(() => {
    if (!isMockDataEnabled()) return null;
    return getSocialRepository().getDiscussionThreadNetwork(postId);
  }, [postId]);

  if (!net || net.chain.length < 2) return null;

  return (
    <div className="mt-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2">
      <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-meta)]">Bağlı tartışma ağı</p>
      <ol className="mt-1.5 m-0 list-decimal space-y-1 pl-4 text-[11px] text-[var(--color-text-secondary)]">
        {net.chain.slice(0, 4).map((n) => (
          <li key={n.post_id} className="marker:font-semibold">
            <Link href={n.href} className="font-medium text-[var(--color-primary-dark)] hover:underline">
              {n.title}
            </Link>
            <span className="ml-1 text-[10px] uppercase text-[var(--color-meta)]">({n.edge})</span>
          </li>
        ))}
      </ol>
      {net.cross_topic.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1.5 border-t border-[var(--color-divider)] pt-2">
          {net.cross_topic.map((c) => (
            <Link key={c.label} href={c.href} className="text-[10px] font-semibold text-[var(--color-text)] hover:underline">
              {c.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
