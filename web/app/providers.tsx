"use client";

import { AlgoExperimentBootstrap } from "@/components/providers/algo-experiment-bootstrap";
import { AuthProvider } from "@/features/auth/auth-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <AlgoExperimentBootstrap />
        {children}
      </AuthProvider>
    </QueryProvider>
  );
}
