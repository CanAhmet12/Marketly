import { cn } from "@/lib/cn";

function SignalMetric({ label, value, accent }: { label: string; value: string; accent?: "target" | "stop" }) {
  const valCls =
    accent === "target"
      ? "text-[var(--color-primary-dark)]"
      : accent === "stop"
        ? "text-[var(--color-fall)]"
        : "text-[var(--color-text)]";
  return (
    <div className="ms-metric-block">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-meta)]">{label}</p>
      <p className={cn("mt-1 truncate text-[13px] font-semibold tabular-nums", valCls)}>{value}</p>
    </div>
  );
}

export function SignalLevelsGrid({
  entryLabel,
  targetLabel,
  stopLabel,
  rrLabel,
  dense,
}: {
  entryLabel: string;
  targetLabel: string;
  stopLabel: string;
  rrLabel: string | null;
  dense?: boolean;
}) {
  return (
    <div
      className={cn(
        "grid gap-[var(--sp-2)]",
        dense ? "grid-cols-2 min-[480px]:grid-cols-4" : "grid-cols-2 min-[480px]:grid-cols-4",
      )}
    >
      <SignalMetric label="Giriş" value={entryLabel} />
      <SignalMetric label="Hedef" value={targetLabel} accent="target" />
      <SignalMetric label="Stop" value={stopLabel} accent="stop" />
      <SignalMetric label="R / Ö" value={rrLabel ?? "—"} />
    </div>
  );
}
