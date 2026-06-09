"use client";

import { Suspense, useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { usePathname } from "next/navigation";

import { Sidebar, SidebarBrand, SidebarToggleIcon } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { useChromeScrollVisibility } from "@/hooks/use-chrome-scroll-visibility";
import { MockModeBadge } from "@/mock/mock-mode-badge";
import { MutationToastHost } from "@/components/ui/mutation-toast-host";
import { ScrollDownHint } from "@/components/layout/scroll-down-hint";
import { cn } from "@/lib/cn";

const SIDEBAR_COLLAPSED_KEY = "marketly-web-sidebar-collapsed";

/** Kanalım — kendi shell'i; global sidebar / topbar yok */
function isHubImmersive(pathname: string): boolean {
  return pathname === "/hub" || pathname.startsWith("/hub/");
}

type Props = {
  children: ReactNode;
};

function SidebarFallback() {
  return <div className="h-full min-h-[200px] w-full bg-[var(--color-bg)]" aria-hidden />;
}

export function AppShell({ children }: Props) {
  const pathname = usePathname() ?? "";
  const hubImmersive = isHubImmersive(pathname);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const chromeVisible = useChromeScrollVisibility();

  useEffect(() => {
    queueMicrotask(() => {
      try {
        if (localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1") setSidebarCollapsed(true);
      } catch {
        /* ignore */
      }
    });
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, sidebarCollapsed ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [sidebarCollapsed]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  /** Portal edilen dismiss katmanları `:root` üzerinden gutter okur */
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--app-md-main-gutter",
      hubImmersive ? "0px" : sidebarCollapsed ? "var(--sidebar-rail-width)" : "var(--sidebar-width)",
    );
  }, [sidebarCollapsed, hubImmersive]);

  const shellStyle = {
    ...(chromeVisible ? {} : { "--chrome-top-offset": "0px" }),
    "--app-md-main-gutter": hubImmersive
      ? "0px"
      : sidebarCollapsed
        ? "var(--sidebar-rail-width)"
        : "var(--sidebar-width)",
  } as CSSProperties;

  if (hubImmersive) {
    return (
      <div className="min-h-dvh bg-[var(--color-bg)] text-[var(--color-text)]" style={shellStyle}>
        {children}
        <MockModeBadge />
        <MutationToastHost />
      </div>
    );
  }

  return (
    <div
      className="flex min-h-dvh flex-col overflow-x-hidden bg-[var(--color-bg)] text-[var(--color-text)]"
      style={shellStyle}
    >
      {/* Sol sütun: mobilde üst çubuğun altından açılan çekmece; md+ viewport boyu tek şerit (üst çubuk bunu örtmez) */}
      <aside
        className={cn(
          "fixed left-0 z-50 w-[var(--sidebar-width)] max-w-[85vw] overflow-hidden bg-[var(--color-sidebar)] transition-[transform,width,opacity] duration-200 ease-out motion-reduce:transition-none",
          "top-[var(--chrome-top-offset)] h-[calc(100dvh-var(--chrome-top-offset))]",
          "md:top-0 md:z-20 md:h-svh md:max-w-none md:translate-x-0 md:border-r md:border-[var(--color-sidebar-edge)]",
          sidebarCollapsed && "md:w-0 md:min-w-0 md:border-transparent md:opacity-0 md:pointer-events-none",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="flex h-full min-h-0 flex-col bg-[var(--color-sidebar)]">
          <SidebarBrand
            onNavigate={() => setMobileOpen(false)}
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={() => setSidebarCollapsed((c) => !c)}
          />
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <Suspense fallback={<SidebarFallback />}>
              <Sidebar onNavigate={() => setMobileOpen(false)} />
            </Suspense>
          </div>
        </div>
      </aside>

      <TopBar
        chromeVisible={chromeVisible}
        mdSidebarGutter={sidebarCollapsed ? "rail" : "sidebar"}
        onOpenMenu={() => setMobileOpen(true)}
      />

      <div
        className={cn(
          "relative flex min-h-0 flex-1 flex-col",
          sidebarCollapsed ? "md:pl-[var(--sidebar-rail-width)]" : "md:pl-[var(--sidebar-width)]",
        )}
      >
        <div
          className="shrink-0 motion-safe:transition-[height] motion-safe:duration-200 motion-safe:ease-out motion-reduce:transition-none"
          style={{ height: chromeVisible ? "var(--chrome-top-offset)" : 0 }}
          aria-hidden
        />
        <button
          type="button"
          className={cn(
            "fixed inset-0 z-30 bg-black/40 transition-opacity md:hidden",
            mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
          )}
          aria-label="Menüyü kapat"
          onClick={() => setMobileOpen(false)}
        />
        <main className="marketly-main-enter min-w-0 flex-1 bg-[var(--color-bg)]">{children}</main>
      </div>

      {/* Daraltılmış md: sol şerit — üst çubuk yüksekliğinde aç ikonu (chrome ile konumu kaymaz) */}
      {sidebarCollapsed ? (
        <div
          className="pointer-events-auto fixed left-0 top-0 z-[28] hidden h-svh w-[var(--sidebar-rail-width)] flex-col border-r border-[var(--color-sidebar-edge)] bg-[var(--color-sidebar)] md:flex"
          role="complementary"
          aria-label="Yan menü şeridi"
        >
          <div className="flex h-[var(--topbar-height)] shrink-0 items-center justify-center border-b border-[var(--color-sidebar-edge)]">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-nav-row-hover)] hover:text-[var(--color-text)]"
              aria-label="Yan menüyü aç"
              onClick={() => setSidebarCollapsed(false)}
            >
              <SidebarToggleIcon collapsed={true} />
            </button>
          </div>
        </div>
      ) : null}

      <MockModeBadge />
      <MutationToastHost />
      <ScrollDownHint />
    </div>
  );
}
