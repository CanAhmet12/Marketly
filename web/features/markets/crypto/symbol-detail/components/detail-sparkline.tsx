import { useId } from "react";

type Props = {
  series: readonly number[];
  width?: number;
  height?: number;
  className?: string;
  sparkKey?: string;
};

function buildPath(series: readonly number[], width: number, height: number): { line: string; area: string; up: boolean } {
  if (series.length < 2) {
    return { line: "", area: "", up: true };
  }

  const min = Math.min(...series);
  const max = Math.max(...series);
  const range = max - min || 1;
  const pad = 2;
  const innerH = height - pad * 2;
  const innerW = width - pad * 2;

  const points = series.map((v, i) => {
    const x = pad + (i / (series.length - 1)) * innerW;
    const y = pad + innerH - ((v - min) / range) * innerH;
    return { x, y };
  });

  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const area = `${line} L${points[points.length - 1]!.x.toFixed(1)} ${height} L${points[0]!.x.toFixed(1)} ${height} Z`;
  const up = series[series.length - 1]! >= series[0]!;

  return { line, area, up };
}

export function DetailSparkline({ series, width = 140, height = 36, className, sparkKey }: Props) {
  const autoId = useId().replace(/:/g, "");
  const uid = (sparkKey ?? autoId).replace(/[^a-zA-Z0-9_-]/g, "") || autoId;
  const { line, area, up } = buildPath(series, width, height);
  if (!line) {
    return <svg width={width} height={height} className={className} aria-hidden />;
  }

  const tone = up ? "up" : "down";

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={["cdr-mini-spark", className].filter(Boolean).join(" ")} aria-hidden>
      <defs>
        <linearGradient id={`cdr-spark-up-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(0,200,83,0.25)" />
          <stop offset="100%" stopColor="rgba(0,200,83,0)" />
        </linearGradient>
        <linearGradient id={`cdr-spark-down-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,82,82,0.25)" />
          <stop offset="100%" stopColor="rgba(255,82,82,0)" />
        </linearGradient>
      </defs>
      <path className={`cdr-mini-spark__fill--${tone}`} d={area} fill={`url(#cdr-spark-${tone}-${uid})`} />
      <path className={`cdr-mini-spark__line--${tone}`} d={line} />
    </svg>
  );
}
