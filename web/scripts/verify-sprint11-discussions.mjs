/**
 * Sprint 11 — Tartışma öneri RPC doğrulama
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
function warn(label, detail = "") {
  console.log(`WARN| ${label}${detail ? " — " + detail : ""}`);
}
function fail(label, detail = "") {
  console.log(`FAIL| ${label}${detail ? " — " + detail : ""}`);
}

console.log("=== Sprint 11 Discussions RPC Verification ===\n");

const posts = await client
  .from("posts")
  .select("id, comments_count, comments, likes_count, likes", { count: "exact" })
  .limit(1);
if (posts.error) fail("posts table", posts.error.message);
else ok("posts table", `${posts.count ?? 0} rows`);

const rpc = await client.rpc("get_personalized_discussions", { p_user_id: null, p_limit: 8 });
if (rpc.error) fail("get_personalized_discussions", rpc.error.message);
else {
  const n = rpc.data?.length ?? 0;
  const sample = rpc.data?.[0];
  ok(
    "get_personalized_discussions",
    n
      ? `${n} rows · bucket=${sample?.bucket} · ${sample?.title?.slice(0, 40)}`
      : "0 rows (cold start — yorum/beğeni yetersiz)",
  );
  if (n) {
    const buckets = [...new Set((rpc.data ?? []).map((r) => r.bucket))];
    ok("bucket diversity", buckets.join(", "));
  }
}

const regress = await client.rpc("get_personalized_feed", {
  p_user_id: null,
  p_cursor: new Date().toISOString(),
  p_limit: 2,
  p_tab: "for_you",
});
if (regress.error) fail("regression get_personalized_feed", regress.error.message);
else ok("regression get_personalized_feed", `${regress.data?.length ?? 0} rows`);

console.log("\n=== Done ===");
