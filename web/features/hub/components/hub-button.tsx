import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/cn";

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: "default" | "primary";
};

type LinkProps = ComponentPropsWithoutRef<typeof Link> & {
  variant?: "default" | "primary";
};

function btnClass(variant: "default" | "primary", className?: string) {
  return cn("hp-btn", variant === "primary" && "hp-btn--primary", className);
}

export function HubButton({ variant = "default", className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={btnClass(variant, className)} {...props} />;
}

export function HubButtonLink({ variant = "default", className, ...props }: LinkProps) {
  return <Link className={btnClass(variant, className)} {...props} />;
}
