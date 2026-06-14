"use client";

import { useCallback, useEffect, useRef, useState, type FocusEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { SearchSuggestPanel } from "@/features/search/components/search-suggest-panel";
import { buildSearchUrl } from "@/features/search/lib/search-url";
import { useRecentSearches } from "@/features/search/hooks/use-recent-searches";
import { cn } from "@/lib/cn";

export function SearchInlineField() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const { pushRecent } = useRecentSearches();

  const navigate = useCallback(
    (q: string) => {
      const t = q.trim();
      if (t.length < 2) return;
      pushRecent(t);
      router.push(buildSearchUrl(t, "all"));
      setPanelOpen(false);
      setFocused(false);
    },
    [router, pushRecent],
  );

  const submit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      navigate(value);
    },
    [navigate, value],
  );

  const onPick = useCallback(
    (q: string) => {
      setValue(q);
      navigate(q);
    },
    [navigate],
  );

  const handleInputBlur = useCallback((e: FocusEvent<HTMLInputElement>) => {
    const next = e.relatedTarget as Node | null;
    if (next && wrapRef.current?.contains(next)) return;
    setFocused(false);
    window.setTimeout(() => setPanelOpen(false), 160);
  }, []);

  useEffect(() => {
    const onSlash = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || (e.target as HTMLElement)?.isContentEditable) return;
      e.preventDefault();
      wrapRef.current?.querySelector<HTMLInputElement>("#search-inline-q")?.focus();
    };
    document.addEventListener("keydown", onSlash);
    return () => document.removeEventListener("keydown", onSlash);
  }, []);

  return (
    <form className="srch-inline-form" onSubmit={submit} role="search" aria-label="Sayfa içi arama">
      <div ref={wrapRef} className="srch-inline-wrap">
        <div
          className={cn("srch-inline-field", focused && "srch-inline-field--focused")}
        >
          <label htmlFor="search-inline-q" className="sr-only">
            Ara
          </label>
          <span className="srch-inline-icon" aria-hidden>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3-3" strokeLinecap="round" />
            </svg>
          </span>
          <input
            id="search-inline-q"
            name="q"
            type="search"
            autoComplete="off"
            placeholder="Sembol, kanal, video veya konu…"
            aria-label="Arama sorgusu"
            aria-expanded={panelOpen}
            aria-controls="search-inline-suggest-panel"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setPanelOpen(true);
            }}
            onFocus={() => {
              setFocused(true);
              setPanelOpen(true);
            }}
            onBlur={handleInputBlur}
          />
          {value ? (
            <button
              type="button"
              className="srch-inline-clear"
              aria-label="Temizle"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setValue("")}
            >
              ×
            </button>
          ) : (
            <span className="srch-inline-kbd" aria-hidden>
              /
            </span>
          )}
        </div>
        <div id="search-inline-suggest-panel">
          <SearchSuggestPanel
            query={value}
            open={panelOpen}
            onClose={() => setPanelOpen(false)}
            onPick={onPick}
            anchorRef={wrapRef}
            variant="inline"
          />
        </div>
      </div>
      <button type="submit" className="srch-inline-submit">
        Ara
      </button>
    </form>
  );
}
