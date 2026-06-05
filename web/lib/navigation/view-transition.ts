import type { CSSProperties } from "react";

export type MarketVtPart = "symbol" | "price" | "spark";

/** P10-001 — liste ↔ detay shared element adı (CSS ident güvenli) */
export function marketVtName(symbol: string, part: MarketVtPart): string {
  const slug = symbol
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `mvt-${part}-${slug || "unknown"}`;
}

export function marketVtStyle(symbol: string, part: MarketVtPart): CSSProperties {
  return { viewTransitionName: marketVtName(symbol, part) };
}

export function isViewTransitionSupported(): boolean {
  return typeof document !== "undefined" && typeof document.startViewTransition === "function";
}

/** SPA geçişi — destek yoksa veya reduce-motion ise doğrudan callback */
export function runViewTransition(
  update: () => void | Promise<void>,
  options?: { disabled?: boolean },
): void {
  if (options?.disabled || !isViewTransitionSupported()) {
    void update();
    return;
  }
  document.startViewTransition(() => update());
}
