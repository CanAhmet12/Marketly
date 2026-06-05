"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";

import { defaultDiscoverTab, isDiscoverTabId, type DiscoverTabId } from "@/features/feed/discover-feed-filters";
import { DISCOVER_HUB_PATH, DISCOVER_VERTICAL_ROUTES } from "@/features/discover/routes";
import { useAuth } from "@/features/auth/use-auth";
import { PrefetchOnHoverLink } from "@/components/ui/prefetch-on-hover-link";
import { cn } from "@/lib/cn";

type BrandProps = {
  /** Üst çubukta mobil için daha kompakt */
  compact?: boolean;
  className?: string;
  /** Masaüstü: yan menü daraltıldı mı */
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  onNavigate?: () => void;
};

export function SidebarToggleIcon({ collapsed }: { collapsed: boolean }) {
  if (collapsed) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
        <rect x="3" y="5" width="5" height="14" rx="1.25" />
        <path d="M11 12h8M15 8l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <rect x="3" y="5" width="5" height="14" rx="1.25" />
      <path d="M11 12h8M19 8l-4 4 4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Marka — yan menü üstü (masaüstü) veya mobil üst çubuk (kompakt) */
export function SidebarBrand({ compact, className, onNavigate, sidebarCollapsed, onToggleSidebar }: BrandProps) {
  if (compact) {
    const imgClass = "pointer-events-none size-9 shrink-0 object-contain sm:size-10";
    const textClass =
      "font-sans whitespace-nowrap text-[17px] font-bold leading-none tracking-[-0.04em] text-[color:var(--color-logo-wordmark)] sm:text-[18px]";

    return (
      <div className={cn("shrink-0 border-0 bg-transparent", className)}>
        <Link
          href="/"
          onClick={onNavigate}
          className="flex min-w-0 items-center gap-1.5 rounded-lg py-1 ps-0.5 pe-1 outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-0"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- static brand asset */}
          <img src="/logo.png" alt="" width={40} height={40} className={imgClass} aria-hidden />
          <span className={cn("min-w-0 truncate", textClass)}>
            Market<span className="text-[color:var(--color-logo-accent)]">ly</span>
          </span>
        </Link>
      </div>
    );
  }

  const collapsed = Boolean(sidebarCollapsed);

  return (
    <div
      className={cn(
        "shrink-0 border-b border-[color-mix(in_srgb,var(--color-text)_6%,transparent)] bg-[var(--color-sidebar)]",
        className,
      )}
    >
      <div className="flex w-full items-center justify-between gap-2 pb-2 pl-0.5 pr-1 pt-1 md:gap-3 md:pb-2.5 md:pl-1 md:pr-1.5 md:pt-1.5">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex min-w-0 items-center gap-2 rounded-lg py-0.5 outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-0 md:gap-2.5"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- static brand asset */}
          <img
            src="/logo.png"
            alt=""
            width={52}
            height={52}
            className="pointer-events-none size-[52px] shrink-0 object-contain md:size-14 block"
            aria-hidden
          />
          <span className="min-w-0 truncate font-sans text-[19px] font-bold leading-none tracking-[-0.04em] text-[color:var(--color-logo-wordmark)] md:text-[21px]">
            Market<span className="text-[color:var(--color-logo-accent)]">ly</span>
          </span>
        </Link>
        {onToggleSidebar ? (
          <button
            type="button"
            className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[color-mix(in_srgb,var(--color-text)_7%,transparent)] bg-[color-mix(in_srgb,var(--color-surface-muted)_26%,transparent)] text-[var(--color-text-secondary)] transition-colors hover:border-[color-mix(in_srgb,var(--color-primary)_18%,transparent)] hover:bg-[var(--color-nav-row-hover)] hover:text-[var(--color-text)] md:inline-flex"
            aria-label={collapsed ? "Yan menüyü aç" : "Yan menüyü daralt"}
            aria-expanded={!collapsed}
            onClick={onToggleSidebar}
          >
            <SidebarToggleIcon collapsed={collapsed} />
          </button>
        ) : null}
      </div>
    </div>
  );
}

type NavItem = {
  href: string;
  label: string;
  icon: (props: { className?: string }) => ReactElement;
};

// ─── ICON COMPONENTS ──────────────────────────────────────────────────────────

function IconHome({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" strokeLinejoin="round" />
    </svg>
  );
}

function IconRoute({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" strokeLinecap="round" />
    </svg>
  );
}

function IconCompass({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="m13.5 10.5 3-3m-4 4L9 16" strokeLinecap="round" />
    </svg>
  );
}

function IconUpload({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M12 16V4m0 0 4 4m-4-4L8 8M4 20h16" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconChart({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M4 19h16M7 15l3-4 3 2 5-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconFlash({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M13 2 3 14h8l-1 8 10-12h-8l1-8Z" strokeLinejoin="round" />
    </svg>
  );
}

function IconVideo({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <rect x="2" y="5" width="15" height="14" rx="2" />
      <path d="m15 10 5-3v10l-5-3" strokeLinejoin="round" />
    </svg>
  );
}

function IconLive({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M4 11a8 8 0 0 1 16 0" strokeLinecap="round" />
      <circle cx="12" cy="11" r="3" />
      <path d="M8 22h8" strokeLinecap="round" />
    </svg>
  );
}

function IconSignal({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M4 12h4l2-6 4 12 2-6h4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconPeople({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" strokeLinecap="round" />
    </svg>
  );
}

function IconStudio({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" strokeLinecap="round" />
    </svg>
  );
}

function IconShop({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function IconStar({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7-6.3-4.6-6.3 4.6 2.3-7-6-4.6h7.6L12 2Z" strokeLinejoin="round" />
    </svg>
  );
}

function IconWallet({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    </svg>
  );
}

function IconNews({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M4 5h12v14H4V5Z" />
      <path d="M16 9h4v10H8v-2" />
      <path d="M8 9h4M8 12h4" strokeLinecap="round" />
    </svg>
  );
}

function IconCalendar({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 11h18" strokeLinecap="round" />
    </svg>
  );
}

function IconBookmark({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M7 4h10a1 1 0 0 1 1 1v15l-6-3-6 3V5a1 1 0 0 1 1-1Z" strokeLinejoin="round" />
    </svg>
  );
}

function IconBell({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2Zm6-6V11a6 6 0 1 0-12 0v5l-2 2h16l-2-2Z" strokeLinejoin="round" />
    </svg>
  );
}

function IconChevronDown({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" aria-hidden>
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── NAV DATA ─────────────────────────────────────────────────────────────────

/**
 * CANONICAL NAVIGATION (app parity)
 * Primary navigation: Bottom tab equivalent
 */
const mainNav: NavItem[] = [
  { href: "/", label: "Akış", icon: IconHome },
  { href: "/discover", label: "Keşfet", icon: IconCompass },
  { href: "/onboarding", label: "Rehber", icon: IconRoute },
  { href: "/upload", label: "Üret", icon: IconUpload },
];

/**
 * DISCOVER QUICK ACCESS
 * Discover alt sekmeleri — media discovery surfaces
 */
const discoverNav: NavItem[] = [
  { href: DISCOVER_VERTICAL_ROUTES.pulse, label: "Pulse", icon: IconFlash },
  { href: DISCOVER_VERTICAL_ROUTES.videos, label: "Videolar", icon: IconVideo },
  { href: DISCOVER_VERTICAL_ROUTES.live, label: "Canlı", icon: IconLive },
  { href: DISCOVER_VERTICAL_ROUTES.signals, label: "Sinyal Keşfi", icon: IconSignal },
  { href: DISCOVER_VERTICAL_ROUTES.creators, label: "Üreticiler", icon: IconPeople },
];

/**
 * CREATOR TOOLS (auth required)
 */
const creatorNav: NavItem[] = [
  { href: "/studio", label: "Studio", icon: IconStudio },
  { href: "/signals", label: "Sinyal Pazarı", icon: IconShop },
];

/**
 * Piyasalar — yalnızca kategori sayfaları (`/markets/category/...`)
 */
const marketCategoryNav: NavItem[] = [
  { href: "/markets/category/crypto", label: "Kripto", icon: IconChart },
  { href: "/markets/category/bist", label: "BIST", icon: IconChart },
  { href: "/markets/category/forex", label: "Forex", icon: IconChart },
  { href: "/markets/category/commodities", label: "Emtia", icon: IconChart },
  { href: "/markets/category/nasdaq", label: "NASDAQ", icon: IconChart },
];

/**
 * Piyasa araçları — liste / portföy / haber / takvim
 */
const marketUtilityNav: NavItem[] = [
  { href: "/watchlist", label: "Takip Listem", icon: IconStar },
  { href: "/portfolio", label: "Portföy", icon: IconWallet },
  { href: "/price-alerts", label: "Fiyat Alarmları", icon: IconBell },
  { href: "/market-news", label: "Piyasa Haberleri", icon: IconNews },
  { href: "/economic-calendar", label: "Ekonomik Takvim", icon: IconCalendar },
];

/**
 * Kişisel — oturum açıkken
 */
const personalNav: NavItem[] = [
  { href: "/saved", label: "Kaydedilenler", icon: IconBookmark },
];

// ─── SIDEBAR COMPONENT ────────────────────────────────────────────────────────

type Props = {
  onNavigate?: () => void;
};

function discoverTabFromHref(href: string): DiscoverTabId | null {
  const path = href.split("?")[0];
  if (path !== "/discover") return null;
  try {
    const t = new URL(href, "https://example.com").searchParams.get("tab");
    if (!t) return defaultDiscoverTab();
    return isDiscoverTabId(t) ? t : defaultDiscoverTab();
  } catch {
    return defaultDiscoverTab();
  }
}

export function Sidebar({ onNavigate }: Props) {
  const { user } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const discoverTabParam = searchParams.get("tab");
  const discoverTabResolved: DiscoverTabId =
    pathname === "/discover" && discoverTabParam && isDiscoverTabId(discoverTabParam)
      ? discoverTabParam
      : pathname === "/discover"
        ? defaultDiscoverTab()
        : defaultDiscoverTab();

  const [discoverOpen, setDiscoverOpen] = useState(true);
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [marketsNavOpen, setMarketsNavOpen] = useState(true);
  const [marketOpen, setMarketOpen] = useState(false);
  const [personalOpen, setPersonalOpen] = useState(true);

  const rowClass = (active: boolean) =>
    cn(
      "relative flex min-h-[2.375rem] items-center gap-[var(--sp-3)] rounded-lg px-[var(--sp-2)] py-1.5 text-[var(--type-nav)] leading-[var(--type-nav--leading)] antialiased transition-[color,background-color] duration-[var(--motion-fast)] motion-reduce:transition-none",
      active
        ? "bg-[var(--color-nav-row-active)] font-semibold text-[var(--color-text)] before:pointer-events-none before:absolute before:left-2 before:top-1/2 before:h-[1.125rem] before:w-[2px] before:-translate-y-1/2 before:rounded-full before:bg-[var(--color-nav-accent-line)] before:content-['']"
        : "font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-nav-row-hover)] hover:text-[var(--color-text)]",
    );

  const renderIcon = (Icon: NavItem["icon"], active: boolean) => (
    <Icon
      className={cn(
        "size-[1.125rem] shrink-0",
        active ? "text-[var(--color-text)]" : "text-[var(--color-text-tertiary)]",
      )}
    />
  );

  const linkActive = (href: string): boolean => {
    // Keşfet hub — yalnızca /discover (dikey sayfalar ayrı aktif olur)
    if (href === DISCOVER_HUB_PATH) {
      return pathname === DISCOVER_HUB_PATH;
    }

    // Bağımsız keşif dikeyleri
    if (href === DISCOVER_VERTICAL_ROUTES.live) return pathname.startsWith("/live");
    if (href === DISCOVER_VERTICAL_ROUTES.pulse) return pathname.startsWith("/pulse");
    if (href === DISCOVER_VERTICAL_ROUTES.videos) return pathname.startsWith("/videos");
    if (href === DISCOVER_VERTICAL_ROUTES.creators) return pathname.startsWith("/creators");

    // Discover tab links (legacy — hub içi ?tab= hâlâ desteklenir)
    const tabFromLink = discoverTabFromHref(href);
    if (tabFromLink != null) {
      return pathname === DISCOVER_HUB_PATH && discoverTabResolved === tabFromLink;
    }

    // Piyasalar kategorileri — tam eşleşme (`/markets` kökü artık yönlendirme; sembol sayfasında kategori aktif olmaz)
    if (href.startsWith("/markets/category/")) {
      return pathname === href;
    }

    // Exact prefix groups (unchanged semantics)
    if (href === "/signals" || href.startsWith("/signals/")) return pathname.startsWith("/signals");
    if (href === "/studio") return pathname.startsWith("/studio");
    if (href === "/watchlist") return pathname.startsWith("/watchlist");
    if (href === "/portfolio") return pathname.startsWith("/portfolio");
    if (href === "/economic-calendar") return pathname.startsWith("/economic-calendar");
    if (href === "/market-news") return pathname.startsWith("/market-news");
    if (href === "/price-alerts") return pathname.startsWith("/price-alerts");
    if (href === "/saved") return pathname.startsWith("/saved");

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const sectionHeader = (label: string, open: boolean, onToggle: () => void) => (
    <button
      type="button"
      onClick={onToggle}
      className="group mb-0.5 mt-[var(--sp-5)] flex w-full items-center justify-between rounded-lg px-[var(--sp-2)] py-1.5 text-[0.75rem] font-semibold leading-snug tracking-[var(--type-overline--tracking)] text-[var(--color-nav-section)] transition-colors first:mt-0 hover:bg-[var(--color-nav-row-hover)] hover:text-[var(--color-text-secondary)]"
      aria-expanded={open}
    >
      <span className="min-w-0 truncate text-left normal-case">{label}</span>
      <IconChevronDown
        className={cn(
          "size-4 shrink-0 text-[var(--color-text-tertiary)] transition-transform duration-200 motion-reduce:transition-none",
          open ? "rotate-180" : "",
        )}
      />
    </button>
  );

  return (
    <nav
      className="flex flex-col gap-0.5 px-[var(--sp-2)] pb-[var(--sp-3)] pt-1"
      aria-label="Ana gezinme"
    >
      {/* Primary nav — always visible */}
      {mainNav.map((item) => {
        const active = linkActive(item.href);
        return (
          <Link key={item.href} href={item.href} prefetch onClick={onNavigate} className={rowClass(active)}>
            {renderIcon(item.icon, active)}
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
          </Link>
        );
      })}

      <div className="my-[var(--sp-3)] h-px max-w-[calc(100%-var(--sp-2))] bg-[color-mix(in_srgb,var(--color-text)_5.5%,transparent)]" />

      {/* Discover section — collapsible */}
      {sectionHeader("Keşfet", discoverOpen, () => setDiscoverOpen(!discoverOpen))}
      {discoverOpen && (
        <>
          {discoverNav.map((item) => {
            const active = linkActive(item.href);
            return (
              <PrefetchOnHoverLink
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(rowClass(active), "pl-[var(--sp-4)]")}
              >
                {renderIcon(item.icon, active)}
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
              </PrefetchOnHoverLink>
            );
          })}
        </>
      )}

      {user && (
        <>
          <div className="my-[var(--sp-3)] h-px max-w-[calc(100%-var(--sp-2))] bg-[color-mix(in_srgb,var(--color-text)_5.5%,transparent)]" />
          {sectionHeader("Üretici Araçları", creatorOpen, () => setCreatorOpen(!creatorOpen))}
          {creatorOpen && (
            <>
              {creatorNav.map((item) => {
                const active = linkActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch
                    onClick={onNavigate}
                    className={cn(rowClass(active), "pl-[var(--sp-4)]")}
                  >
                    {renderIcon(item.icon, active)}
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  </Link>
                );
              })}
            </>
          )}
        </>
      )}

      <div className="my-[var(--sp-3)] h-px max-w-[calc(100%-var(--sp-2))] bg-[color-mix(in_srgb,var(--color-text)_5.5%,transparent)]" />
      {sectionHeader("Piyasalar", marketsNavOpen, () => setMarketsNavOpen(!marketsNavOpen))}
      {marketsNavOpen && (
        <>
          {marketCategoryNav.map((item) => {
            const active = linkActive(item.href);
            return (
              <PrefetchOnHoverLink
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(rowClass(active), "pl-[var(--sp-4)]")}
              >
                {renderIcon(item.icon, active)}
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
              </PrefetchOnHoverLink>
            );
          })}
        </>
      )}

      <div className="my-[var(--sp-3)] h-px max-w-[calc(100%-var(--sp-2))] bg-[color-mix(in_srgb,var(--color-text)_5.5%,transparent)]" />
      {sectionHeader("Piyasa Araçları", marketOpen, () => setMarketOpen(!marketOpen))}
      {marketOpen && (
        <>
          {marketUtilityNav.map((item) => {
            const active = linkActive(item.href);
            return (
              <PrefetchOnHoverLink
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(rowClass(active), "pl-[var(--sp-4)]")}
              >
                {renderIcon(item.icon, active)}
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
              </PrefetchOnHoverLink>
            );
          })}
        </>
      )}

      {user && (
        <>
          <div className="my-[var(--sp-3)] h-px max-w-[calc(100%-var(--sp-2))] bg-[color-mix(in_srgb,var(--color-text)_5.5%,transparent)]" />
          {sectionHeader("Kişisel", personalOpen, () => setPersonalOpen(!personalOpen))}
          {personalOpen && (
            <>
              {personalNav.map((item) => {
                const active = linkActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch
                    onClick={onNavigate}
                    className={cn(rowClass(active), "pl-[var(--sp-4)]")}
                  >
                    {renderIcon(item.icon, active)}
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  </Link>
                );
              })}
            </>
          )}
        </>
      )}
    </nav>
  );
}
