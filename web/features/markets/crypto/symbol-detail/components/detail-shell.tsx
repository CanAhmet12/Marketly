"use client";

import type { ReactNode } from "react";

import { DetailShell as CoreDetailShell } from "@/features/markets/symbol-detail-core/components/detail-shell";
import { symbolAccentColor } from "@/features/markets/crypto/symbol-detail/lib/symbol-visuals";

type Props = {
  children: ReactNode;
  symbol?: string;
};

export function DetailShell({ children, symbol }: Props) {
  const accent = symbol ? symbolAccentColor(symbol) : "#f7931a";
  return <CoreDetailShell accent={accent}>{children}</CoreDetailShell>;
}
