/** Sparkline / indeks serisini gerçek fiyat bandına ölçekler — mum grafiği için */
export function scaleSeriesToPrice(series: readonly number[], price: number): number[] {
  if (series.length < 2 || price <= 0) return [...series];

  const max = Math.max(...series);
  const min = Math.min(...series);

  if (max > price * 0.25 && min > 0) {
    return [...series];
  }

  const span = max - min || 1;
  const targetSpan = price * Math.max(0.04, Math.abs(max - min) / Math.max(max, 1) * 2.5);

  return series.map((v) => {
    const ratio = (v - min) / span;
    return price - targetSpan / 2 + ratio * targetSpan;
  });
}
