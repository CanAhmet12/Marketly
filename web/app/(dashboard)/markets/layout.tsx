import type { ReactNode } from "react";

import "@/styles/route-groups/markets.css";

/** Piyasalar — global sistem font yığını (`globals.css` / `--font-sans`). */
export default function MarketsLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-0">{children}</div>;
}
