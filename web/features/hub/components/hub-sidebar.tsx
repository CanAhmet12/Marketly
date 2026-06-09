"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";

import { HubSidebarBrand } from "@/features/hub/components/hub-sidebar-brand";
import { hubNavIcon } from "@/features/hub/components/hub-nav-icons";
import {
  HUB_NAV_GROUPS,
  hubGroupForPath,
  type HubNavGroupId,
} from "@/features/hub/lib/hub-nav-config";
import { useAuth } from "@/features/auth/use-auth";
import { SafeAvatar } from "@/components/ui/safe-avatar";
import { cn } from "@/lib/cn";

const STORAGE_KEY = "marketly-hub-sidebar-groups";

function HubIconChevronDown({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" aria-hidden>
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function isNavActive(pathname: string, href: string, end?: boolean): boolean {
  if (end) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function hubRowClass(active: boolean) {
  return cn(
    "relative flex min-h-[2.375rem] items-center gap-[var(--sp-3)] rounded-lg px-[var(--sp-2)] py-1.5 text-[var(--type-nav)] leading-[var(--type-nav--leading)] antialiased transition-[color,background-color,box-shadow] duration-[var(--motion-fast)] motion-reduce:transition-none",
    active
      ? "bg-[var(--color-nav-row-active)] font-semibold text-[var(--color-text)] before:pointer-events-none before:absolute before:left-2 before:top-1/2 before:h-[1.125rem] before:w-[2px] before:-translate-y-1/2 before:rounded-full before:bg-[var(--color-nav-accent-line)] before:content-['']"
      : "font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-nav-row-hover)] hover:text-[var(--color-text)]",
  );
}

function readStoredGroups(): Partial<Record<HubNavGroupId, boolean>> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Partial<Record<HubNavGroupId, boolean>>;
  } catch {
    return {};
  }
}

function defaultOpenState(): Record<HubNavGroupId, boolean> {
  const stored = readStoredGroups();
  return Object.fromEntries(
    HUB_NAV_GROUPS.map((g) => [g.id, stored[g.id] ?? g.defaultOpen]),
  ) as Record<HubNavGroupId, boolean>;
}

export function HubSidebar() {
  const pathname = usePathname() ?? "";
  const { user, profile } = useAuth();
  const displayName = profile?.full_name?.trim() || user?.displayName || "Kullanıcı";
  const handle = profile?.username ? `@${profile.username}` : "";

  const activeGroupId = useMemo(() => hubGroupForPath(pathname), [pathname]);

  const [openGroups, setOpenGroups] = useState<Record<HubNavGroupId, boolean>>(() =>
    Object.fromEntries(HUB_NAV_GROUPS.map((g) => [g.id, g.defaultOpen])) as Record<HubNavGroupId, boolean>,
  );

  useEffect(() => {
    setOpenGroups(defaultOpenState());
  }, []);

  useEffect(() => {
    if (!activeGroupId) return;
    setOpenGroups((prev) => {
      if (prev[activeGroupId]) return prev;
      return { ...prev, [activeGroupId]: true };
    });
  }, [activeGroupId]);

  const toggleGroup = useCallback((id: HubNavGroupId) => {
    setOpenGroups((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const renderIcon = (href: string, active: boolean) =>
    hubNavIcon(
      href,
      cn("size-[1.125rem] shrink-0", active ? "text-[var(--color-text)]" : "text-[var(--color-text-tertiary)]"),
    );

  return (
    <aside className="hb-sidebar-column" aria-label="Kanalım menüsü">
      <div className="hb-sidebar-fixed-top shrink-0">
        <HubSidebarBrand />

        <Link href="/hub/profile" className="hb-sidebar-user mx-[var(--sp-2)] mb-2 mt-1">
          {user?.avatarUrl || profile?.avatar_url ? (
            <SafeAvatar
              src={user?.avatarUrl ?? profile?.avatar_url ?? undefined}
              alt=""
              size={40}
              className="size-10 shrink-0 rounded-full ring-1 ring-[color-mix(in_srgb,var(--color-text)_8%,transparent)]"
            />
          ) : (
            <div className="hb-sidebar-user-fallback" aria-hidden>
              {displayName.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <span className="block truncate text-[var(--type-creator)] font-semibold leading-[var(--type-creator--leading)] tracking-[var(--type-creator--tracking)] text-[var(--color-text)]">
              {displayName}
            </span>
            {handle ? (
              <span className="block truncate text-[0.75rem] font-medium leading-snug text-[var(--color-meta)]">{handle}</span>
            ) : null}
          </div>
        </Link>
      </div>

      <nav
        className="hb-sidebar-scroll flex min-h-0 flex-1 flex-col px-[var(--sp-2)] pb-[var(--sp-2)] pt-1"
        aria-label="Kanalım gezinme"
      >
        {HUB_NAV_GROUPS.map((group, groupIndex) => {
          const open = openGroups[group.id] ?? group.defaultOpen;
          const groupStyle = { "--hb-group-accent": group.accent } as CSSProperties;
          const hasActive = group.items.some(
            (item) => isNavActive(pathname, item.href, item.end),
          );

          return (
            <section
              key={group.id}
              className={cn("hb-sidebar-section", hasActive && "hb-sidebar-section--active")}
              style={groupStyle}
            >
              {groupIndex > 0 ? <div className="hb-sidebar-section-rule" aria-hidden /> : null}

              <button
                type="button"
                onClick={() => toggleGroup(group.id)}
                className="hb-sidebar-section-btn"
                aria-expanded={open}
                aria-controls={`hub-nav-group-${group.id}`}
              >
                <span className="hb-sidebar-section-leading">
                  <span className="hb-sidebar-section-dot" aria-hidden />
                  <span className="hb-sidebar-section-label">{group.label}</span>
                </span>
                <HubIconChevronDown className={cn("hb-sidebar-section-chevron", open && "hb-sidebar-section-chevron--open")} />
              </button>

              <div
                id={`hub-nav-group-${group.id}`}
                className={cn("hb-sidebar-group-panel", open && "hb-sidebar-group-panel--open")}
              >
                <ul className="hb-sidebar-group-panel-inner m-0 flex list-none flex-col gap-0.5 p-0 pb-1">
                  {group.items.map((item) => {
                    const active = isNavActive(pathname, item.href, item.end);
                    return (
                      <li key={item.href}>
                        <Link href={item.href} aria-current={active ? "page" : undefined} className={hubRowClass(active)}>
                          {renderIcon(item.href, active)}
                          <span className="min-w-0 flex-1 truncate">{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </section>
          );
        })}
      </nav>

      <div className="hb-sidebar-foot shrink-0 border-t border-[color-mix(in_srgb,var(--color-text)_6%,transparent)] px-[var(--sp-2)] py-2">
        <Link href="/" className={cn(hubRowClass(false), "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]")}>
          {hubNavIcon("/", "size-[1.125rem] shrink-0 text-[var(--color-text-tertiary)]")}
          <span className="min-w-0 flex-1 truncate">Marketly akışına dön</span>
        </Link>
      </div>
    </aside>
  );
}
