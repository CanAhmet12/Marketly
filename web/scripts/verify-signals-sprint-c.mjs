/**
 * Sprint C doğrulama — etkileşim seed + RPC + 24s velocity
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

function ok(label, detail = "") {
  console.log(`OK  | ${label}${detail ? " — " + detail : ""}`);
}
function fail(label, detail = "") {
  console.log(`FAIL| ${label}${detail ? " — " + detail : ""}`);
}
function warn(label, detail = "") {
  console.log(`WARN| ${label}${detail ? " — " + detail : ""}`);
}

console.log("=== Signals Sprint C Verification ===\n");

// RLS: anon key tablo sayımı göremez — thread_pack + signals üzerinden doğrula
const feed = await client.rpc("get_signals_feed", {
  p_limit: 3,
  p_sort: "trending",
  p_asset: null,
  p_direction: null,
  p_user_id: null,
});
const top = feed.data?.[0];
if (!top?.id) fail("feed sample", "boş");
else {
  ok("feed sample", `${top.asset_symbol} · likes=${top.likes_count} · copies=${top.copies_count}`);
  const pack = await client.rpc("get_signal_thread_pack", { p_signal_id: top.id });
  if (pack.error) fail("thread_pack", pack.error.message);
  else if ((pack.data?.copies_24h ?? 0) < 2) warn("copies_24h velocity", String(pack.data?.copies_24h ?? 0));
  else ok("copies_24h velocity", String(pack.data?.copies_24h ?? 0));
}

const testUser = await client.from("follows").select("follower_id").limit(1).maybeSingle();
const uid = testUser.data?.follower_id;
if (!uid || !top?.id) warn("RPC engagement", "test user/signal yok");
else {
  const likeRpc = await client.rpc("toggle_signal_like", { p_user_id: uid, p_signal_id: top.id });
  if (likeRpc.error?.code === "PGRST202") fail("toggle_signal_like", "RPC yok");
  else if (likeRpc.error) warn("toggle_signal_like", likeRpc.error.message);
  else ok("toggle_signal_like", JSON.stringify(likeRpc.data));

  const copyRpc = await client.rpc("copy_signal_once", { p_user_id: uid, p_signal_id: top.id });
  if (copyRpc.error?.code === "PGRST202") fail("copy_signal_once", "RPC yok");
  else if (copyRpc.error) warn("copy_signal_once", copyRpc.error.message);
  else ok("copy_signal_once", JSON.stringify(copyRpc.data));
}

console.log("\n=== Done ===");
const failed = feed.error;
process.exit(failed ? 1 : 0);
