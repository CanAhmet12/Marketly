"use client";

import { Suspense, useEffect, type ReactNode } from "react";

import { MarketlyGlobalLoader } from "@/components/global-page-gate/marketly-global-loader";
import { useGlobalPageReady } from "@/components/global-page-gate/use-global-page-ready";
import { cn } from "@/lib/cn";
import { nudgeLazyLoadMedia } from "@/lib/media/discover-media-loading";

import "@/styles/global-page-gate.css";

function GlobalPageGateInner({ children }: { children: ReactNode }) {
  const { showLoader, exiting, lockScroll, phase } = useGlobalPageReady();

  useEffect(() => {
    document.body.classList.toggle("mlg-body-locked", lockScroll);
    return () => document.body.classList.remove("mlg-body-locked");
  }, [lockScroll]);

  useEffect(() => {
    if (phase !== "idle") return;
    nudgeLazyLoadMedia();
  }, [phase]);

  return (
    <>
      <div
        className={cn("mlg-content", showLoader && !exiting && "mlg-content--gated")}
        aria-hidden={showLoader && !exiting ? true : undefined}
      >
        {children}
      </div>
      {showLoader ? <MarketlyGlobalLoader exiting={exiting} mode="fixed" /> : null}
    </>
  );
}

/** Auth + gerçek veri beklerken premium logo overlay — cache geçişlerinde sessiz */
export function GlobalPageGate({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <GlobalPageGateInner>{children}</GlobalPageGateInner>
    </Suspense>
  );
}
