"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "marketly-theme";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setMounted(true);
      const t = document.documentElement.getAttribute("data-theme");
      setIsLight(t === "light");
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const toggle = useCallback(() => {
    const next = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* yok */
    }
    setIsLight(next === "light");
  }, []);

  if (!mounted) {
    return <div className="h-9 w-9 shrink-0 rounded-full bg-[var(--color-surface-muted)]" aria-hidden />;
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-text-sub)] transition duration-[var(--motion-fast)] hover:border-[color:color-mix(in_srgb,var(--color-primary)_32%,var(--color-border)_68%)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)] active:scale-[0.96]"
      title={isLight ? "Koyu mod" : "Açık mod"}
      aria-label={isLight ? "Koyu moda geç" : "Açık moda geç"}
    >
      {isLight ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <path d="M21 14.5A8.5 8.5 0 0 1 9.5 3a8.5 8.5 0 1 0 11.5 11.5Z" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" strokeLinecap="round" />
        </svg>
      )}
    </button>
  );
}
