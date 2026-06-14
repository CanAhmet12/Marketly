import type { ReactNode } from "react";

/** `/search` → `/results` redirect alias; CSS yalnızca results layout'ta. */
export default function SearchLayout({ children }: { children: ReactNode }) {
  return children;
}
