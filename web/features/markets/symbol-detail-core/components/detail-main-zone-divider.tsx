import { cn } from "@/lib/cn";

type Variant = "peak-live" | "live-teal";

type Props = {
  variant: Variant;
};

export function DetailMainZoneDivider({ variant }: Props) {
  return (
    <hr
      className={cn("cdr-main-zone-divider", `cdr-main-zone-divider--${variant}`)}
      aria-hidden
    />
  );
}
