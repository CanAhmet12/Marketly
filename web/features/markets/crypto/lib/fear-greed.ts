export type FearGreedBand = "extreme_fear" | "fear" | "neutral" | "greed" | "extreme_greed";

export function fearGreedBand(value: number): FearGreedBand {
  if (value <= 25) return "extreme_fear";
  if (value <= 45) return "fear";
  if (value <= 55) return "neutral";
  if (value <= 75) return "greed";
  return "extreme_greed";
}

export function fearGreedLabelTr(value: number): string {
  if (value <= 25) return "Aşırı Korku";
  if (value <= 45) return "Korku";
  if (value <= 55) return "Nötr";
  if (value <= 75) return "Açgözlülük";
  return "Aşırı Açgözlülük";
}

export function fearGreedColor(value: number): string {
  if (value <= 25) return "#ef4444";
  if (value <= 45) return "#f97316";
  if (value <= 55) return "#64748b";
  if (value <= 75) return "#2dd4bf";
  return "#f59e0b";
}
