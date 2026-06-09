"use client";

import Link from "next/link";

type Variant = "error" | "empty" | "no-config" | "filtered" | "live-empty" | "rising-empty";

type Props = {
  variant: Variant;
  onRetry?: () => void;
};

const COPY: Record<Variant, { title: string; desc: string }> = {
  error: {
    title: "Üreticiler yüklenemedi",
    desc: "Bağlantını kontrol edip tekrar dene. Sorun devam ederse birkaç dakika sonra yenile.",
  },
  empty: {
    title: "Henüz üretici yok",
    desc: "İçerik üreticileri ve analistler burada listelenecek. Keşfet’ten topluluğu takip etmeye başlayabilirsin.",
  },
  "no-config": {
    title: "Veri kaynağı bağlı değil",
    desc: "Canlı üretici dizini için Supabase ortam değişkenlerini yapılandırın veya geliştirme modunda mock veriyi açın.",
  },
  filtered: {
    title: "Eşleşen üretici bulunamadı",
    desc: "Arama veya filtreleri değiştirerek tekrar dene.",
  },
  "live-empty": {
    title: "Şu an canlı yayın yok",
    desc: "Canlı masalar açıldığında burada görünecek. Tüm üreticiler sekmesine geçebilirsin.",
  },
  "rising-empty": {
    title: "Yükselen üretici yok",
    desc: "Momentum kazanan üreticiler burada listelenecek.",
  },
};

export function CreatorsDirectoryState({ variant, onRetry }: Props) {
  const { title, desc } = COPY[variant];

  return (
    <div className="creators-directory-state" role="status">
      <div className="creators-directory-state__icon" aria-hidden>
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
            <circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="17" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M4 19v-1a5 5 0 0 1 5-5M14 18v-1a4 4 0 0 1 3-3.87" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )}
      </div>
      <h2 className="creators-directory-state__title">{title}</h2>
      <p className="creators-directory-state__desc">{desc}</p>
      <div className="creators-directory-state__actions">
        {variant === "error" && onRetry ? (
          <button type="button" className="creators-directory-state__btn creators-directory-state__btn--primary" onClick={onRetry}>
            Tekrar dene
          </button>
        ) : null}
        {variant === "empty" || variant === "live-empty" || variant === "rising-empty" ? (
          <Link href="/discover?tab=creators" className="creators-directory-state__btn creators-directory-state__btn--primary">
            Keşfet’e git
          </Link>
        ) : null}
        {variant === "filtered" ? (
          <Link href="/creators" className="creators-directory-state__btn">
            Filtreleri temizle
          </Link>
        ) : null}
      </div>
    </div>
  );
}
