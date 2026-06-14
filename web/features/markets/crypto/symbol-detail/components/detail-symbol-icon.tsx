import { resolveSymbolVisual } from "@/features/markets/crypto/symbol-detail/lib/symbol-visuals";

type Props = {
  symbol: string;
  size?: number;
  className?: string;
  plain?: boolean;
};

export function DetailSymbolIcon({ symbol, size = 48, className, plain }: Props) {
  const visual = resolveSymbolVisual(symbol);
  return (
    <span
      className={["cdr-symbol-icon", plain && "cdr-symbol-icon--plain", className].filter(Boolean).join(" ")}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.42,
        background: plain ? "transparent" : visual.bg,
        color: plain ? visual.bg : (visual.fg ?? "#ffffff"),
      }}
      aria-hidden
    >
      {visual.glyph}
    </span>
  );
}
