"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { getStudioRepository } from "@/features/studio/repository";
import { StudioSubnav } from "@/features/studio/studio-subnav";
import { useAuth } from "@/features/auth/use-auth";
import { useStudioOwnerId } from "@/features/studio/use-studio-owner-id";

export function StudioLayoutClient({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const ownerId = useStudioOwnerId(user);
  const studio  = getStudioRepository();
  const notice  = studio.getShellNotice();

  const displayName = user?.email?.split("@")[0] ?? "Creator";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="studio-shell" style={{ minHeight: "100vh" }}>

      {/* Header */}
      <div className="studio-header">
        <div className="studio-header-inner">

          {/* Sol: Marka */}
          <div className="studio-brand">
            <div className="studio-brand-icon" style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "var(--st-text)",
              fontFamily: "var(--font-mono, monospace)",
              fontSize: 12,
              letterSpacing: "0.08em",
            }}>
              STD
            </div>
            <div className="studio-brand-text">
              <span className="studio-brand-label">Creator Workspace</span>
              <span className="studio-brand-name">Studio</span>
            </div>
          </div>

          {/* Sağ: Aksiyonlar + Profil */}
          <div className="studio-header-right">
            <Link href="/studio/live" className="studio-hbtn studio-hbtn--live">
              Canlı Yayın
            </Link>
            <Link href="/studio/drafts" className="studio-hbtn studio-hbtn--accent">
              Yeni İçerik
            </Link>
            <div className="studio-profile-mini">
              <div className="studio-avatar" style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "var(--st-text-2)",
                fontSize: 10,
                fontFamily: "var(--font-mono, monospace)",
                letterSpacing: "0.04em",
              }}>
                {initials}
              </div>
              <span className="studio-profile-name">{displayName}</span>
            </div>
          </div>
        </div>

        {/* Notice */}
        {notice && <div className="studio-notice">{notice}</div>}

        {/* Subnav */}
        <StudioSubnav />
      </div>

      {/* İçerik */}
      <div className="studio-page">
        {children}
      </div>

    </div>
  );
}
