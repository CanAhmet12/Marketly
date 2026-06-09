/**
 * RPC tanı teşhisi — kolon/tip uyumsuzluğu
 */
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "node:path";

config({ path: resolve(process.cwd(), ".env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
const client = createClient(url, anonKey);

console.log("1) get_leaderboard_analysts (referans)...");
const lb = await client.rpc("get_leaderboard_analysts", { p_limit: 2 });
console.log(lb.error ? `   ❌ ${lb.error.message}` : `   ✅ ${lb.data?.length ?? 0} satır`);

console.log("\n2) profiles örnek kolonlar...");
const prof = await client.from("profiles").select("id, username, tier, verified, follower_count, signal_accuracy, cover_url, created_at").limit(1);
if (prof.error) {
  console.log(`   ❌ ${prof.error.message} (${prof.error.code})`);
} else {
  console.log("   ✅", JSON.stringify(prof.data?.[0] ?? {}, null, 2));
}

console.log("\n3) posts örnek type...");
const post = await client.from("posts").select("id, user_id, type, title, asset_tag").limit(1);
if (post.error) {
  console.log(`   ❌ ${post.error.message}`);
} else {
  console.log("   ✅ type =", post.data?.[0]?.type);
}

console.log("\n4) get_creators_directory tam hata...");
const rpc = await client.rpc("get_creators_directory", { p_limit: 2 });
if (rpc.error) {
  console.log("   ❌ message:", rpc.error.message);
  console.log("   ❌ code:", rpc.error.code);
  console.log("   ❌ details:", rpc.error.details);
  console.log("   ❌ hint:", rpc.error.hint);
} else {
  console.log(`   ✅ ${rpc.data?.length ?? 0} satır`);
  if (rpc.data?.[0]) console.log(JSON.stringify(rpc.data[0], null, 2));
}
