"use client";

import Image from "next/image";
import Link from "next/link";

import type { PrivateCircleDetailPayload } from "@/features/close-friends/domain/types";

type Props = { detail: PrivateCircleDetailPayload };

export function CircleDetailHeader({ detail }: Props) {
  const { circle } = detail;
  return (
    <header className="cf-detail-header">
      <div className="cf-detail-identity">
        <div className="cf-detail-avatar">
          {circle.avatar_url ? (
            <Image src={circle.avatar_url} alt={circle.creator_display} fill className="object-cover" sizes="56px" />
          ) : (
            <span className="cf-circle-avatar-fallback">{circle.creator_display.slice(0, 1).toUpperCase()}</span>
          )}
        </div>
        <div className="min-w-0">
          <p className="cf-detail-kicker">Özel daire</p>
          <h1 className="cf-detail-title">{circle.title}</h1>
          <p className="cf-detail-handle">{circle.creator_handle}</p>
          <div className="cf-tier-chips" style={{ marginTop: 8 }}>
            <span className="cf-tier-chip">{circle.access.label}</span>
            {circle.access.locked ? <span className="cf-circle-badge">Davetli</span> : null}
          </div>
        </div>
      </div>
      <div className="cf-detail-actions">
        <Link href={circle.subscription_href} className="cf-detail-btn">
          Üyelik
        </Link>
        <Link href={circle.rooms_href} className="cf-detail-btn">
          Odalar
        </Link>
        <Link href={circle.signals_href} className="cf-detail-btn cf-detail-btn--primary">
          Sinyaller
        </Link>
      </div>
    </header>
  );
}
