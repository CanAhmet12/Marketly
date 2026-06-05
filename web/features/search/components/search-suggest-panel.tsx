"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { buildSearchUrl } from "@/features/search/lib/search-url";
import { SEARCH_QUICK_SYMBOLS, SEARCH_TREND_SUGGESTIONS } from "@/features/search/lib/search-suggest-data";
import { useRecentSearches } from "@/features/search/hooks/use-recent-searches";
import { cn } from "@/lib/cn";

type Props = {
  query: string;
  open: boolean;
  onClose: () => void;
  onPick: (q: string) => void;
  anchorRef: React.RefObject<HTMLElement | null>;
};

export function SearchSuggestPanel({ query, open, onClose, onPick, anchorRef }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const { recent, removeRecent } = useRecentSearches();
  const [activeIdx, setActiveIdx] = useState(-1);

  const items = useMemo(() => {
    const t = query.trim().toLowerCase();
    const out: { id: string; label: string; q: string; kind: "recent" | "trend" | "symbol" }[] = [];

    for (const r of recent) {
      if (!t || r.toLowerCase().includes(t)) {
        out.push({ id: `r-${r}`, label: r, q: r, kind: "recent" });
      }
    }

    for (const s of SEARCH_TREND_SUGGESTIONS) {
      if (!t || s.q.toLowerCase().includes(t) || s.label.toLowerCase().includes(t)) {
        if (!out.some((x) => x.q.toLowerCase() === s.q.toLowerCase())) {
          out.push({ id: `t-${s.q}`, label: s.label, q: s.q, kind: "trend" });
        }
      }
    }

    for (const sym of SEARCH_QUICK_SYMBOLS) {
      if (!t || sym.toLowerCase().startsWith(t)) {
        if (!out.some((x) => x.q.toLowerCase() === sym.toLowerCase())) {
          out.push({ id: `s-${sym}`, label: sym, q: sym, kind: "symbol" });
        }
      }
    }

    return out.slice(0, 8);
  }, [query, recent]);

  useEffect(() => {
    setActiveIdx(-1);
  }, [query, open]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (panelRef.current?.contains(t)) return;
      if (anchorRef.current?.contains(t)) return;
      onClose();
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, onClose, anchorRef]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (!items.length) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((i) => (i + 1) % items.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((i) => (i <= 0 ? items.length - 1 : i - 1));
      } else if (e.key === "Enter" && activeIdx >= 0) {
        e.preventDefault();
        onPick(items[activeIdx].q);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, items, activeIdx, onClose, onPick]);

  const pick = useCallback(
    (q: string) => {
      onPick(q);
      onClose();
    },
    [onPick, onClose],
  );

  if (!open) return null;

  return (
    <div ref={panelRef} className="sch-suggest" role="listbox" aria-label="Arama önerileri">
      {items.length === 0 ? (
        <p className="sch-suggest__empty">Öneri yok — Enter ile ara</p>
      ) : (
        <ul className="sch-suggest__list">
          {items.map((item, idx) => (
            <li key={item.id}>
              <button
                type="button"
                role="option"
                aria-selected={idx === activeIdx}
                className={cn("sch-suggest__item", idx === activeIdx && "sch-suggest__item--active")}
                onMouseEnter={() => setActiveIdx(idx)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(item.q);
                }}
              >
                <span className="sch-suggest__kind">
                  {item.kind === "recent" ? "Son" : item.kind === "symbol" ? "Sembol" : "Trend"}
                </span>
                <span className="sch-suggest__label">{item.label}</span>
                {item.kind === "recent" ? (
                  <span
                    role="button"
                    tabIndex={-1}
                    className="sch-suggest__remove"
                    aria-label="Kaldır"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeRecent(item.q);
                    }}
                  >
                    ×
                  </span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="sch-suggest__foot">
        <Link
          href="/results"
          className="sch-suggest__link"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onClose}
        >
          Gelişmiş arama
        </Link>
        <span className="sch-suggest__hint">↑↓ seç · Enter ara · Esc kapat</span>
      </div>
    </div>
  );
}

export function buildSuggestPickUrl(q: string): string {
  return buildSearchUrl(q, "all");
}
