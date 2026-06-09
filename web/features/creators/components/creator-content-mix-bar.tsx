"use client";

import type { ContentMixSegment } from "@/features/creators/lib/creator-content-mix";
import { cn } from "@/lib/cn";

type Props = {
  segments: ContentMixSegment[];
  className?: string;
};

/** Sinyal fiyat bandı dilinde — üretici içerik karışımı */
export function CreatorContentMixBar({ segments, className }: Props) {
  if (segments.length === 0) return null;

  return (
    <div className={cn("crt-mix-bar", className)}>
      <div className="crt-mix-bar__track" aria-hidden>
        {segments.map((s) => (
          <span
            key={s.key}
            className={cn("crt-mix-bar__seg", `crt-mix-bar__seg--${s.key}`)}
            style={{ flex: Math.max(s.pct, 8) }}
          />
        ))}
      </div>
      <div className="crt-mix-bar__labels">
        {segments.map((s) => (
          <span key={s.key} className="crt-mix-bar__label">
            {s.label}
            <span className="crt-mix-bar__count tabular-nums">{s.count}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
