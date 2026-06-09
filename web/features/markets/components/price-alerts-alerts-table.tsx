"use client";

import Link from "next/link";
import { memo } from "react";

import { PrefetchOnHoverLink } from "@/components/ui/prefetch-on-hover-link";
import type { PriceAlertRow } from "@/features/markets/hooks/use-price-alerts-page";
import type { MarketAssetView } from "@/features/markets/types";
import { formatSocialRelativeTime } from "@/features/social/lib/social-format";
import { cn } from "@/lib/cn";

function fmtPrice(n: number): string {
  if (n >= 10000) return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (n >= 1) return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  return n.toLocaleString("en-US", { minimumSignificantDigits: 4, maximumSignificantDigits: 5 });
}

function conditionClass(label: string, condition?: "above" | "below"): string {
  const c = condition ?? (label.includes("≤") ? "below" : "above");
  return c === "below" ? "pa-cond-badge--below" : "pa-cond-badge--above";
}

function conditionLabel(label: string, condition?: "above" | "below"): string {
  const c = condition ?? (label.includes("≤") ? "below" : "above");
  return c === "below" ? "Alt eşik" : "Üst eşik";
}

type RowProps = {
  alert: PriceAlertRow;
  asset?: MarketAssetView;
  removing: boolean;
  onRemove: (alert: PriceAlertRow) => void;
};

const PriceAlertTableRow = memo(function PriceAlertTableRow({
  alert,
  asset,
  removing,
  onRemove,
}: RowProps) {
  const pct = asset?.change_percent ?? 0;

  return (
    <tr>
      <td>
        <div className="pa-sym-cell">
          <PrefetchOnHoverLink href={`/markets/${encodeURIComponent(alert.symbol)}`} className="pa-sym-link">
            <span className="pa-sym-name">{alert.symbol}</span>
          </PrefetchOnHoverLink>
          {asset?.name ? <span className="pa-sym-fullname">{asset.name}</span> : null}
        </div>
      </td>
      <td>
        <span className="pa-alert-label">{alert.label}</span>
      </td>
      <td>
        <span className={cn("pa-cond-badge", conditionClass(alert.label, alert.condition))}>
          {conditionLabel(alert.label, alert.condition)}
        </span>
      </td>
      <td className="pa-td-right">
        <span className="pa-spot-price">{asset ? fmtPrice(asset.price) : "—"}</span>
        {asset ? (
          <span className={cn("pa-spot-pct", pct >= 0 ? "pa-spot-pct--up" : "pa-spot-pct--down")}>
            {pct >= 0 ? "+" : ""}
            {pct.toFixed(2)}%
          </span>
        ) : null}
      </td>
      <td>
        <span className="pa-row-time">{formatSocialRelativeTime(alert.createdAt)}</span>
      </td>
      <td>
        <div className="pa-actions-cell">
          <Link href={`/markets/${encodeURIComponent(alert.symbol)}`} className="pa-action-btn pa-action-btn--market">
            Varlık
          </Link>
          <button
            type="button"
            className="pa-action-btn pa-action-btn--remove"
            disabled={removing}
            aria-label={`${alert.symbol} alarmını kaldır`}
            onClick={() => onRemove(alert)}
          >
            Kaldır
          </button>
        </div>
      </td>
    </tr>
  );
});

type Props = {
  rows: PriceAlertRow[];
  assets: MarketAssetView[];
  removing: boolean;
  onRemove: (alert: PriceAlertRow) => void;
};

export function PriceAlertsAlertsTable({ rows, assets, removing, onRemove }: Props) {
  const sorted = [...rows].sort((a, b) => {
    const sym = a.symbol.localeCompare(b.symbol);
    if (sym !== 0) return sym;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="pa-block">
      <div className="pa-block-header">
        <div className="pa-block-title">
          <span className="pa-block-stripe" />
          Aktif alarmlar
        </div>
        <span className="pa-block-meta">{sorted.length} kayıt</span>
      </div>
      <div className="pa-table-wrap">
        <table className="pa-table">
          <thead>
            <tr>
              <th>Sembol</th>
              <th>Koşul</th>
              <th>Tip</th>
              <th className="right">Spot</th>
              <th>Eklendi</th>
              <th className="right">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((alert) => {
              const asset = assets.find((a) => a.symbol.toUpperCase() === alert.symbol.toUpperCase());
              return (
                <PriceAlertTableRow
                  key={alert.id}
                  alert={alert}
                  asset={asset}
                  removing={removing}
                  onRemove={onRemove}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
