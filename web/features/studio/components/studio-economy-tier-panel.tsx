"use client";

import Link from "next/link";

import type { StudioEconomyTierRow } from "@/features/studio/repository/types";

type Props = {
  tiers: StudioEconomyTierRow[];
  manageHref?: string | null;
};

export function StudioEconomyTierPanel({ tiers, manageHref }: Props) {
  return (
    <div className="st-block">
      <div className="st-block-header">
        <div className="st-block-title">Üyelik Katmanları</div>
        {manageHref ? (
          <Link href={manageHref} className="st-block-link">
            Yönet →
          </Link>
        ) : null}
      </div>
      {tiers.length === 0 ? (
        <div className="st-analytics-empty">Henüz tanımlı üyelik katmanı yok.</div>
      ) : (
        <div className="st-economy-tier-list">
          {tiers.map((tier) => (
            <div key={tier.key} className="st-economy-tier-row">
              <div className="st-economy-tier-main">
                <div className="st-economy-tier-label">{tier.label}</div>
                <div className="st-economy-tier-line">{tier.included_line}</div>
                <div className="st-economy-tier-meta">
                  {tier.visibility_label}
                  {tier.price_placeholder ? ` · ${tier.price_placeholder}` : ""}
                </div>
              </div>
              {tier.href_manage ? (
                <Link href={tier.href_manage} className="st-list-action">
                  Düzenle
                </Link>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
