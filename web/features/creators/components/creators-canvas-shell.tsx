"use client";

import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Başlık / ticker chrome yok — doğrudan deck + nav */
  headless?: boolean;
};

/** Creator Network Canvas — scoped surface + ambient */
export function CreatorsCanvasShell({ children, headless = false }: Props) {
  return (
    <div
      className={
        headless
          ? "crt-canvas crt-canvas--headless min-h-screen w-full overflow-x-hidden"
          : "crt-canvas min-h-screen w-full overflow-x-hidden"
      }
    >
      <div className="crt-canvas__ambient" aria-hidden>
        <span className="crt-canvas__orb crt-canvas__orb--mint" />
        <span className="crt-canvas__orb crt-canvas__orb--violet" />
        <span className="crt-canvas__orb crt-canvas__orb--amber" />
        <span className="crt-canvas__grid" />
      </div>

      <div className="crt-canvas__inner ms-page-wrapper ms-page-wrapper--compact">{children}</div>
    </div>
  );
}
