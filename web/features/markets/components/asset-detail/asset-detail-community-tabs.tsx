"use client";

import { useState } from "react";
import Link from "next/link";

import { AssetDetailMediaRail } from "@/features/markets/components/asset-detail/asset-detail-media-rail";
import type { AssetIntelligenceBundle } from "@/features/markets/types/asset-intelligence";
import { cn } from "@/lib/cn";

type Props = { bundle: AssetIntelligenceBundle; symbol: string };

type TabId = "signals" | "media" | "discussions" | "network";

const TABS: { id: TabId; label: string }[] = [
  { id: "signals",     label: "Sinyaller" },
  { id: "media",       label: "Medya" },
  { id: "discussions", label: "Tartışmalar" },
  { id: "network",     label: "İlgili Ağ" },
];

function signed(v: number) { return `${v > 0 ? "+" : ""}${v.toFixed(2)}%`; }

export function AssetDetailCommunityTabs({ bundle, symbol }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("signals");

  const { signalSummary, assetSignalCommunity, media, discussions, relatedNetwork, communitySurface } = bundle;

  return (
    <div className="ad-community-zone">
      {/* Tab bar */}
      <div className="ad-tab-bar" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={activeTab === t.id}
            onClick={() => setActiveTab(t.id)}
            className={cn("ad-tab-btn", activeTab === t.id && "ad-tab-btn--active")}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Sinyaller */}
      {activeTab === "signals" && (
        <div>
          {/* Community sentiment */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 1, background: "var(--ad-border-subtle)", borderRadius: 8, overflow: "hidden", marginBottom: 16 }}>
            {[
              { label: "Bull Hissi", value: `%${assetSignalCommunity?.sentimentParticipation?.bull ?? signalSummary.bullSharePct}` },
              { label: "Tartışma",   value: String(communitySurface?.activeDiscussions ?? "—") },
              { label: "Trend",      value: assetSignalCommunity?.trendingSnippet?.slice(0,20) ?? "—" },
            ].map((m) => (
              <div key={m.label} className="ad-stat-cell">
                <span className="ad-stat-label">{m.label}</span>
                <span className="ad-stat-value">{m.value}</span>
              </div>
            ))}
          </div>

          {/* Consensus */}
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 11, color: "var(--ad-meta)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>
              Piyasa Konsensüsü
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                { label: "Bull payı", val: `%${signalSummary.bullSharePct}`, color: "var(--ad-up)" },
                { label: "Ort. güven", val: `%${signalSummary.avgConfidenceActive}`, color: "var(--ad-text)" },
                { label: "Aktif sinyal", val: String(signalSummary.activeTotal), color: "var(--ad-text)" },
              ].map((c) => (
                <div key={c.label} style={{
                  padding: "6px 12px",
                  borderRadius: 6,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid var(--ad-border-subtle)",
                }}>
                  <div style={{ fontSize: 9, color: "var(--ad-meta)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{c.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: c.color, fontVariantNumeric: "tabular-nums" }}>{c.val}</div>
                </div>
              ))}
            </div>
          </div>

          <Link
            href={`/signals?asset=${encodeURIComponent(symbol)}`}
            style={{ fontSize: 12, fontWeight: 700, color: "var(--ad-accent)", textDecoration: "none" }}
          >
            Sinyal akışına git →
          </Link>
        </div>
      )}

      {/* Tab 2: Medya */}
      {activeTab === "media" && (
        <AssetDetailMediaRail items={media} />
      )}

      {/* Tab 3: Tartışmalar */}
      {activeTab === "discussions" && (
        <div>
          {discussions.length === 0 ? (
            <p style={{ fontSize: 12, color: "var(--ad-meta)" }}>Bu varlık için tartışma bulunamadı.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {discussions.slice(0, 6).map((d) => (
                <div
                  key={d.id}
                    style={{
                    padding: "12px 0 12px 12px",
                    borderLeft: `2px solid ${d.sentiment === "bullish" ? "var(--ad-up)" : d.sentiment === "bearish" ? "var(--ad-down)" : "var(--ad-border-subtle)"}`,
                    marginBottom: 10,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--ad-text)" }}>{d.creatorDisplay}</span>
                    <span style={{ fontSize: 10, color: "var(--ad-meta)" }}>{d.kind}</span>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--ad-text-secondary)", lineHeight: 1.45, margin: 0 }}>{d.content}</p>
                  <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
                    <span style={{ fontSize: 10, color: "var(--ad-meta)" }}>❤ {d.likes}</span>
                    <span style={{ fontSize: 10, color: "var(--ad-meta)" }}>💬 {d.replies}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: İlgili Ağ */}
      {activeTab === "network" && (
        <div>
          {/* Korelasyon varlıklar */}
          {relatedNetwork.correlated.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "var(--ad-meta)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>
                Korelasyon
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {relatedNetwork.correlated.map((a) => (
                  <Link
                    key={a.symbol}
                    href={`/markets/${encodeURIComponent(a.symbol)}`}
                    style={{
                      padding: "5px 12px",
                      borderRadius: 6,
                      border: "1px solid var(--ad-border-subtle)",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--ad-text)",
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    {a.symbol}
                    <span style={{ fontSize: 10, color: "var(--ad-meta)" }}>{a.correlationLabel}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Makro temalar */}
          {relatedNetwork.macroThemes.length > 0 && (
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: "var(--ad-meta)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>
                Makro Temalar
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {relatedNetwork.macroThemes.map((t) => (
                  <span
                    key={t}
                    style={{
                      padding: "4px 10px",
                      borderRadius: 999,
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid var(--ad-border-subtle)",
                      fontSize: 11,
                      fontWeight: 600,
                      color: "var(--ad-text-secondary)",
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
