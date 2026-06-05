"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useRef, type ComponentProps, type ReactNode } from "react";

type LinkProps = ComponentProps<typeof Link>;

type Props = Omit<LinkProps, "prefetch"> & {
  children: ReactNode;
};

/** P8-005 — viewport prefetch kapalı; hover/focus ile tek route ısıtma */
export function PrefetchOnHoverLink({ href, children, onMouseEnter, onFocus, ...rest }: Props) {
  const router = useRouter();
  const warmed = useRef(false);

  const warm = useCallback(() => {
    if (warmed.current) return;
    warmed.current = true;
    const target = typeof href === "string" ? href : href.pathname ?? "";
    if (target) void router.prefetch(target);
  }, [router, href]);

  return (
    <Link
      href={href}
      prefetch={false}
      onMouseEnter={(e) => {
        warm();
        onMouseEnter?.(e);
      }}
      onFocus={(e) => {
        warm();
        onFocus?.(e);
      }}
      {...rest}
    >
      {children}
    </Link>
  );
}
