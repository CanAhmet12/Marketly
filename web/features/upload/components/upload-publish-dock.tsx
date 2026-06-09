"use client";

import type { UploadContentKind } from "@/features/upload/components/upload-type-rail";
import { UPLOAD_TYPE_META } from "@/features/upload/components/upload-type-rail";

type Props = {
  kind: UploadContentKind;
  guide: string[];
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

  return (
    <aside className="uv2-dock" aria-label="Yayın paneli">
      <div className="uv2-dock-card" data-tone={meta.tone}>
        <div className="uv2-dock-head">
          <span className="uv2-dock-kicker">Hızlı rehber</span>
          <span className="uv2-dock-type">{meta.label}</span>
        </div>
        <ul className="uv2-dock-tips">
          {guide.slice(0, 3).map((tip) => (
            <li key={tip} className="uv2-dock-tip">
              <span className="uv2-dock-tip-dot" aria-hidden />
              <span>{tip}</span>
            </li>
          ))}
        </ul>

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
