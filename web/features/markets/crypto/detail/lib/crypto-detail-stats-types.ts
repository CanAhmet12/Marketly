export type CryptoCoinMeta = {
  source: "coingecko" | "fallback";
  ath: number | null;
  athChangePct: number | null;
  circulatingSupply: number | null;
  maxSupply: number | null;
  totalSupply: number | null;
  fdv: number | null;
  marketCapUsd: number | null;
  volume24hUsd: number | null;
};

export type CryptoDetailStatTone = "up" | "down" | "neutral" | "gold" | "accent" | "muted";

export type CryptoDetailStatCell = {
  key: string;
  label: string;
  value: string;
  hint?: string;
  tone?: CryptoDetailStatTone;
  wide?: boolean;
};

export type CryptoDetailStatsPayload = {
  cells: CryptoDetailStatCell[];
  source: CryptoCoinMeta["source"];
};
