"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { marketsCategoryPath } from "@/features/markets/markets-routes";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { runViewTransition } from "@/lib/navigation/view-transition";

const DETAIL_SHORTCUTS = [
  { href: (sym: string) => `/signals?asset=${encodeURIComponent(sym)}`, label: "Sinyaller" },
  { href: (sym: string) => `/discover?q=${encodeURIComponent(sym)}`, label: "Keşfet" },
  { href: () => "/watchlist", label: "İzleme" },
  { href: () => "/market-news", label: "Haberler" },
] as const;

type Props = {
  symbol: string;
  name?: string;
};

/** Bölüm 1 — detay sayfası üst kabuğu: breadcrumb + ekosistem kısayolları */
export function CryptoDetailPageChrome({ symbol, name }: Props) {
  const router = useRouter();
  const reduceMotion = usePrefersReducedMotion();

  return (
    <header className="cd-page-chrome" role="banner">
      <nav className="cd-breadcrumb" aria-label="Kripto detay konumu">
        <button
          type="button"
          className="cd-breadcrumb-back"
          onClick={() =>
            runViewTransition(() => router.push(marketsCategoryPath("crypto")), { disabled: reduceMotion })
          }
        >
          <span className="cd-breadcrumb-back-icon" aria-hidden>
            ←
          </span>
          <span>Kripto Piyasalar</span>
        </button>

        <span className="cd-breadcrumb-sep cd-breadcrumb-sep--trail" aria-hidden>
          /
        </span>

        <ol className="cd-breadcrumb-trail">
          <li className="cd-breadcrumb-trail-item">
            <span className="cd-breadcrumb-symbol">{symbol}</span>
          </li>
          {name ? (
            <li className="cd-breadcrumb-trail-item cd-breadcrumb-trail-item--name">
              <span className="cd-breadcrumb-sep cd-breadcrumb-sep--muted" aria-hidden>
                ·
              </span>
              <span className="cd-breadcrumb-name">{name}</span>
            </li>
          ) : null}
          <li className="cd-breadcrumb-trail-item">
            <span className="cd-breadcrumb-sep cd-breadcrumb-sep--muted" aria-hidden>
              ·
            </span>
            <span className="cd-breadcrumb-current">Detay</span>
          </li>
        </ol>
      </nav>

      <nav className="cd-page-chrome-nav" aria-label="Detay kısayolları">
        {DETAIL_SHORTCUTS.map((item) => (
          <Link
            key={item.label}
            href={item.href(symbol)}
            className="cd-page-chrome-nav-link"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
