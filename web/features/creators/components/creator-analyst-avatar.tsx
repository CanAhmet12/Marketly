"use client";

import Link from "next/link";

import { SafeAvatar } from "@/components/ui/safe-avatar";
import type { CreatorDirectoryRow } from "@/features/creators/types";
import { cn } from "@/lib/cn";

type Variant = "rail" | "hero" | "screener" | "leaderboard" | "context";

const SIZE_BY_VARIANT: Record<Variant, number> = {
  rail: 48,
  hero: 56,
  screener: 42,
  leaderboard: 32,
  context: 30,
};

type Props = {
  creator: CreatorDirectoryRow;
  variant?: Variant;
  size?: number;
  href?: string;
  className?: string;
  priority?: boolean;
};

/** Analist portre — Supabase avatar veya ui-avatars fallback */
export function CreatorAnalystAvatar({
  creator,
  variant = "rail",
  size,
  href,
  className,
  priority = false,
}: Props) {
  const dim = size ?? SIZE_BY_VARIANT[variant];
  const shellClass = cn(
    "crt-analyst-avatar shrink-0 overflow-hidden",
    `crt-analyst-avatar--${variant}`,
    href && "relative z-2",
    className,
  );

  const image = (
    <SafeAvatar
      src={creator.avatarUrl}
      alt={creator.displayName}
      size={dim}
      fallbackId={creator.id}
      fallbackName={creator.displayName}
      priority={priority}
      className="crt-analyst-avatar__img !h-full !w-full !rounded-none object-cover"
    />
  );

  if (href) {
    return (
      <Link href={href} className={shellClass} aria-label={`${creator.displayName} profili`}>
        {image}
      </Link>
    );
  }

  return <span className={shellClass}>{image}</span>;
}
