"use client";

import Link from "next/link";

import type { AnalystLeaderboardSection } from "@/features/signals/intelligence/types";
import type { SignalFilterChipId } from "@/features/signals/types";
import { cn } from "@/lib/cn";

type Props = {
  leaderboardSections: AnalystLeaderboardSection[];
  activeChips: Set<SignalFilterChipId>;
  onToggleChip: (id: SignalFilterChipId) => void;
  buyCount: number;
  sellCount: number;
  holdCount: number;
};

const CAT_CHIPS: { id: SignalFilterChipId; label: string; icon: string }[] = [
  { id: "crypto", label: "Kripto", icon: "₿" },
  { id: "stocks", label: "Hisseler", icon: "📈" },
  { id: "forex", label: "Forex", icon: "💱" },
  { id: "commodity", label: "Emtia", icon: "⚡" },
  { id: "index", label: "Endeks", icon: "📊" },
];

export function SignalsSidebar({
  leaderboardSections,
  activeChips,
  onToggleChip,
  buyCount,
  sellCount,
  holdCount,
}: Props) {
  const total = buyCount + sellCount + holdCount || 1;
  const topAnalysts = leaderboardSections[0]?.rows?.slice(0, 4) ?? [];

  return (
    <aside className="sp-sidebar">
      <div className="sp-sidebar-inner">
        <div className="sp-sidebar-block">
          <div className="sp-sidebar-header">
            <span className="sp-sidebar-title">Katalog dağılımı</span>
          </div>

          <div className="sp-dir-rows">
            <div className="sp-dir-row">
              <span className="sp-dir-label sp-dir-label--buy">BUY</span>
              <div className="sp-dir-bar-wrap">
                <div
                  className="sp-dir-bar-fill sp-dir-bar-fill--buy"
                  style={{ width: `${(buyCount / total) * 100}%` }}
                />
              </div>
              <span className="sp-dir-count">
                {buyCount} ({Math.round((buyCount / total) * 100)}%)
              </span>
            </div>
            <div className="sp-dir-row">
              <span className="sp-dir-label sp-dir-label--sell">SELL</span>
              <div className="sp-dir-bar-wrap">
                <div
                  className="sp-dir-bar-fill sp-dir-bar-fill--sell"
                  style={{ width: `${(sellCount / total) * 100}%` }}
                />
              </div>
              <span className="sp-dir-count">
                {sellCount} ({Math.round((sellCount / total) * 100)}%)
              </span>
            </div>
            <div className="sp-dir-row">
              <span className="sp-dir-label sp-dir-label--hold">HOLD</span>
              <div className="sp-dir-bar-wrap">
                <div
                  className="sp-dir-bar-fill sp-dir-bar-fill--hold"
                  style={{ width: `${(holdCount / total) * 100}%` }}
                />
              </div>
              <span className="sp-dir-count">
                {holdCount} ({Math.round((holdCount / total) * 100)}%)
              </span>
            </div>
          </div>
        </div>

        <div className="sp-sidebar-block">
          <div className="sp-sidebar-header">
            <span className="sp-sidebar-title">Kategori</span>
          </div>
          <div className="sp-cat-chips">
            {CAT_CHIPS.map((chip) => (
              <button
                key={chip.id}
                type="button"
                className={cn("sp-cat-chip", activeChips.has(chip.id) && "sp-cat-chip--active")}
                onClick={() => onToggleChip(chip.id)}
                aria-pressed={activeChips.has(chip.id)}
              >
                <span>{chip.icon}</span>
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {topAnalysts.length > 0 ? (
          <div className="sp-sidebar-block">
            <div className="sp-sidebar-header">
              <span className="sp-sidebar-title">Top analistler</span>
            </div>
            <div className="sp-analyst-list">
              {topAnalysts.map((row) => (
                <Link key={row.analystId} href={row.href} className="sp-analyst-item">
                  <span className="sp-analyst-rank">#{row.rank}</span>
                  <div className="sp-analyst-ava">{row.display.slice(0, 1).toUpperCase()}</div>
                  <div className="sp-analyst-info">
                    <div className="sp-analyst-name-row">
                      <span className="sp-analyst-name">{row.display}</span>
                      {row.verified ? <span className="sp-analyst-verified" aria-label="Doğrulandı">✓</span> : null}
                    </div>
                    <span className="sp-analyst-metric">
                      {row.primaryMetricLabel}:{" "}
                      <span className="sp-analyst-metric-val">{row.primaryMetricValue}</span>
                    </span>
                  </div>
                  <span className="sp-analyst-fire">🔥 {row.secondaryHint?.replace(/\D/g, "") || "—"}</span>
                </Link>
              ))}
            </div>
            <Link href="/creators" className="sp-analyst-see-all">
              Tüm analistleri gör →
            </Link>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
