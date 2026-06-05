/** Deterministik mini seri — API gelene kadar trend + seed ile üretilir */

export function buildSparklineSeries(seed: string, trend: "up" | "down" | "flat", length = 28): number[] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  const rnd = () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 10000) / 10000;
  };

  const drift = trend === "up" ? 0.9 : trend === "down" ? -0.9 : 0;
  const out: number[] = [];
  let v = 48 + rnd() * 8;
  for (let i = 0; i < length; i++) {
    v += drift + (rnd() - 0.5) * 3.8;
    v = Math.max(6, Math.min(94, v));
    out.push(v);
  }
  return out;
}
