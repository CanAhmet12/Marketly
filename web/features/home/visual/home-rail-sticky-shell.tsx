import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

/** Sağ rail — statik, sayfayla birlikte kayar (sticky yok). */
export function HomeRailStickyShell({ children }: Props) {
  return (
    <aside className="hv-ref__rail-col hv-ref__rail-col--ambient" aria-label="Bağlam">
      <div className="hv-ref__rail-bridge">{children}</div>
    </aside>
  );
}
