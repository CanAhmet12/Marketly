"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { marketsCategoryPath } from "@/features/markets/markets-routes";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { runViewTransition } from "@/lib/navigation/view-transition";

type Props = {
  symbol: string;
  name?: string;
};

export function CryptoDetailBreadcrumb({ symbol, name }: Props) {
  const router = useRouter();
  const reduceMotion = usePrefersReducedMotion();

  return (
    <nav className="cd-breadcrumb" aria-label="Kripto detay konumu">
      <button
        type="button"
        className="cd-breadcrumb-back"
        onClick={() =>
          runViewTransition(() => router.push(marketsCategoryPath("crypto")), { disabled: reduceMotion })
        }
      >
        ← Kripto Piyasalar
      </button>
      <span className="cd-breadcrumb-sep" aria-hidden>
        /
      </span>
      <span className="cd-breadcrumb-symbol">{symbol}</span>
      {name ? (
        <>
          <span className="cd-breadcrumb-sep cd-breadcrumb-sep--muted" aria-hidden>
            ·
          </span>
          <span className="cd-breadcrumb-name">{name}</span>
        </>
      ) : null}
      <span className="cd-breadcrumb-sep cd-breadcrumb-sep--muted" aria-hidden>
        ·
      </span>
      <span className="cd-breadcrumb-current">Detay</span>
      <span className="cd-breadcrumb-sep cd-breadcrumb-sep--muted" aria-hidden>
        ·
      </span>
      <Link href="/discover" className="cd-breadcrumb-link">
        Keşfet
      </Link>
    </nav>
  );
}
