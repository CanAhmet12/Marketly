import type { BistVolumeForeignResponse } from "@/features/markets/bist/lib/bist-detail-types";

export async function fetchBistDetailVolumeForeign(
  symbol: string,
  changePct?: number,
): Promise<BistVolumeForeignResponse> {
  const sym = symbol.trim().toUpperCase().replace(".IS", "");
  const params = new URLSearchParams({ symbol: sym });
  if (changePct != null && Number.isFinite(changePct)) {
    params.set("changePct", String(changePct));
  }

  const res = await fetch(`/api/markets/bist/volume-foreign?${params.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Hacim verisi alınamadı (${res.status})`);
  }

  return res.json() as Promise<BistVolumeForeignResponse>;
}
