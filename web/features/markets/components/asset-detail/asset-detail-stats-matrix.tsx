"use client";

import type { AssetStatRow } from "@/features/markets/types/asset-intelligence";
import { cn } from "@/lib/cn";

type Props = { rows: AssetStatRow[] };

export function AssetDetailStatsMatrix({ rows }: Props) {
  if (rows.length === 0) return null;

  return (
    <div className="ad-section">
      <div className="ad-section-header">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div className="ad-section-accent" />
          <span className="ad-section-title">Piyasa Metrikleri</span>
        </div>
      </div>
      <div className="ad-stats-grid">
        {rows.map((r) => (
          <div key={r.key} className="ad-stat-cell">
            <span className="ad-stat-label">{r.label}</span>
            <span
              className={cn(
                "ad-stat-value",
                r.value?.toString().startsWith("+") && "ad-price-change--up",
                r.value?.toString().startsWith("-") && "ad-price-change--down",
              )}
              style={{
                color: r.value?.toString().startsWith("+") ? "var(--ad-up)"
                  : r.value?.toString().startsWith("-") ? "var(--ad-down)"
                  : undefined,
              }}
            >
              {r.value}
            </span>
            {r.hint && <span className="ad-stat-hint">{r.hint}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
