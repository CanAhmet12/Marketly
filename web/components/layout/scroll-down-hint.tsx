"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/cn";

const STORAGE_KEY = "marketly-scroll-hint-dismissed";
const SCROLL_HIDE_PX = 48;
const NEAR_TOP_PX = 16;

function readScrollY(): number {
  if (typeof document === "undefined") return 0;
  const root = document.scrollingElement ?? document.documentElement;
  return root.scrollTop || window.scrollY || document.body.scrollTop || 0;
}

function isPageScrollable(): boolean {
  if (typeof document === "undefined") return false;
  const root = document.scrollingElement ?? document.documentElement;
  return root.scrollHeight > window.innerHeight + 80;
}

function wasDismissed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function markDismissed(): void {
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    /* ignore */
  }
}

function IconChevronDown({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ScrollDownHint() {
  const [visible, setVisible] = useState(false);
  const dismissedRef = useRef(false);

  useEffect(() => {
    if (wasDismissed()) {
      dismissedRef.current = true;
      return;
    }

    const evaluate = () => {
      if (dismissedRef.current) {
        setVisible(false);
        return;
      }
      const y = readScrollY();
      if (y > SCROLL_HIDE_PX) {
        dismissedRef.current = true;
        markDismissed();
        setVisible(false);
        return;
      }
      setVisible(y <= NEAR_TOP_PX && isPageScrollable());
    };

    const onScroll = () => {
      requestAnimationFrame(evaluate);
    };

    const onResize = () => {
      evaluate();
    };

    const timer = window.setTimeout(evaluate, 400);

    const root = document.scrollingElement ?? document.documentElement;
    root.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      window.clearTimeout(timer);
      root.removeEventListener("scroll", onScroll);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={cn(
        "marketly-scroll-hint pointer-events-none fixed inset-x-0 bottom-0 z-[26] flex justify-center",
        "pb-[max(1.25rem,env(safe-area-inset-bottom,0px))]",
      )}
      aria-hidden
    >
      <div className="marketly-scroll-hint__pill flex flex-col items-center gap-0.5 rounded-full border border-[color-mix(in_srgb,var(--color-border-strong)_55%,transparent)] bg-[color-mix(in_srgb,var(--color-surface)_88%,transparent)] px-3 py-2 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.18)] backdrop-blur-sm">
        <IconChevronDown className="marketly-scroll-hint__chevron text-[var(--color-text-secondary)]" />
      </div>
    </div>
  );
}
