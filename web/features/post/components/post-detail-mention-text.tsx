"use client";

import Link from "next/link";

const MENTION_RE = /(@[A-Za-zğüşöçıİĞÜŞÖÇ0-9_]+)/g;

type Props = {
  text: string;
  className?: string;
};

export function PostDetailMentionText({ text, className }: Props) {
  const parts = text.split(MENTION_RE);

  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.startsWith("@") ? (
          <Link
            key={`${part}-${i}`}
            href={`/results?q=${encodeURIComponent(part.slice(1))}`}
            className="pd-mention"
          >
            {part}
          </Link>
        ) : (
          <span key={`t-${i}`}>{part}</span>
        ),
      )}
    </span>
  );
}
