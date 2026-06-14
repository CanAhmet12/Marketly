"use client";

import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export function SearchPageShell({ children }: Props) {
  return (
    <div className="srch-canvas ms-page-wrapper--no-top">
      <div className="ms-container-wide">
        <div className="srch-inner" role="main">
          {children}
        </div>
      </div>
    </div>
  );
}
