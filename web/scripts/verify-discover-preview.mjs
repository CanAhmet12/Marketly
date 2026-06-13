/**
 * Keşfet önizleme doğrulama — P0/P1/P2 hub tab vs tam sayfa
 */
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "node:path";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), "../.env") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || process.env.EXPO_PUBLIC_SUPABASE_ANON?.trim();

if (!url || !anonKey) {
  console.error("FAIL | Supabase URL/anon key missing");
  process.exit(1);
}

const client = createClient(url, anonKey);
const PREVIEW_LIMIT = 12;

function ok(label, detail = "") {
  console.log(`OK  | ${label}${detail ? " — " + detail : ""}`);
}
function fail(label, detail = "") {
  console.log(`FAIL| ${label}${detail ? " — " + detail : ""}`);
}

console.log("=== Discover Preview Verification ===\n");

const signalsPreview = await client.rpc("get_signals_feed", {
  p_limit: PREVIEW_LIMIT,
  p_sort: "trending",
  p_asset: null,
  p_direction: null,
  p_user_id: null,
});

if (signalsPreview.error) fail("signals preview feed", signalsPreview.error.message);
else {
  const n = signalsPreview.data?.length ?? 0;
  if (n === 0) fail("signals preview feed", "boş");
  else if (n > PREVIEW_LIMIT) fail("signals preview feed", `limit aşıldı: ${n}`);
  else ok("signals preview feed", `${n} rows (≤${PREVIEW_LIMIT})`);
}

const signalsFull = await client.rpc("get_signals_feed", {
  p_limit: 120,
  p_sort: "trending",
  p_asset: null,
  p_direction: null,
  p_user_id: null,
});

if (signalsFull.error) fail("signals full feed", signalsFull.error.message);
else ok("signals full feed", `${signalsFull.data?.length ?? 0} rows`);

const creators = await client
  .from("profiles")
  .select("id", { count: "exact", head: true })
  .not("username", "is", null);

if (creators.error) fail("creators count", creators.error.message);
else ok("creators count", String(creators.count ?? 0));

const archived = await client
  .from("signals")
  .select("id", { count: "exact", head: true })
  .eq("is_active", false);

if (archived.error) fail("archive count", archived.error.message);
else ok("archive count", String(archived.count ?? 0));

ok("hub routes", "/discover?tab=signals · /discover?tab=creators");
ok("full routes", "/signals · /creators");

console.log("\n=== Done ===");
const failed = signalsPreview.error || !(signalsPreview.data?.length > 0) || signalsFull.error;
process.exit(failed ? 1 : 0);
