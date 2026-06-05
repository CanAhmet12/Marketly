"use client";

import Link from "next/link";
import { useMemo } from "react";

import { useAuth } from "@/features/auth/use-auth";
import { useStudioOwnerId } from "@/features/studio/use-studio-owner-id";
import { formatCompactCount } from "@/lib/format-compact-count";
import { getStudioRepository } from "@/features/studio/repository";

export function StudioLiveClient() {
  const { user } = useAuth();
  const ownerId = useStudioOwnerId(user);

  const streams = useMemo(() => {
    if (!ownerId) return [];
    return getStudioRepository().getLiveSchedule(ownerId);
  }, [ownerId]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Live Hero */}
      <div className="st-live-hero">
        <div>
          <div className="st-live-status">
            <div className="st-live-offline-dot" />
            Şu an çevrimdışı
          </div>
          <div className="st-live-title">Canlı Yayın Stüdyosu</div>
          <div className="st-live-sub">Piyasa analizi, sinyal yorumu ve canlı tartışma için yayın başlatın.</div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/live" className="studio-hbtn studio-hbtn--live" style={{ fontSize: 14, padding: "10px 20px" }}>
            ● Yayın Başlat
          </Link>
          <Link href="/upload" className="studio-hbtn studio-hbtn--ghost">
            📹 Video Yükle
          </Link>
        </div>
      </div>

      {/* Stream setup hints */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
        {[
          { title: "Sinyal Odası", desc: "Aktif sinyallerinizi canlı yorumla" },
          { title: "Piyasa Analizi", desc: "Canlı piyasa hareketlerini takip edin" },
          { title: "Q&A Oturumu", desc: "Takipçilerle etkileşime geçin" },
        ].map((c) => (
          <div key={c.title} className="st-block" style={{ cursor: "pointer" }}>
            <div style={{ padding: "18px 18px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--st-text)", marginBottom: 4, letterSpacing: "0.02em" }}>{c.title}</div>
              <div style={{ fontSize: 11, color: "var(--st-meta)" }}>{c.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Programlı Yayınlar */}
      <div className="st-block">
        <div className="st-block-header">
          <div className="st-block-title">
            Programlı Yayınlar
          </div>
          <Link href="/upload" className="st-block-link">+ Yeni Yayın</Link>
        </div>

        {streams.length === 0 ? (
          // ES-002: Zamanlanmış yayın yoksa net empty state
          <div style={{ padding: "32px 18px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <div style={{ fontSize: 32 }}>📅</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Zamanlanmış yayın yok</div>
            <div style={{ fontSize: 12, color: "var(--st-meta)", maxWidth: 260 }}>
              Canlı yayın başlatmak veya zamanlamak için &quot;Yayın Başlat&quot; butonunu kullanın.
            </div>
          </div>
        ) : (
          <div>
            {streams.map((s) => (
              <div key={s.id} className="st-list-item">
                <div className="st-list-icon" style={{ fontSize: 9, letterSpacing: "0.08em", color: "var(--st-meta)", textTransform: "uppercase" }}>LIVE</div>
                <div className="st-list-info">
                  <div className="st-list-title">{s.title}</div>
                  <div className="st-list-meta">
                    {new Date(s.scheduledStart).toLocaleString("tr-TR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
                <div className="st-list-actions">
                  <span style={{ padding: "3px 8px", borderRadius: 4, fontSize: 9, fontWeight: 800,
                    background: "rgba(239,68,68,0.12)", color: "#f87171", letterSpacing: "0.05em" }}>
                    CANLI
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
