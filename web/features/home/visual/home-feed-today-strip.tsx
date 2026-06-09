"use client";

import Link from "next/link";

import type { HomeVisualRailLink } from "@/features/home/visual/mock-data";
import { cn } from "@/lib/cn";

type Props = {
  items: HomeVisualRailLink[];
};

export function HomeFeedTodayStrip({ items }: Props) {
  if (items.length === 0) return null;

  return (
    <nav className="hv-ref-feed-today" aria-label="Bugünün piyasaları">
      <span className="hv-ref-feed-today__label">Bugün</span>
      <div className="hv-ref-feed-today__chips">
        {items.slice(0, 6).map((item) => (
          <Link
            key={item.label}
            href={`/results?q=${encodeURIComponent(item.label)}`}
            className={cn(
              "hv-ref-feed-today__chip",
              item.accent === "up" && "hv-ref-feed-today__chip--up",
              item.accent === "down" && "hv-ref-feed-today__chip--down",
            )}
          >
            <span aria-hidden className="hv-ref-feed-today__arrow">
              {item.accent === "up" ? "▲" : item.accent === "down" ? "▼" : "—"}
            </span>
            <span className="hv-ref-feed-today__sym">{item.label}</span>
            {item.meta ? <span className="hv-ref-feed-today__meta">{item.meta}</span> : null}
          </Link>
        ))}
      </div>
    </nav>
  );
}
