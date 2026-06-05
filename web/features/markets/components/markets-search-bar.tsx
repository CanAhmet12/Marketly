"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useMemo, useRef } from "react";

import type { MarketAssetCategory, MarketAssetView } from "@/features/markets/types";
import { cn } from "@/lib/cn";

type Props = {
  assets: MarketAssetView[];
  trending: MarketAssetView[];
  query: string;
  setQuery: (q: string) => void;
  open: boolean;
  setOpen: (o: boolean) => void;
  recent: string[];
  pushRecent: (q: string) => void;
  clearRecent: () => void;
  highlight: number;
  setHighlight: (i: number) => void;
  resetHighlight: () => void;
  onSelectAsset: (a: MarketAssetView) => void;
};

export function MarketsSearchBar({
  assets,
  trending,
  query,
  setQuery,
  open,
  setOpen,
  recent,
  pushRecent,
  clearRecent,
  highlight,
  setHighlight,
  resetHighlight,
  onSelectAsset,
}: Props) {
  const listId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const normalized = query.trim().toLowerCase();

  const suggestions = useMemo(() => {
    if (!normalized) {
      return [] as MarketAssetView[];
    }
    return assets
      .filter(
        (a) =>
          a.symbol.toLowerCase().includes(normalized) ||
          a.name.toLowerCase().includes(normalized) ||
          categoryTr(a.category).toLowerCase().includes(normalized),
      )
      .slice(0, 8);
  }, [assets, normalized]);

  const flatList = useMemo(() => {
    if (normalized) return suggestions.map((s) => ({ type: "asset" as const, asset: s }));
    const rows: { type: "asset" | "recent"; asset?: MarketAssetView; text?: string }[] = [];
    recent.forEach((r) => {
      const a = assets.find((x) => x.symbol.toLowerCase() === r.toLowerCase() || x.name.toLowerCase() === r.toLowerCase());
      if (a) rows.push({ type: "asset", asset: a });
      else rows.push({ type: "recent", text: r });
    });
    trending.forEach((a) => {
      if (!rows.some((x) => x.type === "asset" && x.asset?.symbol === a.symbol)) {
        rows.push({ type: "asset", asset: a });
      }
    });
    return rows.slice(0, 10);
  }, [normalized, suggestions, recent, trending, assets]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [setOpen]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
        setOpen(true);
        return;
      }
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlight(Math.min(flatList.length - 1, highlight + 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlight(Math.max(0, highlight - 1));
      } else if (e.key === "Enter" && flatList.length) {
        e.preventDefault();
        const row = flatList[Math.min(highlight, flatList.length - 1)];
        if (row?.type === "asset" && row.asset) {
          pushRecent(row.asset.symbol);
          onSelectAsset(row.asset);
          setOpen(false);
          setQuery("");
        } else if (row?.type === "recent" && row.text) {
          setQuery(row.text);
        }
      }
    },
    [open, flatList, highlight, setHighlight, setOpen, pushRecent, onSelectAsset, setQuery],
  );

  return (
    <div ref={wrapRef} className="markets-search-wrap relative z-30">
      <label htmlFor={listId} className="sr-only">
        Piyasa ara
      </label>
      <div className="markets-glass-25 flex items-center gap-[var(--sp-2)] rounded-full px-[var(--sp-4)] py-[var(--sp-2)]">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0 text-[var(--color-meta)]" aria-hidden>
          <path
            d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
            stroke="currentColor"
            strokeWidth="1.75"
          />
          <path d="M16.5 16.5 21 21" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
        <input
          ref={inputRef}
          id={listId}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            resetHighlight();
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Sembol, coin, hisse veya konu ara..."
          className="min-w-0 flex-1 bg-transparent text-[14px] font-semibold text-[var(--color-text)] outline-none placeholder:text-[var(--color-meta)]"
          autoComplete="off"
          aria-autocomplete="list"
        />
        {query ? (
          <button
            type="button"
            className="shrink-0 rounded-full px-[var(--sp-2)] py-px text-[12px] font-semibold text-[var(--color-meta)] hover:text-[var(--color-text)]"
            onClick={() => {
              setQuery("");
              resetHighlight();
              inputRef.current?.focus();
            }}
          >
            Temizle
          </button>
        ) : null}
      </div>

      {open && flatList.length > 0 ? (
        <div
          id={`${listId}-panel`}
          role="listbox"
          className="markets-glass-25 absolute left-0 right-0 top-[calc(100%+var(--sp-2))] max-h-[min(70vh,360px)] overflow-y-auto rounded-2xl py-[var(--sp-2)]"
        >
          {!normalized && recent.length > 0 ? (
            <div className="flex items-center justify-between px-[var(--sp-3)] pb-[var(--sp-2)] pt-px">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-meta)]">Son aramalar</span>
              <button type="button" className="text-[11px] font-semibold text-[var(--color-primary-dark)] hover:underline" onClick={clearRecent}>
                Sil
              </button>
            </div>
          ) : null}
          {!normalized ? (
            <p className="px-[var(--sp-3)] pt-[var(--sp-2)] text-[11px] font-semibold uppercase tracking-wide text-[var(--color-meta)]">
              Trend varlıklar
            </p>
          ) : null}
          <ul className="list-none p-0">
            {flatList.map((row, i) => {
              const active = i === highlight;
              if (row.type === "recent" && row.text) {
                return (
                  <li key={`r-${row.text}`}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={active}
                      className={cn(
                        "flex w-full items-center gap-[var(--sp-2)] px-[var(--sp-3)] py-[var(--sp-2)] text-left text-[13px] font-semibold",
                        active ? "bg-[var(--color-nav-row-active)]" : "hover:bg-[var(--color-nav-row-hover)]",
                      )}
                      onMouseEnter={() => setHighlight(i)}
                      onClick={() => {
                        setQuery(row.text!);
                        setHighlight(0);
                      }}
                    >
                      <span className="text-[var(--color-meta)]">Geçmiş</span>
                      <span className="text-[var(--color-text)]">{row.text}</span>
                    </button>
                  </li>
                );
              }
              const a = row.asset!;
              return (
                <li key={a.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    className={cn(
                      "flex w-full items-center justify-between gap-[var(--sp-3)] px-[var(--sp-3)] py-[var(--sp-2)] text-left",
                      active ? "bg-[var(--color-nav-row-active)]" : "hover:bg-[var(--color-nav-row-hover)]",
                    )}
                    onMouseEnter={() => setHighlight(i)}
                    onClick={() => {
                      pushRecent(a.symbol);
                      onSelectAsset(a);
                      setOpen(false);
                      setQuery("");
                    }}
                  >
                    <div>
                      <p className="text-[14px] font-bold text-[var(--color-text)]">{a.symbol}</p>
                      <p className="text-[12px] font-medium text-[var(--color-text-secondary)]">{a.name}</p>
                    </div>
                    <span className="text-[11px] font-semibold text-[var(--color-meta)]">{categoryTr(a.category)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="px-[var(--sp-3)] pt-[var(--sp-2)]">
            <Link
              href={query ? `/results?q=${encodeURIComponent(query)}` : "/results"}
              className="text-[12px] font-semibold text-[var(--color-primary-dark)] hover:underline"
              onClick={() => setOpen(false)}
            >
              Gelişmiş arama
            </Link>
          </div>
        </div>
      ) : open && normalized && suggestions.length === 0 ? (
        <div
          role="status"
          className="markets-glass-25 absolute left-0 right-0 top-[calc(100%+var(--sp-2))] rounded-2xl px-[var(--sp-3)] py-[var(--sp-4)] text-[13px] font-semibold text-[var(--color-text-secondary)]"
        >
          Bu arama için sonuç bulunamadı. Farklı bir sembol deneyin veya gelişmiş aramayı kullanın.
        </div>
      ) : null}
    </div>
  );
}

function categoryTr(c: MarketAssetCategory): string {
  const m: Record<MarketAssetCategory, string> = {
    crypto: "Kripto",
    stocks: "Hisse",
    forex: "Döviz",
    commodity: "Emtia",
    index: "Endeks",
  };
  return m[c];
}
