"use client";

import type { ReactNode } from "react";
import { useState } from "react";

import { cn } from "@/lib/cn";

type Props = {
  children: ReactNode;
};

export function SignalsFilterMobileShell({ children }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="motion-active-press fixed bottom-[calc(env(safe-area-inset-bottom)+88px)] right-[var(--sp-3)] z-30 flex h-12 w-12 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-primary)] text-[var(--color-chip-active-text)] shadow-[var(--shadow-card-md)] transition-transform duration-[var(--motion-fast)] min-[640px]:hidden"
        aria-expanded={open}
        aria-controls="signals-filter-sheet"
        onClick={() => setOpen(true)}
        title="Filtreler"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M4 6h16M7 12h10M10 18h4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {open ? (
        <div className="fixed inset-0 z-40 min-[640px]:hidden" role="dialog" aria-modal="true" aria-label="Filtreler">
          <button type="button" className="motion-backdrop-enter absolute inset-0 bg-black/40 transition-colors duration-[var(--motion-fast)] hover:bg-black/48" aria-label="Kapat" onClick={() => setOpen(false)} />
          <div
            id="signals-filter-sheet"
            className={cn(
              "motion-sheet-enter-bottom absolute bottom-0 left-0 right-0 z-10 max-h-[85vh] overflow-y-auto rounded-t-[var(--ms-card-radius-lg)] border border-[var(--color-border)]",
              "bg-[var(--color-bg-elevated)] p-[var(--sp-3)] pb-[calc(var(--sp-3)+env(safe-area-inset-bottom,0px))] shadow-[var(--shadow-dropdown)]",
            )}
          >
            <div className="mb-[var(--sp-3)] flex items-center justify-between">
              <p className="text-[15px] font-bold text-[var(--color-text)]">Filtreler</p>
              <button
                type="button"
                className="motion-active-press inline-flex h-10 min-w-10 items-center justify-center rounded-full border border-[var(--color-border)] px-[var(--sp-3)] text-[12px] font-bold text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-hover)]"
                onClick={() => setOpen(false)}
              >
                Kapat
              </button>
            </div>
            <div onClick={(e) => e.stopPropagation()}>{children}</div>
          </div>
        </div>
      ) : null}
    </>
  );
}
