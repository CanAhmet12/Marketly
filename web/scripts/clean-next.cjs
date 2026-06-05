/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS script */
const fs = require("node:fs");
const path = require("node:path");

const target = path.join(process.cwd(), ".next");

/** @param {number} ms */
function sleepSync(ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    /* busy-wait: short script; avoids Windows timer edge cases */
  }
}

const attempts = 12;
let lastErr = /** @type {NodeJS.ErrnoException | null} */ (null);

for (let i = 0; i < attempts; i++) {
  try {
    fs.rmSync(target, { recursive: true, force: true });
    console.log("[clean-next] Removed:", target);
    lastErr = null;
    break;
  } catch (e) {
    const err = /** @type {NodeJS.ErrnoException} */ (e);
    lastErr = err;
    if (err.code === "ENOENT") {
      lastErr = null;
      break;
    }
    const retryable =
      err.code === "ENOTEMPTY" ||
      err.code === "EBUSY" ||
      err.code === "EPERM" ||
      err.code === "EACCES";
    if (retryable && i < attempts - 1) {
      sleepSync(250);
      continue;
    }
    console.error("[clean-next]", err.message);
    process.exitCode = 1;
    break;
  }
}

if (lastErr) {
  const locked =
    lastErr.code === "ENOTEMPTY" ||
    lastErr.code === "EBUSY" ||
    lastErr.code === "EPERM" ||
    lastErr.code === "EACCES";
  if (locked) {
    console.error(
      "[clean-next] .next is still locked (usually a running `next dev`). Stop all Next dev processes, then run `npm run clean` again.",
    );
  }
}
