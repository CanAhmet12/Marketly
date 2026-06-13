"use client";

import Link from "next/link";

type Variant = "error" | "empty" | "no-config" | "filtered";

type Props = {
  variant: Variant;
  onRetry?: () => void;
  onReset?: () => void;
  onShowArchive?: () => void;
  archiveCount?: number;
  compact?: boolean;
};

const COPY: Record<Variant, { title: string; desc: string }> = {
  error: {
    title: "Sinyal kataloğu yüklenemedi",
    desc: "Bağlantını kontrol edip tekrar dene. Sorun devam ederse birkaç dakika sonra yenile.",
  },
  empty: {
    title: "Henüz sinyal yok",
    desc: "Analist sinyalleri yayınlandığında katalog burada görünecek. Keşfet’ten piyasayı takip etmeye başlayabilirsin.",
  },
  "no-config": {
    title: "Veri kaynağı bağlı değil",
    desc: "Canlı sinyal kataloğu için Supabase ortam değişkenlerini yapılandırın veya geliştirme modunda mock veriyi açın.",
  },
  filtered: {
    title: "Filtrelere uyan sinyal yok",
    desc: "Segment, yön veya güven aralığını genişleterek tekrar dene.",
  },
};

export function SignalsCatalogState({
  variant,
  onRetry,
  onReset,
  onShowArchive,
  archiveCount = 0,
  compact = false,
}: Props) {
  const { title, desc } = COPY[variant];

  return (
    <div
      className={compact ? "signals-catalog-state sig-canvas__state sig-canvas__state--compact" : "signals-catalog-state sig-canvas__state"}
      role="status"
    >
      <div className="signals-catalog-state__icon" aria-hidden>
        {variant === "error" ? (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12 8v5M12 16.5v.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        ) : variant === "no-config" ? (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M10 14l8-8M12 6h6v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M14 18H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M4 18l4-8 4 5 4-9 4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="18" cy="6" r="2" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        )}
      </div>
      <h2 className="signals-catalog-state__title">{title}</h2>
      <p className="signals-catalog-state__desc">{desc}</p>
      <div className="signals-catalog-state__actions">
        {variant === "error" && onRetry ? (
          <button type="button" className="signals-catalog-state__btn signals-catalog-state__btn--primary" onClick={onRetry}>
            Tekrar dene
          </button>
        ) : null}
        {variant === "empty" && onShowArchive && archiveCount > 0 ? (
          <button type="button" className="signals-catalog-state__btn signals-catalog-state__btn--primary" onClick={onShowArchive}>
            Arşiv sinyalleri ({archiveCount})
          </button>
        ) : null}
        {variant === "empty" ? (
          <Link href="/discover" className="signals-catalog-state__btn">
            Keşfet’e git
          </Link>
        ) : null}
        {variant === "filtered" && onShowArchive && archiveCount > 0 ? (
          <button type="button" className="signals-catalog-state__btn signals-catalog-state__btn--primary" onClick={onShowArchive}>
            Arşiv sinyalleri ({archiveCount})
          </button>
        ) : null}
        {variant === "filtered" && onReset ? (
          <button type="button" className="signals-catalog-state__btn" onClick={onReset}>
            Filtreleri temizle
          </button>
        ) : null}
      </div>
    </div>
  );
}
