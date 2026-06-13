"use client";

import Link from "next/link";

import type { AnalystLeaderboardSection } from "@/features/signals/intelligence/types";
import type { SignalFilterChipId } from "@/features/signals/types";
import type { MarketAssetCategory } from "@/features/markets/types";
import { SIGNAL_MARKET_SECTIONS } from "@/features/signals/components/signals-market-sections";
import { cn } from "@/lib/cn";

type Props = {
  leaderboardSections: AnalystLeaderboardSection[];
  activeChips: Set<SignalFilterChipId>;
  onToggleChip: (id: SignalFilterChipId) => void;
  onSelectMarket: (category: MarketAssetCategory | "all") => void;
  buyCount: number;
  sellCount: number;
  holdCount: number;
  totalCount: number;
  highConfCount: number;
};

const MARKET_CHIP_IDS = new Set<SignalFilterChipId>(["crypto", "stocks", "forex", "commodity", "index"]);

function activeMarketCategory(chips: Set<SignalFilterChipId>): MarketAssetCategory | "all" {
  for (const section of SIGNAL_MARKET_SECTIONS) {
    if (chips.has(section.id)) return section.id;
  }
  return "all";
}

export function SignalsSidebar({
  leaderboardSections,
  activeChips,
  onToggleChip,
  onSelectMarket,
  buyCount,
  sellCount,
  holdCount,
  totalCount,
  highConfCount,
}: Props) {
  const total = buyCount + sellCount + holdCount || 1;
  const topAnalysts = leaderboardSections[0]?.rows?.slice(0, 5) ?? [];
  const activeMarket = activeMarketCategory(activeChips);

  return (
    <aside className="sp-sidebar">
      <div className="sp-sidebar-inner">
        <div className="sp-sidebar-block sp-sidebar-block--pulse">
          <div className="sp-sidebar-header">
            <span className="sp-sidebar-title">Pazar özeti</span>
            <span className="sp-sidebar-live-dot" aria-hidden />
          </div>
          <div className="sp-sidebar-stat-grid">
            <div className="sp-sidebar-stat">
              <span className="sp-sidebar-stat-val">{totalCount}</span>
              <span className="sp-sidebar-stat-label">Aktif sinyal</span>
            </div>
            <div className="sp-sidebar-stat">
              <span className="sp-sidebar-stat-val sp-sidebar-stat-val--accent">{highConfCount}</span>
              <span className="sp-sidebar-stat-label">Yüksek güven</span>
            </div>
          </div>

          <div className="sp-dir-stack">
            <div className="sp-dir-stack-row sp-dir-stack-row--buy">
              <span className="sp-dir-stack-label">Al</span>
              <div className="sp-dir-stack-bar">
                <div className="sp-dir-stack-fill" style={{ width: `${(buyCount / total) * 100}%` }} />
              </div>
              <span className="sp-dir-stack-pct">{Math.round((buyCount / total) * 100)}%</span>
            </div>
            <div className="sp-dir-stack-row sp-dir-stack-row--sell">
              <span className="sp-dir-stack-label">Sat</span>
              <div className="sp-dir-stack-bar">
                <div className="sp-dir-stack-fill" style={{ width: `${(sellCount / total) * 100}%` }} />
              </div>
              <span className="sp-dir-stack-pct">{Math.round((sellCount / total) * 100)}%</span>
            </div>
            <div className="sp-dir-stack-row sp-dir-stack-row--hold">
              <span className="sp-dir-stack-label">Bekle</span>
              <div className="sp-dir-stack-bar">
                <div className="sp-dir-stack-fill" style={{ width: `${(holdCount / total) * 100}%` }} />
              </div>
              <span className="sp-dir-stack-pct">{Math.round((holdCount / total) * 100)}%</span>
            </div>
          </div>
        </div>

        <div className="sp-sidebar-block">
          <div className="sp-sidebar-header">
            <span className="sp-sidebar-title">Piyasa segmenti</span>
          </div>
          <div className="sp-market-rail">
            <button
              type="button"
              className={cn("sp-market-rail-btn", activeMarket === "all" && "sp-market-rail-btn--active")}
              onClick={() => onSelectMarket("all")}
            >
              Tümü
            </button>
            {SIGNAL_MARKET_SECTIONS.map((section) => (
              <button
                key={section.id}
                type="button"
                className={cn(
                  "sp-market-rail-btn",
                  `sp-market-rail-btn--${section.tone}`,
                  activeMarket === section.id && "sp-market-rail-btn--active",
                )}
                onClick={() => onSelectMarket(section.id)}
              >
                {section.label.replace(" Sinyalleri", "")}
              </button>
            ))}
          </div>
        </div>

        <div className="sp-sidebar-block">
          <div className="sp-sidebar-header">
            <span className="sp-sidebar-title">Hızlı filtreler</span>
          </div>
          <div className="sp-quick-filters">
            {(
              [
                { id: "high_conf" as const, label: "Yüksek güven" },
                { id: "premium_catalog" as const, label: "Premium" },
                { id: "scalp" as const, label: "Scalp" },
                { id: "swing" as const, label: "Swing" },
                { id: "long" as const, label: "Uzun vade" },
              ] as const
            ).map((chip) => (
              <button
                key={chip.id}
                type="button"
                className={cn("sp-quick-filter", activeChips.has(chip.id) && "sp-quick-filter--active")}
                onClick={() => onToggleChip(chip.id)}
                aria-pressed={activeChips.has(chip.id)}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {topAnalysts.length > 0 ? (
          <div className="sp-sidebar-block sp-sidebar-block--analysts">
            <div className="sp-sidebar-header">
              <span className="sp-sidebar-title">Top analistler</span>
              <Link href="/creators" className="sp-sidebar-link">
                Tümü
              </Link>
            </div>
            <div className="sp-analyst-list sp-analyst-list--modern">
              {topAnalysts.map((row) => (
                <Link key={row.analystId} href={row.href} className="sp-analyst-item sp-analyst-item--modern">
                  <span className="sp-analyst-rank">#{row.rank}</span>
                  <div className="sp-analyst-ava">{row.display.slice(0, 1).toUpperCase()}</div>
                  <div className="sp-analyst-info">
                    <div className="sp-analyst-name-row">
                      <span className="sp-analyst-name">{row.display}</span>
                      {row.verified ? <span className="sp-analyst-verified" aria-label="Doğrulandı">✓</span> : null}
                    </div>
                    <span className="sp-analyst-metric">
                      {row.primaryMetricLabel}{" "}
                      <span className="sp-analyst-metric-val">{row.primaryMetricValue}</span>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </aside>
  );
}

export { MARKET_CHIP_IDS };
