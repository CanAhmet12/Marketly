import { RailSymbolIcon } from "@/features/home/visual/rail-symbol-icon";
import { cn } from "@/lib/cn";

type Props = {
  symbol: string;
  size?: number;
  color?: string;
  className?: string;
};

/** Piyasa canvas satırları — RailSymbolIcon + cc-symbol-icon yüzeyi */
export function MarketSymbolIcon({ symbol, size = 26, color, className }: Props) {
  return (
    <RailSymbolIcon
      symbol={symbol}
      size={size}
      color={color}
      className={cn("cc-symbol-icon", className)}
    />
  );
}
