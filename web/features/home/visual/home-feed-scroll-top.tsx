"use client";

import { useEffect, useState } from "react";

const SHOW_AFTER_PX = 520;

function readScrollY(): number {
  if (typeof document === "undefined") return 0;
  const root = document.scrollingElement ?? document.documentElement;
  return root.scrollTop || window.scrollY || 0;
}

export function HomeFeedScrollTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(readScrollY() > SHOW_AFTER_PX);
    };
    onScroll();
    const root = document.scrollingElement ?? document.documentElement;
    root.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      root.removeEventListener("scroll", onScroll);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      className="hv-ref-scroll-top"
      aria-label="Yukarı çık"
      onClick={() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 19V5M7 10l5-5 5 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
