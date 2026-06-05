"use client";

import { useState } from "react";

type Props = {
  src: string | null;
  poster: string | null;
  isLiveType?: boolean;
};

function playerRemountKey(props: Props): string {
  if (props.src?.trim()) return props.src.trim();
  if (props.isLiveType) return "live-no-url";
  return "no-src";
}

function WatchVideoPlayerInner({ src, poster, isLiveType }: Props) {
  const [err, setErr] = useState(false);

  if (isLiveType && !src) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-[var(--radius-xl)] bg-[var(--color-media-stage)] text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/15">
          <span className="h-3 w-3 animate-pulse rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]" />
        </div>
        <div>
          <p className="text-[14px] font-semibold text-[var(--color-on-media)]">Canlı yayın</p>
          <p className="mt-1.5 max-w-[280px] px-4 text-[12px] leading-relaxed text-[var(--color-on-media-muted)]">
            Web oynatıcısı yakında aktif olacak. Şu an için mobil uygulama üzerinden izleyebilirsiniz.
          </p>
        </div>
      </div>
    );
  }

  if (!src) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-[var(--radius-xl)] bg-[var(--color-surface)] ring-1 ring-[var(--color-border)]">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--color-meta)]" aria-hidden>
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8M12 17v4" strokeLinecap="round" />
        </svg>
        <div className="text-center">
          <p className="text-[13px] font-semibold text-[var(--color-text)]">Medya bulunamadı</p>
          <p className="mt-1 max-w-[240px] px-4 text-[12px] text-[var(--color-meta)]">
            Bu içerik için oynatılabilir video kaynağı yok.
          </p>
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-[var(--radius-xl)] bg-[var(--color-media-stage)] text-center">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-red-400/70" aria-hidden>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
        </svg>
        <div>
          <p className="text-[13px] font-semibold text-[var(--color-on-media)]">Video oynatılamadı</p>
          <p className="mt-1 text-[11px] text-[var(--color-on-media-muted)]">Format veya bağlantı sorunu olabilir.</p>
        </div>
        <button
          type="button"
          onClick={() => setErr(false)}
          className="mt-1 rounded-full border border-[color-mix(in_srgb,var(--color-on-media)_20%,transparent)] bg-[color-mix(in_srgb,var(--color-on-media)_10%,transparent)] px-4 py-1.5 text-[12px] font-semibold text-[var(--color-on-media)] transition hover:bg-[color-mix(in_srgb,var(--color-on-media)_15%,transparent)]"
        >
          Tekrar dene
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden rounded-[var(--radius-xl)] bg-black">
      <video
        className="aspect-video w-full bg-black object-contain"
        src={src}
        poster={poster ?? undefined}
        controls
        playsInline
        preload="metadata"
        onError={() => setErr(true)}
      />
    </div>
  );
}

export function WatchVideoPlayer(props: Props) {
  return <WatchVideoPlayerInner key={playerRemountKey(props)} {...props} />;
}
