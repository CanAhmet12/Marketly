"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useRef, type ComponentProps, type ReactNode } from "react";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { marketVtStyle, runViewTransition } from "@/lib/navigation/view-transition";

type LinkProps = ComponentProps<typeof Link>;

type Props = Omit<LinkProps, "prefetch"> & {
  symbol: string;
  children: ReactNode;
};

/** P10-001/002 — sembol linki: hover prefetch + View Transition navigasyon */
export function MarketAssetTransitionLink({ href, symbol, children, onClick, onMouseEnter, onFocus, style, ...rest }: Props) {
  const router = useRouter();
  const reduceMotion = usePrefersReducedMotion();
  const warmed = useRef(false);

  const warm = useCallback(() => {
    if (warmed.current) return;
    warmed.current = true;
    const target = typeof href === "string" ? href : href.pathname ?? "";
    if (target) void router.prefetch(target);
  }, [router, href]);

  return (
    <Link
      href={href}
      prefetch={false}
      style={{ ...marketVtStyle(symbol, "symbol"), ...style }}
      onMouseEnter={(e) => {
        warm();
        onMouseEnter?.(e);
      }}
      onFocus={(e) => {
        warm();
        onFocus?.(e);
      }}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        runViewTransition(() => router.push(typeof href === "string" ? href : `${href.pathname ?? ""}${href.search ?? ""}`), {
          disabled: reduceMotion,
        });
      }}
      {...rest}
    >
      {children}
    </Link>
  );
}
