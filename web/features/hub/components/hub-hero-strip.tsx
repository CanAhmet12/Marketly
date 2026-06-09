import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export type HubHeroStat = {
  label: string;
  value: ReactNode;
  change?: ReactNode;
  changeTone?: "up" | "down" | "neutral";
  valueAccent?: boolean;
  valueClassName?: string;
};

export type HubHeroStripProps = {
  stats: HubHeroStat[];
  className?: string;
};

/** Portföy pf-hero ile hizalı metrik şeridi */
export function HubHeroStrip({ stats, className }: HubHeroStripProps) {
  return (
    <div className={cn("hp-hero", className)} role="group" aria-label="Özet metrikler">
      {stats.map((stat) => (
        <div key={stat.label} className="hp-hero-stat">
          <span className="hp-stat-label">{stat.label}</span>
          <div
            className={cn(
              "hp-stat-value",
              stat.valueAccent && "hp-stat-value--accent",
              stat.valueClassName,
            )}
          >
            {stat.value}
          </div>
          {stat.change != null ? (
            <span
              className={cn(
                "hp-hero-stat-change",
                stat.changeTone === "up" && "hp-text-up",
                stat.changeTone === "down" && "hp-text-down",
                stat.changeTone === "neutral" && "hp-hero-stat-change--neutral",
              )}
            >
              {stat.change}
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export type HubBodyGridProps = {
  main: ReactNode;
  aside?: ReactNode;
  className?: string;
};

/** Ana + yan kolon grid (portföy pf-main layout) */
export function HubBodyGrid({ main, aside, className }: HubBodyGridProps) {
  return (
    <div className={cn("hp-body-grid", className)}>
      <div className="hp-body-main">{main}</div>
      {aside ? <aside className="hp-body-aside">{aside}</aside> : null}
    </div>
  );
}
