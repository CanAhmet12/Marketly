"use client";

import Link from "next/link";

type Props = {
  isLoggedIn: boolean;
};

export function HomeHero({ isLoggedIn }: Props) {
  return (
    <section
      className="relative overflow-hidden rounded-[var(--radius-xl)] border border-white/10 bg-[var(--gradient-hero)] px-5 py-8 shadow-[var(--shadow-card-md)] sm:px-8 sm:py-10"
      aria-labelledby="home-hero-title"
    >
      <div className="pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full bg-[var(--color-primary)]/20 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-[#3b82f6]/15 blur-3xl" aria-hidden />
      <div className="relative max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/55">Marketly</p>
        <h2 id="home-hero-title" className="mt-2 text-2xl font-semibold leading-tight tracking-tight text-white sm:text-3xl">
          Piyasaları takip et, içerik üret, analiz paylaş
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/72 sm:text-[15px]">
          Finans ve sosyal video topluluğu: fikirlerini videoda veya gönderide anlat; sinyalleri etiketle; toplulukla etkileş.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {!isLoggedIn ? (
            <Link
              href="/auth/login?next=%2F"
              className="inline-flex items-center justify-center rounded-[var(--radius-pill)] bg-white px-5 py-2.5 text-sm font-semibold text-[#0f1117] shadow-lg transition hover:bg-white/95"
            >
              Giriş yap
            </Link>
          ) : null}
          <Link
            href="/upload"
            className="inline-flex items-center justify-center rounded-[var(--radius-pill)] border border-white/35 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
          >
            İçerik yükle
          </Link>
          <Link
            href="/results"
            className="text-sm font-semibold text-white/80 underline-offset-4 hover:text-white hover:underline"
          >
            Arama
          </Link>
        </div>
      </div>
    </section>
  );
}
