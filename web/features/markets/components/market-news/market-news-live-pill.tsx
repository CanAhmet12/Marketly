import { cn } from "@/lib/cn";

type Props = {
  isRefetching?: boolean;
  className?: string;
};

export function MarketNewsLivePill({ isRefetching = false, className }: Props) {
  return (
    <span
      className={cn("mn-live-pill", isRefetching && "mn-live-pill--sync", className)}
      role="status"
    >
      <span className="mn-live-pill__dot" aria-hidden />
      <span>{isRefetching ? "Güncelleniyor" : "Canlı"}</span>
    </span>
  );
}
