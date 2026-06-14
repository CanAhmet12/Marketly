"use client";

import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/cn";

type Props = {
  children: ReactNode;
  accent?: string;
  className?: string;
};

export function DetailShell({ children, accent = "#f7931a", className }: Props) {
  const style = {
    "--cdr-accent": accent,
  } as CSSProperties;

  return (
    <div className={cn("cdr-page", className)} style={style}>
      {children}
    </div>
  );
}
