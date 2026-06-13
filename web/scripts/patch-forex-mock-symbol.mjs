import fs from "node:fs";

const p = new URL("../features/markets/forex/data/forex-mock.ts", import.meta.url);
let s = fs.readFileSync(p, "utf8");

s = s.replace(/\{ rank:\s*(\d+),\s*pair:\s*"([^"]+)"/g, (full, rank, pair) => {
  if (full.includes("symbol:")) return full;
  const symbol = pair.replace("/", "");
  return `{ rank: ${rank}, symbol: "${symbol}", pair: "${pair}"`;
});

fs.writeFileSync(p, s);
console.log("forex-mock.ts patched with symbol fields");
