"use client";

import Link from "next/link";

import type { FeedPost } from "@/features/feed/types";

export function HomeNativeQuotedStrip({ quoted }: { quoted: FeedPost }) {
  return (
    <div className="rounded-r-xl bg-[color-mix(in_srgb,var(--color-bg-elevated)_42%,transparent)] py-2.5 pl-3.5 pr-2 sm:pl-4">
      <div className="border-l-[3px] border-[color-mix(in_srgb,var(--color-primary)_50%,transparent)] pl-3">
        <p className="text-[13px] font-semibold leading-snug text-[var(--color-text)]">
          {quoted.author_name} <span className="font-medium text-[var(--color-meta)]">{quoted.author_handle}</span>
        </p>
        <p className="mt-1 line-clamp-3 text-[14px] font-normal leading-relaxed text-[var(--color-text-secondary)]">{quoted.content}</p>
      </div>
    </div>
  );
}

export function HomeNativeRepostStrip({ rep }: { rep: NonNullable<FeedPost["social_repost"]> }) {
  const label = rep.kind === "quote_repost" ? "Alıntı" : "Yeniden paylaşım";
  return (
    <div className="rounded-r-xl bg-[color-mix(in_srgb,var(--color-bg-elevated)_38%,transparent)] py-2.5 pl-3.5 pr-2 sm:pl-4">
      <div className="border-l-[3px] border-[color-mix(in_srgb,var(--color-text-tertiary)_32%,transparent)] pl-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-meta)]">{label}</p>
        <Link href={`/post/${rep.source_post_id}`} className="mt-1.5 block text-left">
          <p className="text-[13px] font-semibold leading-snug text-[var(--color-text)]">
            {rep.source.author_name}{" "}
            <span className="font-medium text-[var(--color-meta)]">{rep.source.author_handle}</span>
          </p>
          {rep.source.asset_tag ? (
            <span className="mt-1 inline-block text-[12px] font-semibold text-[var(--color-primary)]">#{rep.source.asset_tag}</span>
          ) : null}
          <p className="mt-1 line-clamp-2 text-[14px] leading-relaxed text-[var(--color-text-secondary)]">{rep.source.content_snippet}</p>
        </Link>
      </div>
    </div>
  );
}
