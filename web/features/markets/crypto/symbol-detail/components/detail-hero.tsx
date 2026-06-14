"use client";

import Link from "next/link";
import { useCallback } from "react";

import { DetailSparkline } from "@/features/markets/crypto/symbol-detail/components/detail-sparkline";
import { DetailSymbolIcon } from "@/features/markets/crypto/symbol-detail/components/detail-symbol-icon";
import {
  IconBell,
  IconBolt,
  IconPlus,
  IconPortfolio,
  IconStar,
  IconStarFilled,
} from "@/features/markets/crypto/symbol-detail/components/detail-icons";
import { useDetailLiveQuote } from "@/features/markets/crypto/symbol-detail/hooks/use-detail-live-quote";
import { fmtPriceUsd, fmtSignedPct } from "@/features/markets/crypto/symbol-detail/lib/format";
import { marketAssetSignalsPath, marketsCategoryPath } from "@/features/markets/markets-routes";
import type { AssetIntelligenceBundle } from "@/features/markets/types/asset-intelligence";
import type { MarketAssetView } from "@/features/markets/types";

type Props = {
  bundle: AssetIntelligenceBundle;
  liveAsset?: MarketAssetView | null;
  watched: boolean;
  inPortfolio: boolean;
  alertCount?: number;
  onToggleWatch: () => void;
  onTogglePortfolio: () => void;
  onOpenAlerts: () => void;
};

export function DetailHero({
  bundle,
  liveAsset,
  watched,
  inPortfolio,
  alertCount = 0,
  onToggleWatch,
  onTogglePortfolio,
  onOpenAlerts,
}: Props) {
  const { asset, categoryLabel, session } = bundle;
  const sym = asset.symbol.trim().toUpperCase();
  const { price, change, spark, flash, isUp } = useDetailLiveQuote(bundle, liveAsset);

  const sparkSeries = spark?.length ? spark : [price * 0.992, price * 0.996, price * 0.994, price];

  const share = useCallback(async () => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/markets/${encodeURIComponent(asset.symbol)}`
        : "";
    const title = `${sym} · Marketly`;
    try {
      if (navigator.share) await navigator.share({ title, text: title, url });
      else if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(url);
    } catch {
      /* ignore */
    }
  }, [asset.symbol, sym]);

  return (
    <header className={["cdr-hero", isUp ? "cdr-hero--up" : "cdr-hero--down"].join(" ")}>
      <div className="cdr-hero__ambient" aria-hidden>
        <div className="cdr-hero__void" />
        <div className="cdr-hero__stars" />
        <div className="cdr-hero__nebula" />
      </div>

      <span className="cdr-hero__rail" aria-hidden />

      <nav className="cdr-hero__crumb" aria-label="Konum">
        <Link href={marketsCategoryPath("crypto")}>Kripto</Link>
        <span className="cdr-hero__crumb-sep">/</span>
        <span>
          {asset.name} ({sym})
        </span>
      </nav>

      <div className="cdr-hero__body">
        <div className="cdr-hero__identity">
          <div className="cdr-hero__icon">
            <DetailSymbolIcon symbol={sym} size={52} plain />
          </div>

          <div className="cdr-hero__copy">
            <div className="cdr-hero__kicker">
              <span className="cdr-badge cdr-badge--cat-crypto">{categoryLabel || "Kripto"}</span>
              <span className="cdr-hero__kicker-sep" aria-hidden>
                ·
              </span>
              <span className="cdr-hero__kicker-live">{session.headline}</span>
            </div>

            <div className="cdr-hero__title-row">
              <h1 className="cdr-hero__symbol">{sym}</h1>
              <span className="cdr-hero__name">{asset.name}</span>
              <button
                type="button"
                className={["cdr-hero__star", watched && "cdr-hero__star--active"].filter(Boolean).join(" ")}
                onClick={onToggleWatch}
                aria-label={watched ? "Takipten çıkar" : "Favorilere ekle"}
                aria-pressed={watched}
              >
                {watched ? <IconStarFilled size={16} /> : <IconStar size={16} />}
              </button>
            </div>

            {session.detail ? <p className="cdr-hero__session-detail">{session.detail}</p> : null}

            <div className="cdr-hero__meta">
              <span className="cdr-badge cdr-badge--live">
                <span className="cdr-hero__live-dot" aria-hidden />
                CANLI
              </span>
              <span className="cdr-hero__meta-tag">{categoryLabel || "Kripto"}</span>
            </div>
          </div>
        </div>

        <aside className="cdr-hero__quote">
          <div className="cdr-hero__quote-head">
            <span className="cdr-hero__quote-tag">
              <span className="cdr-hero__quote-dot" aria-hidden />
              Spot
            </span>
            <span className="cdr-hero__quote-ts">Anlık</span>
          </div>

          <div
            className={[
              "cdr-hero__price",
              flash === "up" && "cdr-hero__price--flash-up",
              flash === "down" && "cdr-hero__price--flash-down",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {fmtPriceUsd(price)}
          </div>

          <div className="cdr-hero__quote-meta">
            <span className={["cdr-hero__change-pill", isUp ? "cdr-hero__change-pill--up" : "cdr-hero__change-pill--down"].join(" ")}>
              {fmtSignedPct(change)}
              <span className="cdr-hero__change-pill-label">24s</span>
            </span>
          </div>

          <div className="cdr-hero__spark">
            <DetailSparkline series={sparkSeries} width={200} height={48} />
          </div>
        </aside>
      </div>

      <div className="cdr-hero__actions">
        <Link href={marketAssetSignalsPath(sym)} className="cdr-btn cdr-btn--primary">
          <IconBolt />
          Sinyaller
        </Link>
        <button
          type="button"
          className={["cdr-btn", "cdr-btn--ghost", watched && "cdr-btn--active"].filter(Boolean).join(" ")}
          onClick={onToggleWatch}
          aria-pressed={watched}
        >
          <IconPlus />
          {watched ? "Takipte" : "Takip Et"}
        </button>
        <button type="button" className="cdr-btn cdr-btn--ghost" onClick={onOpenAlerts}>
          <IconBell />
          Alarm{alertCount > 0 ? ` (${alertCount})` : ""}
        </button>
        <button
          type="button"
          className={["cdr-btn", "cdr-btn--ghost", inPortfolio && "cdr-btn--active"].filter(Boolean).join(" ")}
          onClick={onTogglePortfolio}
          aria-pressed={inPortfolio}
        >
          <IconPortfolio />
          {inPortfolio ? "Portföyde" : "Portföye Ekle"}
        </button>
        <button type="button" className="cdr-btn cdr-btn--ghost cdr-btn--quiet" onClick={() => void share()}>
          Paylaş
        </button>
      </div>
    </header>
  );
}
