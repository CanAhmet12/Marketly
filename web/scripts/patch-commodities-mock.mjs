import fs from "node:fs";

const p = "features/markets/commodities/data/commodities-mock.ts";
let t = fs.readFileSync(p, "utf8");

if (!t.includes("volatility:")) {
  t = t.replace(
    /trendScore: \{ value: 62, label: "Olumlu" \},\n\};/,
    'trendScore: { value: 62, label: "Olumlu" },\n  volatility: { value: 48, label: "Orta" },\n};',
  );
}

t = t.replace('label: "Emtia Endeksi"', 'label: "Bloomberg CCI"');

if (!t.includes("gumus:")) {
  t = t.replace(
    "COMMODITY_MOCK_PANELS: { altin: CommodityAssetPanel; petrol: CommodityAssetPanel } = {",
    "COMMODITY_MOCK_PANELS: { altin: CommodityAssetPanel; gumus: CommodityAssetPanel; petrol: CommodityAssetPanel } = {",
  );
  const gumusBlock = `  gumus: {
    symbol: "XAGUSD", name: "Gümüş", price: 27.84, unit: "$/oz",
    changePct: 0.44,
    sparkline: [27.14,27.28,27.42,27.56,27.68,27.78,27.81,27.84],
    trend: "up",
    stats: { haftalik: "+2.18%", aylik: "+5.44%", destek: "27.20", direnc: "28.40" },
  },
`;
  t = t.replace("  altin: {", `${gumusBlock}  altin: {`);
}

// Gerçek ticker sembolleri — detay sayfası linkleri için
const symbolMap = {
  'symbol: "ALTIN"': 'symbol: "XAUUSD"',
  'symbol: "GUMUS"': 'symbol: "XAGUSD"',
  'symbol: "PETROL"': 'symbol: "WTI"',
  'symbol: "DOGALGAZ"': 'symbol: "NGAS"',
  'symbol: "BUGDAY"': 'symbol: "WHEAT"',
  'symbol: "MISIR"': 'symbol: "CORN"',
  'symbol: "SOYA"': 'symbol: "SOYBEAN"',
  'symbol: "BAKIR"': 'symbol: "COPPER"',
  'symbol: "PLATIN"': 'symbol: "XPTUSD"',
  'symbol: "PALADYUM"': 'symbol: "XPDUSD"',
  'symbol: "KAHVE"': 'symbol: "COFFEE"',
  'symbol: "SEKER"': 'symbol: "SUGAR"',
  'symbol: "PAMUK"': 'symbol: "COTTON"',
  'symbol: "KAKAO"': 'symbol: "COCOA"',
  'symbol: "CINKO"': 'symbol: "ZINC"',
  'symbol: "NIKEL"': 'symbol: "NICKEL"',
  'symbol: "KURSUM"': 'symbol: "LEAD"',
  'symbol: "ALUM"': 'symbol: "ALUMINUM"',
  'symbol: "FUEL"': 'symbol: "FUEL"',
  'symbol: "BRENT"': 'symbol: "BRENT"',
};

for (const [from, to] of Object.entries(symbolMap)) {
  t = t.split(from).join(to);
}

// Panel altin sembolü
t = t.replace('symbol: "ALTIN", name: "Altin"', 'symbol: "XAUUSD", name: "Altın"');

fs.writeFileSync(p, t);
console.log("patched commodities-mock.ts");
