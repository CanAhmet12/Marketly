"use client";

import { useIsFetching } from "@tanstack/react-query";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { useAuth } from "@/features/auth/use-auth";
import { GLOBAL_PAGE_GATE, isBlockingQueryFetch } from "@/lib/async/global-page-ready";
import {
  getPendingPageLoadCount,
  subscribePageLoadRegistry,
} from "@/lib/async/page-load-registry";

export type GlobalPageGatePhase = "idle" | "loading" | "exiting";

export function useGlobalPageReady() {
  const pathname = usePathname() ?? "";
  const searchParams = useSearchParams();
  const routeKey = `${pathname}?${searchParams.toString()}`;

  const { isInitialized } = useAuth();
  const blockingFetches = useIsFetching({ predicate: (q) => isBlockingQueryFetch(q) });
  const pendingAsyncLoads = useSyncExternalStore(
    subscribePageLoadRegistry,
    getPendingPageLoadCount,
    () => 0,
  );

  const [phase, setPhase] = useState<GlobalPageGatePhase>("idle");
  const [loaderVisible, setLoaderVisible] = useState(false);
  const [queriesReady, setQueriesReady] = useState(false);
  const [confirmedBlocking, setConfirmedBlocking] = useState(false);

  const routeKeyRef = useRef(routeKey);
  const openedAtRef = useRef(0);

  const isDataBlocking = blockingFetches > 0 || pendingAsyncLoads > 0;
  const authBlocking = !isInitialized;

  useEffect(() => {
    if (routeKeyRef.current === routeKey) return;
    routeKeyRef.current = routeKey;
    setQueriesReady(false);
    setConfirmedBlocking(false);
  }, [routeKey]);

  useEffect(() => {
    setQueriesReady(false);
    setConfirmedBlocking(false);
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setQueriesReady(true));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [routeKey]);

  useEffect(() => {
    if (!isDataBlocking) {
      setConfirmedBlocking(false);
      return;
    }
    const id = window.setTimeout(() => {
      if (blockingFetches > 0 || pendingAsyncLoads > 0) {
        setConfirmedBlocking(true);
      }
    }, GLOBAL_PAGE_GATE.blockConfirmMs);
    return () => window.clearTimeout(id);
  }, [isDataBlocking, blockingFetches, pendingAsyncLoads, routeKey]);

  useEffect(() => {
    const shouldGate = authBlocking || (queriesReady && confirmedBlocking);
    if (!shouldGate) return;

    setPhase((current) => {
      if (current === "loading" || current === "exiting") return current;
      openedAtRef.current = Date.now();
      return "loading";
    });
  }, [authBlocking, confirmedBlocking, queriesReady]);

  useEffect(() => {
    if (phase !== "loading") {
      setLoaderVisible(false);
      return;
    }
    if (authBlocking) {
      setLoaderVisible(true);
      return;
    }
    const id = window.setTimeout(() => setLoaderVisible(true), 48);
    return () => window.clearTimeout(id);
  }, [phase, authBlocking]);

  useEffect(() => {
    if (phase !== "loading") return;
    const id = window.setTimeout(() => setPhase("exiting"), GLOBAL_PAGE_GATE.maxWaitMs);
    return () => window.clearTimeout(id);
  }, [phase, routeKey]);

  useEffect(() => {
    if (phase !== "loading") return;
    if (authBlocking) return;
    if (!queriesReady) return;
    if (isDataBlocking) return;

    const elapsed = Date.now() - openedAtRef.current;

    if (elapsed < GLOBAL_PAGE_GATE.flashSkipMs) {
      setPhase("idle");
      return;
    }

    const minRemain = Math.max(0, GLOBAL_PAGE_GATE.minVisibleMs - elapsed);

    let settleId = 0;
    const revealId = window.setTimeout(() => {
      settleId = window.setTimeout(() => setPhase("exiting"), GLOBAL_PAGE_GATE.settleMs);
    }, minRemain);

    return () => {
      window.clearTimeout(revealId);
      window.clearTimeout(settleId);
    };
  }, [phase, authBlocking, queriesReady, isDataBlocking, routeKey]);

  useEffect(() => {
    if (phase !== "exiting") return;
    const id = window.setTimeout(() => setPhase("idle"), GLOBAL_PAGE_GATE.exitAnimMs);
    return () => window.clearTimeout(id);
  }, [phase]);

  const showLoader = (phase === "loading" && loaderVisible) || phase === "exiting";
  const lockScroll = phase === "loading" && loaderVisible;

  return {
    showLoader,
    exiting: phase === "exiting",
    lockScroll,
    phase,
  };
}
