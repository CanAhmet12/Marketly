"use client";

import Link from "next/link";

import { marketNewsDetailHref } from "@/features/markets/lib/market-news-shared";
import type { AssetIntelligenceBundle } from "@/features/markets/types/asset-intelligence";

type Props = { bundle: AssetIntelligenceBundle };

function impactClass(tier?: 1 | 2 | 3 | null): string {
  if (tier === 3) return "ad-news-card--high";
  if (tier === 2) return "ad-news-card--medium";
  return "";
}

export function AssetDetailNewsCalendar({ bundle }: Props) {
  const { news } = bundle;
  const topNews = news.slice(0, 4);

  return (
    <div className="ad-section">
      <div className="ad-section-header">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div className="ad-section-accent" />
          <span className="ad-section-title">Haberler & Etkinlikler</span>
        </div>
        <Link href="/market-news" className="ad-section-link">Tüm haberler →</Link>
      </div>

      {topNews.length === 0 ? (
        <p style={{ fontSize: 12, color: "var(--ad-meta)" }}>Bu varlık için haber bulunamadı.</p>
      ) : (
        <div className="ad-news-grid">
          {topNews.map((item) => (
            <Link
              key={item.id}
              href={marketNewsDetailHref(item.id)}
              className={`ad-news-card ${impactClass(item.impact)}`}
              style={{ textDecoration: "none" }}
            >
              <div className="ad-news-meta">
                <span className="ad-news-source">{item.source}</span>
                <span style={{ color: "rgba(255,255,255,0.12)", fontSize: 11 }}>·</span>
                <span className="ad-news-time">{item.minutesAgo}dk önce</span>
                {item.impact === 3 && (
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "1px 5px", borderRadius: 3, background: "rgba(239,68,68,0.10)", color: "var(--ad-down)" }}>
                    Yüksek Etki
                  </span>
                )}
              </div>
              <p className="ad-news-title">{item.headline}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
