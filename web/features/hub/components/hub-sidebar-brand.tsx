"use client";

import Link from "next/link";

/** Global SidebarBrand ile aynı logo + tipografi; alt satırda Kanalım bağlamı */
export function HubSidebarBrand() {
  return (
    <div className="hb-sidebar-brand shrink-0 border-b border-[color-mix(in_srgb,var(--color-text)_6%,transparent)] bg-[var(--color-sidebar)] px-[var(--sp-2)] pb-2.5 pt-2">
      <Link
        href="/hub/profile"
        className="flex min-w-0 items-center gap-2.5 rounded-lg py-0.5 outline-none transition-opacity duration-[var(--motion-fast)] hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-0"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- static brand asset */}
        <img
          src="/logo.png"
          alt=""
          width={52}
          height={52}
          className="pointer-events-none size-[52px] shrink-0 object-contain"
          aria-hidden
        />
        <div className="min-w-0">
          <span className="block truncate font-sans text-[19px] font-bold leading-none tracking-[-0.04em] text-[color:var(--color-logo-wordmark)]">
            Market<span className="text-[color:var(--color-logo-accent)]">ly</span>
          </span>
          <span className="mt-1 block truncate text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--color-nav-section)]">
            Kanalım
          </span>
        </div>
      </Link>
    </div>
  );
}
