"use client";

import { cn } from "@/lib/cn";

type Props = {
  position: number;
  progress: number;
  className?: string;
};

export function SignalDetailPriceTape({ position, progress, className }: Props) {
  return (
    <div className={cn("sdm-price-tape", className)}>
      <div className="sdm-price-tape__head">
        <span className="sdm-price-tape__title">Fiyat konumu</span>
        <span className="sdm-price-tape__pct tabular-nums">Hedefe %{progress}</span>
      </div>
      <div className="sdm-price-tape__track" aria-hidden>
        <span className="sdm-price-tape__pin sdm-price-tape__pin--stop" />
        <span className="sdm-price-tape__pin sdm-price-tape__pin--entry" />
        <span className="sdm-price-tape__pin sdm-price-tape__pin--target" />
        <span className="sdm-price-tape__fill" style={{ width: `${progress}%` }} />
        <span className="sdm-price-tape__marker" style={{ left: `${position}%` }} />
      </div>
      <div className="sdm-price-tape__labels" aria-hidden>
        <span>Stop</span>
        <span>Giriş</span>
        <span>Hedef</span>
      </div>
    </div>
  );
}
