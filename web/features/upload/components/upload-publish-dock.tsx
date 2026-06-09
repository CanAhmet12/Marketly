"use client";

import type { UploadContentKind } from "@/features/upload/components/upload-type-rail";
import { UPLOAD_TYPE_META } from "@/features/upload/components/upload-type-rail";

const PLATFORM_TIPS = [
  "İlk 48 saatte en yüksek etkileşim alınır",
  "Tutarlı paylaşım takipçi sadakati oluşturur",
  "Her içerikte varlık etiketi keşfi artırır",
];

type ReadinessItem = { label: string; done: boolean };

type Props = {
  kind: UploadContentKind;
  guide: string[];
  readiness: ReadinessItem[];
  displayName?: string;
  initials?: string;
  assetTag?: string;
  submitting: boolean;
  mockOn: boolean;
  onPublish: () => void;
  error: string | null;
  progress: string;
  mockSuccess: string | null;
};

export function UploadPublishDock({
  kind,
  guide,
  readiness,
  displayName,
  initials,
  assetTag,
  submitting,
  mockOn,
  onPublish,
  error,
  progress,
  mockSuccess,
}: Props) {
  const meta = UPLOAD_TYPE_META.find((t) => t.id === kind)!;
  const ctaLabel =
    submitting ? "Yayınlanıyor…" : kind === "live" ? "Yayını Başlat" : "Yayınla";
  const doneCount = readiness.filter((r) => r.done).length;
  const progressPct = Math.round((doneCount / Math.max(readiness.length, 1)) * 100);

  return (
    <aside className="uv2-dock" aria-label="Yayın paneli">
      <div className="uv2-dock-card" data-tone={meta.tone}>
        {displayName ? (
          <div className="uv2-dock-creator">
            <div className="uv2-dock-avatar">{initials || "CR"}</div>
            <div className="uv2-dock-creator-meta">
              <span className="uv2-dock-creator-name">{displayName}</span>
              <span className="uv2-dock-creator-role">Yayınlayan</span>
            </div>
            {assetTag?.trim() ? (
              <span className="uv2-dock-asset-badge">{assetTag.trim()}</span>
            ) : null}
          </div>
        ) : null}

        <div className="uv2-dock-head">
          <span className="uv2-dock-kicker">İçerik rehberi</span>
          <span className="uv2-dock-type">{meta.label}</span>
        </div>

        <div className="uv2-dock-progress">
          <div className="uv2-dock-progress-top">
            <span className="uv2-dock-progress-label">Hazırlık</span>
            <span className="uv2-dock-progress-pct">{progressPct}%</span>
          </div>
          <div className="uv2-dock-progress-bar" aria-hidden>
            <span className="uv2-dock-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <ul className="uv2-dock-checklist">
            {readiness.map((item) => (
              <li key={item.label} className={item.done ? "uv2-dock-check--done" : "uv2-dock-check"}>
                <span className="uv2-dock-check-icon" aria-hidden>{item.done ? "✓" : "○"}</span>
                {item.label}
              </li>
            ))}
          </ul>
        </div>

        <div className="uv2-dock-section">
          <p className="uv2-dock-section-title">{meta.label} ipuçları</p>
          <ul className="uv2-dock-tips">
            {guide.map((tip) => (
              <li key={tip} className="uv2-dock-tip">
                <span className="uv2-dock-tip-dot" aria-hidden />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="uv2-dock-section uv2-dock-section--muted">
          <p className="uv2-dock-section-title">Platform</p>
          <ul className="uv2-dock-tips">
            {PLATFORM_TIPS.map((tip) => (
              <li key={tip} className="uv2-dock-tip">
                <span className="uv2-dock-tip-dot" aria-hidden />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {error ? (
          <div className="uv2-feedback uv2-feedback--error" role="alert">
            {error}
          </div>
        ) : null}
        {mockSuccess ? (
          <div className="uv2-feedback uv2-feedback--success" role="status">
            {mockSuccess}
          </div>
        ) : null}
        {progress && !error ? (
          <div className="uv2-feedback uv2-feedback--progress">
            <span className="uv2-spinner" aria-hidden />
            {progress}
          </div>
        ) : null}

        <button
          type="button"
          className="uv2-publish-btn"
          disabled={submitting}
          onClick={onPublish}
          aria-busy={submitting}
        >
          {ctaLabel}
        </button>
        <p className="uv2-publish-note">
          {mockOn ? "Demo — gerçek kayıt yapılmaz." : "Yayın sonrası akışta görünür."}
        </p>
      </div>
    </aside>
  );
}
