"use client";

import Link from "next/link";

import { SafeAvatar } from "@/components/ui/safe-avatar";
import type { SearchChannelHit } from "@/features/search/types";
import { formatCompactCount } from "@/lib/format-compact-count";
import { cn } from "@/lib/cn";

type Props = { channel: SearchChannelHit; compact?: boolean };

export function SearchCreatorHit({ channel, compact = false }: Props) {
  const name = channel.full_name?.trim() || channel.username;
  const href = `/channel/${channel.id}`;

  return (
    <article className={cn("srch-hit srch-hit--creator", compact && "srch-hit--creator-compact")}>
      <Link href={href} className="srch-hit__creator-main" tabIndex={-1} aria-hidden />
      <SafeAvatar
        src={channel.avatar_url}
        alt=""
        size={compact ? 40 : 48}
        className="srch-hit__avatar"
      />
      <div className="srch-hit__creator-copy">
        <div className="srch-hit__creator-top">
          <Link href={href} className="srch-hit__creator-name">
            {name}
          </Link>
          {channel.verified ? <span className="srch-hit__verified" aria-label="Doğrulanmış">✓</span> : null}
        </div>
        <p className="srch-hit__creator-handle">@{channel.username}</p>
        {!compact && channel.bio ? <p className="srch-hit__creator-bio">{channel.bio}</p> : null}
        <p className="srch-hit__meta">
          {formatCompactCount(channel.follower_count)} takipçi
          {channel.signal_accuracy != null ? ` · %${Math.round(channel.signal_accuracy)} isabet` : ""}
        </p>
      </div>
      <Link href={href} className="srch-hit__cta">
        Kanal
      </Link>
    </article>
  );
}
