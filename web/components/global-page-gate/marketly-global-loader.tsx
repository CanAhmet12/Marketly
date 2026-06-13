"use client";

import Image from "next/image";
import { cn } from "@/lib/cn";

type Props = {
  exiting?: boolean;
  /** fixed = tam ekran overlay · inline = route loading fallback */
  mode?: "fixed" | "inline";
};

export function MarketlyGlobalLoader({ exiting = false, mode = "fixed" }: Props) {
  const fixed = mode === "fixed";

  return (
    <div
      className={cn(
        "mlg-overlay",
        fixed && "mlg-overlay--fixed",
        !fixed && "mlg-overlay--inline",
        exiting && "mlg-overlay--exit",
      )}
      role="status"
      aria-live="polite"
      aria-busy={!exiting}
      aria-label="Marketly yükleniyor"
    >
      <div className="mlg-stage">
        <div className="mlg-hero" aria-hidden>
          <div className="mlg-orbit mlg-orbit--outer">
            <span className="mlg-ring mlg-ring--outer" />
          </div>
          <div className="mlg-orbit mlg-orbit--inner">
            <span className="mlg-ring mlg-ring--inner" />
          </div>
          <div className="mlg-logo-wrap">
            <Image
              src="/logo.png"
              alt=""
              width={56}
              height={56}
              priority
              className="mlg-logo"
            />
          </div>
        </div>

        <p className="mlg-wordmark">
          Market<span className="mlg-wordmark-accent">ly</span>
        </p>

        <div className="mlg-progress" aria-hidden>
          <div className="mlg-progress-bar" />
        </div>
      </div>
    </div>
  );
}
