"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type FocusEvent, type FormEvent } from "react";

import { SearchSuggestPanel } from "@/features/search/components/search-suggest-panel";
import { buildSearchUrl } from "@/features/search/lib/search-url";
import { useRecentSearches } from "@/features/search/hooks/use-recent-searches";
import { cn } from "@/lib/cn";

export function TopBarSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const qParam = searchParams.get("q") ?? "";
  const [value, setValue] = useState(qParam);
  const [focused, setFocused] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const { pushRecent } = useRecentSearches();

  const onResultsPage = pathname === "/results" || pathname === "/search";
  const hasQuery = Boolean(qParam.trim());

  useEffect(() => {
    if (onResultsPage) {
      setValue(qParam);
    }
  }, [onResultsPage, qParam]);

  useEffect(() => {
    const onSlash = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || (e.target as HTMLElement)?.isContentEditable) return;

      if (onResultsPage && !qParam.trim()) {
        const inline = document.getElementById("search-inline-q");
        if (inline instanceof HTMLInputElement) {
          e.preventDefault();
          inline.focus();
          return;
        }
      }

      e.preventDefault();
      wrapRef.current?.querySelector<HTMLInputElement>("#top-bar-search-q")?.focus();
    };
    document.addEventListener("keydown", onSlash);
    return () => document.removeEventListener("keydown", onSlash);
  }, [onResultsPage, qParam]);

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

  return (
    <form
      onSubmit={submit}
      className={cn("srch-topbar-form", onResultsPage && "srch-topbar-form--results")}
      role="search"
      aria-label="Site içi arama"
    >
      <div ref={wrapRef} className="srch-topbar-wrap">
        <div
          className={cn(
            "srch-topbar-field",
            focused && "srch-topbar-field--focused",
            onResultsPage && hasQuery && "srch-topbar-field--synced",
          )}
        >
          <label htmlFor="top-bar-search-q" className="sr-only">
            Ara
          </label>
          <span className="srch-topbar-icon" aria-hidden>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3-3" strokeLinecap="round" />
            </svg>
          </span>
          <input
            id="top-bar-search-q"
            name="q"
            type="search"
            autoComplete="off"
            placeholder="Sembol, kanal veya konu…"
            aria-label="Arama sorgusu"
            aria-expanded={panelOpen}
            aria-controls="search-suggest-panel"
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
              className="srch-topbar-clear"
              aria-label="Temizle"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setValue("");
                if (onResultsPage) router.replace("/results", { scroll: false });
              }}
            >
              ×
            </button>
          ) : (
            <span className="srch-topbar-kbd" aria-hidden>
              /
            </span>
          )}
        </div>
        <div id="search-suggest-panel">
          <SearchSuggestPanel
            query={value}
            open={panelOpen}
            onClose={() => setPanelOpen(false)}
            onPick={onPick}
            anchorRef={wrapRef}
            variant="topbar"
          />
        </div>
      </div>
      <button type="submit" className="srch-topbar-submit" aria-label="Ara">
        Ara
      </button>
    </form>
  );
}
