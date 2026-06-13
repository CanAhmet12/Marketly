"use client";

import { Suspense, type ReactNode } from "react";

import { AlgoExperimentBootstrap } from "@/components/providers/algo-experiment-bootstrap";
import { GlobalPageGate } from "@/components/global-page-gate/global-page-gate";
import { AuthProvider } from "@/features/auth/auth-provider";
import { QueryProvider } from "@/components/providers/query-provider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <AlgoExperimentBootstrap />
        <GlobalPageGate>{children}</GlobalPageGate>
      </AuthProvider>
    </QueryProvider>
  );
}
