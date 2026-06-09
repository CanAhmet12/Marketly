"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { cn } from "@/lib/cn";

import { WelcomePreviewPanel } from "./welcome-preview-panels";
import { WELCOME_SLIDES } from "./welcome-slides";
import { markWelcomeSeen, saveWelcomeInterests } from "./welcome-storage";
import { useWelcomeLiveData } from "./use-welcome-live-data";

function NavArrow({ dir }: { dir: "prev" | "next" }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden className="welcome-dock-arrow">
      {dir === "prev" ? (
        <path d="M14.5 6.5L9 12l5.5 5.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M9.5 6.5L15 12l-5.5 5.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

export function WelcomeStoriesClient() {
  const router = useRouter();
  const { data: liveData, isLoading } = useWelcomeLiveData();
  const [index, setIndex] = useState(0);
  const [interests, setInterests] = useState<Set<string>>(() => new Set());
  const total = WELCOME_SLIDES.length;
  const slide = WELCOME_SLIDES[index]!;
  const isLast = index === total - 1;

  const goNext = useCallback(() => setIndex((i) => Math.min(total - 1, i + 1)), [total]);
  const goPrev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);

  const finishWelcome = useCallback(
    (href: string) => {
      markWelcomeSeen();
      if (interests.size) saveWelcomeInterests([...interests]);
      router.replace(href);
    },
    [router, interests],
  );

  const persistAndMark = useCallback(() => {
    markWelcomeSeen();
    if (interests.size) saveWelcomeInterests([...interests]);
  }, [interests]);

  const toggleInterest = useCallback((id: string) => {
    setInterests((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 4) next.add(id);
      return next;
    });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev]);

  useEffect(() => {
    WELCOME_SLIDES.forEach((s) => {
      const img = new Image();
      img.srcset = s.bgSrcSet;
      img.sizes = "100vw";
      img.src = s.bgImage;
    });
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const p = slide.palette;

  return (
    <div
      className="welcome-desktop"
      data-scene={slide.scene}
      data-tone={p.mode}
      style={
        {
          "--slide-accent": slide.accent,
          "--slide-accent-2": slide.accent2,
          "--wd-title": p.title,
          "--wd-body": p.body,
          "--wd-muted": p.muted,
          "--wd-kicker": p.kicker,
          "--wd-shadow": p.shadow,
          "--wd-gradient-shadow": p.gradientShadow,
          "--wd-tag-bg": p.tagBg,
          "--wd-tag-border": p.tagBorder,
          "--wd-tag-text": p.tagText,
          "--wd-stage-text": p.stageText,
          "--wd-stage-muted": p.stageMuted,
          "--wd-photo-filter": p.photoFilter,
        } as React.CSSProperties
      }
    >
      <div className="welcome-desktop__bg" aria-hidden>
        <picture key={slide.id} className="welcome-desktop__photo is-active">
          <source srcSet={slide.bgSrcSet} sizes="100vw" type="image/webp" />
          <img
            src={slide.bgImage}
            alt=""
            decoding="async"
            fetchPriority={index === 0 ? "high" : "low"}
            style={{ objectPosition: slide.bgFocal }}
          />
        </picture>
        <div className="welcome-desktop__mesh" />
        <div className="welcome-desktop__dream-orbs">
          <span className="welcome-dream-orb welcome-dream-orb--1" />
          <span className="welcome-dream-orb welcome-dream-orb--2" />
          <span className="welcome-dream-orb welcome-dream-orb--3" />
        </div>
        <div className="welcome-desktop__grain" />
      </div>

      <div className="welcome-desktop__frame">
        <header className="welcome-desktop__header">
          <div className="welcome-desktop__brand">
            <img src="/logo.png" alt="" width={36} height={36} className="welcome-desktop__logo" />
            <div>
              <span className="welcome-desktop__brand-name">Marketly</span>
              <span className="welcome-desktop__brand-sub">Finans sosyal platformu</span>
            </div>
          </div>
          <div className="welcome-desktop__header-actions">
            <span className="welcome-desktop__step">
              {String(index + 1).padStart(2, "0")} <span>/ {String(total).padStart(2, "0")}</span>
            </span>
            <button type="button" className="welcome-desktop__skip" onClick={() => finishWelcome("/discover")}>
              Atla →
            </button>
          </div>
        </header>

        <div className="welcome-desktop__progress" aria-hidden>
          {WELCOME_SLIDES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className={cn("welcome-desktop__progress-seg", i <= index && "is-active", i < index && "is-done")}
              onClick={() => setIndex(i)}
              aria-label={`${s.kicker} slaytı`}
            />
          ))}
        </div>

        <div className="welcome-desktop__hero">
          <section className="welcome-desktop__copy">
            <p className="welcome-desktop__kicker">{slide.kicker}</p>

            <h1 className="welcome-desktop__title">
              <span className="welcome-desktop__title-line">{slide.titleLine1}</span>{" "}
              <span className="welcome-desktop__title-gradient">{slide.titleGradient}</span>
            </h1>

            <div className="welcome-desktop__meta-row">
              <p className="welcome-desktop__dream">{slide.dreamLine}</p>
              <span className="welcome-desktop__meta-sep" aria-hidden />
              <p className="welcome-desktop__subtitle">{slide.subtitle}</p>
            </div>

            <div className="welcome-desktop__feature-row">
              <ul className="welcome-desktop__tags">
                {slide.tags.map((t) => (
                  <li key={t} className="welcome-desktop__tag">
                    {t}
                  </li>
                ))}
              </ul>
              <ul className="welcome-desktop__highlights">
                {slide.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </div>

            {isLast ? (
              <div className="welcome-desktop__cta-group">
                <Link href="/auth/register" className="welcome-desktop__cta" onClick={persistAndMark}>
                  Hesap oluştur
                </Link>
                <Link href="/auth/login" className="welcome-desktop__cta-secondary" onClick={persistAndMark}>
                  Giriş yap
                </Link>
                <button type="button" className="welcome-desktop__cta-ghost" onClick={() => finishWelcome("/discover")}>
                  Misafir keşfet
                </button>
              </div>
            ) : null}
          </section>

          <section className="welcome-desktop__stage" aria-label="Canlı önizleme">
            <WelcomePreviewPanel
              slide={slide}
              data={liveData}
              loading={isLoading}
              selectedInterests={interests}
              onToggleInterest={toggleInterest}
            />
          </section>
        </div>

        <footer className="welcome-desktop__dock">
          <button
            type="button"
            className={cn("welcome-desktop__dock-btn", "welcome-desktop__dock-btn--prev")}
            onClick={goPrev}
            disabled={index === 0}
            aria-label="Önceki slayt"
          >
            <NavArrow dir="prev" />
          </button>

          <div className="welcome-desktop__dock-dots" aria-hidden>
            {WELCOME_SLIDES.map((s, i) => (
              <button
                key={s.id}
                type="button"
                className={cn("welcome-desktop__dock-dot", i === index && "is-active")}
                onClick={() => setIndex(i)}
                aria-label={s.kicker}
              />
            ))}
          </div>

          <button
            type="button"
            className={cn("welcome-desktop__dock-btn", "welcome-desktop__dock-btn--next")}
            onClick={goNext}
            disabled={isLast}
            aria-label="Sonraki slayt"
          >
            <NavArrow dir="next" />
          </button>
        </footer>
      </div>
    </div>
  );
}
