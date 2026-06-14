"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { buildSearchUrl } from "@/features/search/lib/search-url";
import { SEARCH_QUICK_SYMBOLS, SEARCH_TREND_SUGGESTIONS } from "@/features/search/lib/search-suggest-data";
import { useRecentSearches } from "@/features/search/hooks/use-recent-searches";
import { cn } from "@/lib/cn";

type SuggestKind = "recent" | "trend" | "symbol";

type Props = {
  query: string;
  open: boolean;
  onClose: () => void;
  onPick: (q: string) => void;
  anchorRef: React.RefObject<HTMLElement | null>;
  variant?: "topbar" | "inline";
};

const KIND_LABEL: Record<SuggestKind, string> = {
  recent: "Son",
  trend: "Trend",
  symbol: "Sembol",
};

function kindClass(kind: SuggestKind): string {
  if (kind === "symbol") return "srch-suggest__kind--symbol";
  if (kind === "trend") return "srch-suggest__kind--trend";
  return "srch-suggest__kind--recent";
}

export function SearchSuggestPanel({
  query,
  open,
  onClose,
  onPick,
  anchorRef,
  variant = "topbar",
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const { recent, removeRecent } = useRecentSearches();
  const [activeIdx, setActiveIdx] = useState(-1);
  const trimmed = query.trim();
  const resultsHref = trimmed.length >= 2 ? buildSearchUrl(trimmed, "all") : "/results";

  const items = useMemo(() => {
    const t = trimmed.toLowerCase();
    const out: { id: string; label: string; q: string; kind: SuggestKind }[] = [];

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
  }, [trimmed, recent]);

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
    <div
      ref={panelRef}
      className={cn("srch-suggest", variant === "inline" && "srch-suggest--inline")}
      role="listbox"
      aria-label="Arama önerileri"
    >
      <div className="srch-suggest__head">
        <span className="srch-suggest__eyebrow">{variant === "inline" ? "Hızlı arama" : "Öneriler"}</span>
        {trimmed ? <span className="srch-suggest__query">&ldquo;{trimmed}&rdquo;</span> : null}
      </div>

      {items.length === 0 ? (
        <p className="srch-suggest__empty">Eşleşme yok — Enter ile tam arama yapın</p>
      ) : (
        <ul className="srch-suggest__list">
          {items.map((item, idx) => (
            <li key={item.id}>
              <button
                type="button"
                role="option"
                aria-selected={idx === activeIdx}
                className={cn("srch-suggest__item", idx === activeIdx && "srch-suggest__item--active")}
                onMouseEnter={() => setActiveIdx(idx)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(item.q);
                }}
              >
                <span className={cn("srch-suggest__kind", kindClass(item.kind))}>{KIND_LABEL[item.kind]}</span>
                <span className="srch-suggest__label">{item.label}</span>
                {item.kind === "recent" ? (
                  <span
                    role="button"
                    tabIndex={-1}
                    className="srch-suggest__remove"
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

      <div className="srch-suggest__foot">
        <div className="srch-suggest__foot-links">
          {trimmed.length >= 2 ? (
            <Link
              href={resultsHref}
              className="srch-suggest__link srch-suggest__link--primary"
              onMouseDown={(e) => e.preventDefault()}
              onClick={onClose}
            >
              Tüm sonuçları gör
            </Link>
          ) : null}
          <Link
            href="/results"
            className="srch-suggest__link"
            onMouseDown={(e) => e.preventDefault()}
            onClick={onClose}
          >
            Arama sayfası
          </Link>
        </div>
        <span className="srch-suggest__hint">↑↓ · Enter · Esc</span>
      </div>
    </div>
  );
}
