"use client";

import { isMockDataEnabled } from "@/mock/config";

/** Sağ alt — üst bar kalabalığı yok; üretim ekranı hissi */
export function MockModeBadge() {
  if (!isMockDataEnabled()) return null;
  return (
    <div
      className="pointer-events-none fixed bottom-3 right-3 z-[100] rounded-md border border-transparent bg-black/50 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-white/80 backdrop-blur-md"
      aria-hidden
    >
      Demo
    </div>
  );
}
