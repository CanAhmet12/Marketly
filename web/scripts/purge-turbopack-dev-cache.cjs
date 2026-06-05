/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS script */
/**
 * Bozuk Turbopack dev SST dosyaları (ENOENT / "corrupted database") genelde
 * `.next/dev/cache/turbopack` altında kalır. `next dev` (Turbopack) veya
 * bazen kısmen silinmiş `.next` ile webpack dev karışımında hata sürer.
 * Bu klasörü güvenle siler; webpack-only dev'de de zararsız.
 */
const fs = require("node:fs");
const path = require("node:path");

const roots = [
  path.join(process.cwd(), ".next", "dev", "cache", "turbopack"),
  path.join(process.cwd(), ".next", "cache", "turbopack"),
];

for (const dir of roots) {
  try {
    if (!fs.existsSync(dir)) continue;
    fs.rmSync(dir, { recursive: true, force: true });
    console.log("[purge-turbopack-dev-cache] Removed:", dir);
  } catch (e) {
    const err = /** @type {NodeJS.ErrnoException} */ (e);
    if (err.code !== "ENOENT") {
      console.warn("[purge-turbopack-dev-cache]", err.message);
    }
  }
}
