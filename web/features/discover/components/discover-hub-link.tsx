"use client";

import Link from "next/link";
import type { ComponentProps, MouseEvent, ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import { DISCOVER_HUB_PATH } from "@/features/discover/routes";

type Props = Omit<ComponentProps<typeof Link>, "href"> & {
  children: ReactNode;
};

/** Keşfet hub — her zaman düz `/discover` (Tümü); eski ?tab= temizlenir */
export function DiscoverHubLink({ children, onClick, ...rest }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    if (pathname === DISCOVER_HUB_PATH) {
      e.preventDefault();
      router.replace(DISCOVER_HUB_PATH, { scroll: false });
    }
  };

  return (
    <Link href={DISCOVER_HUB_PATH} onClick={handleClick} {...rest}>
      {children}
    </Link>
  );
}
