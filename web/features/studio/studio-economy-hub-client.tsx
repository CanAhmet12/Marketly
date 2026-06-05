"use client";

import Link from "next/link";
import { useId, useMemo } from "react";

import { EmptyState } from "@/components/states";
import { useAuth } from "@/features/auth/use-auth";
import type { StudioEconomyMemberSegment } from "@/features/studio/repository";
import { getStudioRepository } from "@/features/studio/repository";
import { useStudioOwnerId } from "@/features/studio/use-studio-owner-id";

const SEGMENT_LABEL: Record<StudioEconomyMemberSegment, string> = {
  subscriber:      "Abone",
  trusted:         "Güvenilir",
  premium:         "Premium",
  room_leader:     "Oda Lideri",
  high_engagement: "Yoğun Etkileşim",
  overlap:         "Kesişim",
};

const SEGMENT_COLOR: Record<StudioEconomyMemberSegment, string> = {
  subscriber:      "#0f9d75",
  trusted:         "#3b82f6",
  premium:         "#f59e0b",
  room_leader:     "#ef4444",
  high_engagement: "#8b5cf6",
  overlap:         "#14b8a6",
};

const SIGNAL_MODE: Record<string, string> = {
  public:     "Herkese Açık",
  preview:    "Önizleme",
  locked:     "Kilitli",
  subscriber: "Abonelik",
};

function RevenueDonut({ segments }: { segments: { label: string; pct: number; color: string }[] }) {
  const id = useId().replace(/:/g, "");
  const cx = 80; const cy = 80; const outerR = 70; const innerR = 48;
  const total = segments.reduce((s, seg) => s + seg.pct, 0) || 100;

  function polar(r: number, deg: number) {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function arcPath(s: number, e: number): string {
    const os = polar(outerR, s); const oe = polar(outerR, e);
    const is = polar(innerR, e); const ie = polar(innerR, s);
    const lg = e - s > 180 ? 1 : 0;
    return `M ${os.x.toFixed(2)} ${os.y.toFixed(2)} A ${outerR} ${outerR} 0 ${lg} 1 ${oe.x.toFixed(2)} ${oe.y.toFixed(2)} L ${is.x.toFixed(2)} ${is.y.toFixed(2)} A ${innerR} ${innerR} 0 ${lg} 0 ${ie.x.toFixed(2)} ${ie.y.toFixed(2)} Z`;
  }

  const arcs: { path: string; color: string }[] = [];
  let start = 0;
  for (const seg of segments) {
    const sweep = (seg.pct / total) * 360;
    arcs.push({ path: arcPath(start, start + sweep - 0.5), color: seg.color });
    start += sweep;
  }

  return (
    <svg viewBox="0 0 160 160" width={160} height={160} aria-label="Gelir dağılımı">
      {arcs.map((arc, i) => (
        <path key={i} d={arc.path} fill={arc.color} opacity={0.85}
          style={{ filter: `drop-shadow(0 0 4px ${arc.color}44)` }} />
      ))}
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize="10" fontWeight="700" fill="#64748b" fontFamily="system-ui">GELİR</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize="14" fontWeight="900" fill="#f59e0b" fontFamily="system-ui">Dağılım</text>
    </svg>
  );
}

export function StudioEconomyHubClient() {
  const { user } = useAuth();
  const ownerId = useStudioOwnerId(user);

  const hub = useMemo(() => {
    if (!ownerId) return null;
    return getStudioRepository().getCreatorEconomyHub(ownerId);
  }, [ownerId]);

  if (!ownerId) {
    return (
      <div>
        <EmptyState title="Giriş gerekli" description="Studio ekonomi verisi için oturum açın." tone="social" compact />
      </div>
    );
  }

  if (!hub) return null;

  const revenueSegments = [
    { label: "Abonelik",    pct: 52, color: "#0f9d75" },
    { label: "Sinyal",      pct: 28, color: "#f59e0b" },
    { label: "Super Thanks",pct: 14, color: "#8b5cf6" },
    { label: "Sponsor",     pct:  6, color: "#3b82f6" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Gelir Hero */}
      <div className="st-revenue-hero">
        <div className="st-revenue-main">
          <span className="st-revenue-tag">Bu Ay Tahmini Gelir</span>
          <div className="st-revenue-amount">$1,284.50</div>
          <div className="st-revenue-sub">{hub.headline}</div>
          <div style={{ fontSize: 12, color: "var(--st-text-2)", marginTop: 6, maxWidth: "44ch" }}>{hub.subline}</div>
        </div>

        <div style={{ display: "flex", gap: 20 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: "var(--st-accent)" }}>
              {hub.members?.length ?? 0}
            </div>
            <div style={{ fontSize: 10, color: "var(--st-meta)", marginTop: 2 }}>Aktif Üye</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: "var(--st-violet)" }}>
              {hub.signal_controls?.length ?? 0}
            </div>
            <div style={{ fontSize: 10, color: "var(--st-meta)", marginTop: 2 }}>Aktif Sinyal</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {hub.nav_cross?.slice(0, 4).map((n) => (
            <Link key={n.href} href={n.href}
              style={{ padding: "6px 12px", borderRadius: 7, background: "rgba(255,255,255,0.04)",
                border: "1px solid var(--st-border)", color: "var(--st-text-2)",
                fontSize: 11, fontWeight: 700, textDecoration: "none" }}>
              {n.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Donut + Üye tablosu */}
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16 }}>

        <div className="st-block">
          <div className="st-block-header">
            <div className="st-block-title">
              Gelir Kaynakları
            </div>
          </div>
          <div className="st-donut-row">
            <RevenueDonut segments={revenueSegments} />
            <div className="st-donut-legend">
              {revenueSegments.map((s) => (
                <div key={s.label} className="st-legend-item">
                  <div className="st-legend-dot" style={{ background: s.color }} />
                  <span className="st-legend-label">{s.label}</span>
                  <span className="st-legend-val">%{s.pct}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {hub.members && hub.members.length > 0 && (
          <div className="st-block">
            <div className="st-block-header">
              <div className="st-block-title">
                Üye Segmentleri
              </div>
            </div>
            <div style={{ overflow: "auto" }}>
              <table className="st-tier-table">
                <thead>
                  <tr>
                    <th>Kullanıcı</th>
                    <th>Segment</th>
                    <th>Kalite</th>
                    <th>Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {hub.members.slice(0, 6).map((m) => (
                    <tr key={m.id}>
                      <td style={{ fontSize: 13, fontWeight: 700, color: "var(--st-text)" }}>{m.name}</td>
                      <td>
                        <span style={{
                          fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 4, display: "inline-block",
                          background: `${SEGMENT_COLOR[m.segment]}18`,
                          color: SEGMENT_COLOR[m.segment], letterSpacing: "0.04em",
                        }}>
                          {SEGMENT_LABEL[m.segment]}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, fontWeight: 700, color: "var(--st-accent)" }}>{m.quality_label}</td>
                      <td style={{ fontSize: 10, color: "var(--st-meta)" }}>{m.invite_status ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Sinyal kontrolleri */}
      {hub.signal_controls && hub.signal_controls.length > 0 && (
        <div className="st-block">
          <div className="st-block-header">
            <div className="st-block-title">
              Sinyal Erişim Konfigürasyonu
            </div>
          </div>
          <div style={{ padding: "14px 18px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
              {hub.signal_controls.map((s) => (
                <div key={s.id} style={{
                  padding: "12px 14px",
                  background: "var(--st-surface-2)",
                  border: "1px solid var(--st-border-2)",
                  borderRadius: 8,
                }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "var(--st-accent)", marginBottom: 4 }}>{s.symbol}</div>
                  {s.bundle_label && <div style={{ fontSize: 11, color: "var(--st-text-2)", marginBottom: 6 }}>{s.bundle_label}</div>}
                  <div style={{
                    fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 4, display: "inline-block",
                    background: s.access_mode === "public" ? "rgba(34,197,94,0.12)" : "rgba(245,158,11,0.12)",
                    color: s.access_mode === "public" ? "#22c55e" : "#fbbf24",
                  }}>
                    {SIGNAL_MODE[s.access_mode] ?? s.access_mode}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
