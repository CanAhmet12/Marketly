/**
 * Sprint D doğrulama — katalog etkileşim + bildirim + velocity
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

console.log("=== Signals Sprint D Verification ===\n");

const feed = await client.rpc("get_signals_feed", {
  p_limit: 5,
  p_sort: "copies",
  p_asset: null,
  p_direction: null,
  p_user_id: null,
});
if (feed.error) fail("get_signals_feed", feed.error.message);
else if ((feed.data?.length ?? 0) < 3) fail("get_signals_feed", "yetersiz satır");
else ok("get_signals_feed", `${feed.data.length} rows · top=${feed.data[0]?.asset_symbol}`);

const top = feed.data?.[0];
if (top?.id) {
  const pack = await client.rpc("get_signal_thread_pack", { p_signal_id: top.id });
  if (pack.error) fail("thread_pack", pack.error.message);
  else ok("thread_pack", `copies_24h=${pack.data?.copies_24h ?? 0} · bullish=${pack.data?.bullish_count ?? 0}`);
}

const logRpc = await client.rpc("log_signal_interaction", { p_signal_id: top?.id, p_action: "view" });
if (logRpc.error?.code === "PGRST202") warn("log_signal_interaction", "RPC yok — CF logging kapalı");
else if (logRpc.error) warn("log_signal_interaction", logRpc.error.message);
else ok("log_signal_interaction", "view logged");

const follows = await client.from("follows").select("follower_id").limit(1).maybeSingle();
const uid = follows.data?.follower_id;
if (uid && top?.id) {
  const like = await client.rpc("toggle_signal_like", { p_user_id: uid, p_signal_id: top.id });
  if (like.error) warn("engagement like", like.error.message);
  else ok("engagement like", `count=${like.data?.new_count}`);
}

console.log("\n=== Done ===");
process.exit(feed.error ? 1 : 0);
