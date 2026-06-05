"use client";

import { useEffect } from "react";

import { logClientError } from "@/lib/errors/client-error-log";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
  /** global-error kökünde sınırlı stil için */
  variant?: "card" | "bare";
};

export function AppErrorView({ error, reset, variant = "card" }: Props) {
  useEffect(() => {
    logClientError("route-error", error, { digest: error.digest });
  }, [error]);

  const inner = (
    <>
      <h1 className="text-lg font-semibold text-[var(--color-text)]">Bir şeyler ters gitti</h1>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        Sayfayı yeniden yüklemeyi veya bir süre sonra tekrar denemeyi deneyin.
      </p>
      {process.env.NODE_ENV === "development" ? (
        <pre className="mt-4 max-h-40 overflow-auto rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] p-3 text-left text-xs text-red-800">
          {error.message}
          {error.digest ? `\n(digest: ${error.digest})` : ""}
        </pre>
      ) : null}
      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 rounded-full bg-[var(--color-primary)] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-primary-dark)]"
      >
        Yeniden dene
      </button>
    </>
  );

  if (variant === "bare") {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center bg-[#fafafa] px-4 py-12 text-center font-sans text-[#171717]">
        {inner}
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[40vh] max-w-md flex-col items-center justify-center px-4 py-12 text-center">
      <div className="w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-card)]">
        {inner}
      </div>
    </div>
  );
}
