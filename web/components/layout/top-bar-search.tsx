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
      e.preventDefault();
      wrapRef.current?.querySelector<HTMLInputElement>("input")?.focus();
    };
    document.addEventListener("keydown", onSlash);
    return () => document.removeEventListener("keydown", onSlash);
  }, []);

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

  const showPanel = panelOpen;

  const handleInputBlur = useCallback((e: FocusEvent<HTMLInputElement>) => {
    const next = e.relatedTarget as Node | null;
    if (next && wrapRef.current?.contains(next)) return;
    setFocused(false);
    window.setTimeout(() => setPanelOpen(false), 160);
  }, []);

  return (
    <form
      onSubmit={submit}
      className="sch-topbar-form flex w-full min-w-0 max-w-[640px] items-center gap-[var(--sp-2)]"
      role="search"
      aria-label="Site içi arama"
    >
      <div ref={wrapRef} className="sch-topbar-wrap relative min-w-0 flex-1">
        <div
          className={cn(
            "sch-topbar-field relative min-h-[40px] min-w-0 rounded-[var(--radius-chip)] border border-transparent transition-[box-shadow,border-color] duration-[var(--motion-fast)]",
            focused && "sch-topbar-field--focused",
          )}
        >
          <label htmlFor="top-bar-search-q" className="sr-only">
            Ara
          </label>
          <span className="sch-topbar-icon pointer-events-none absolute left-[var(--sp-3)] top-1/2 -translate-y-1/2" aria-hidden>
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
            aria-expanded={showPanel}
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
            className="min-h-[40px] w-full rounded-[var(--radius-chip)] border-0 bg-transparent py-2.5 pl-9 pr-[var(--sp-3)] text-[16px] font-medium leading-relaxed tracking-[-0.01em] text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-secondary)] placeholder:opacity-80"
          />
          {value ? (
            <button
              type="button"
              className="sch-topbar-clear absolute right-2 top-1/2 -translate-y-1/2"
              aria-label="Temizle"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setValue("");
                if (onResultsPage) router.replace("/results", { scroll: false });
              }}
            >
              ×
            </button>
          ) : null}
        </div>
        <div id="search-suggest-panel">
          <SearchSuggestPanel
            query={value}
            open={showPanel}
            onClose={() => setPanelOpen(false)}
            onPick={onPick}
            anchorRef={wrapRef}
          />
        </div>
      </div>
      <button
        type="submit"
        aria-label="Ara"
        className="hidden h-10 shrink-0 rounded-[var(--radius-chip)] border-0 bg-[var(--color-search-field-bg)] px-[var(--sp-4)] text-[14px] font-semibold text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface-hover)] active:scale-[0.98] sm:inline-block"
      >
        Ara
      </button>
    </form>
  );
}
