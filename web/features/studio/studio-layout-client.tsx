"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { StudioSidebar } from "@/features/studio/components/studio-sidebar";
import { resolveStudioZone } from "@/features/studio/lib/studio-zone";
import { getStudioRepository } from "@/features/studio/repository";
import { StudioSubnav } from "@/features/studio/studio-subnav";
import { useAuth } from "@/features/auth/use-auth";

export function StudioLayoutClient({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const zone = resolveStudioZone(pathname);
  const { user } = useAuth();
  const studio = getStudioRepository();
  const notice = studio.getShellNotice();
  const subtitle = studio.getShellSubtitle();

  const displayName = user?.email?.split("@")[0] ?? "Creator";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="studio-shell" data-studio-zone={zone}>

      <header className="studio-masthead">
        <div className="studio-masthead-inner">
          <div className="studio-brand">
            <div className="studio-brand-icon studio-brand-icon--outline">STD</div>
            <div className="studio-brand-text">
              <span className="studio-brand-label">Creator Workspace</span>
              <span className="studio-brand-name">Studio</span>
            </div>
          </div>

          <div className="studio-masthead-meta">
            <span className="studio-masthead-sub">{subtitle}</span>
          </div>

          <div className="studio-header-right">
            <Link href="/studio/live" className="studio-hbtn studio-hbtn--live">
              Canlı Yayın
            </Link>
            <Link href="/upload" className="studio-hbtn studio-hbtn--accent">
              Yeni İçerik
            </Link>
            <Link href="/hub/profile" className="studio-profile-mini">
              <div className="studio-avatar studio-avatar--outline">{initials}</div>
              <span className="studio-profile-name">{displayName}</span>
            </Link>
          </div>
        </div>

        {notice ? <div className="studio-notice">{notice}</div> : null}
        <StudioSubnav />
      </header>

      <div className="studio-body">
        <StudioSidebar />
        <main className="studio-main">
          <div className="studio-page">{children}</div>
        </main>
      </div>
    </div>
  );
}
