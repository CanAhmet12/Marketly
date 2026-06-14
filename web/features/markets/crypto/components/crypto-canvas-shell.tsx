"use client";

import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/cn";

type Props = {
  children: ReactNode;
  /** Sembol accent — BTC gold, ETH violet vb. */
  accentColor?: string;
  className?: string;
};

/** Kripto piyasa + detay — ortak `crypto-canvas` kabuğu */
export function CryptoCanvasShell({ children, accentColor, className }: Props) {
  const style = accentColor
    ? ({
        "--cc-symbol-accent": accentColor,
        "--cc-symbol-accent-soft": `color-mix(in srgb, ${accentColor} 12%, transparent)`,
        "--cc-symbol-accent-glow": `color-mix(in srgb, ${accentColor} 22%, transparent)`,
        "--cc-symbol-accent-line": accentColor,
      } as CSSProperties)
    : undefined;

  return (
    <div
      className={cn(
        "crypto-canvas crypto-canvas--symbol min-h-screen w-full overflow-x-hidden",
        className,
      )}
      style={style}
    >
      <div className="ms-container-markets ms-page-wrapper cc-symbol-page-wrap relative z-[1] flex min-w-0 flex-col gap-0 pb-16 pt-0">
        {children}
      </div>
    </div>
  );
}
