/**
 * get_creators_directory RPC doğrulama
 * Kullanım: cd web && node scripts/verify-creators-directory-rpc.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "node:path";

config({ path: resolve(process.cwd(), ".env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (!url || !anonKey) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL veya NEXT_PUBLIC_SUPABASE_ANON_KEY eksik (.env.local)");
  process.exit(1);
}

const client = createClient(url, anonKey);

console.log("🔍 get_creators_directory RPC kontrolü\n");
console.log(`   URL: ${url}\n`);

const { data, error } = await client.rpc("get_creators_directory", { p_limit: 5 });

if (error) {
  console.error("❌ RPC hatası:", error.message);
  if (error.code === "PGRST202") {
    console.error("\n📝 Fonksiyon DB'de yok. db/P0_ALGO_SPRINT7_CREATORS.sql dosyasını Supabase SQL Editor'de çalıştırın.");
  }
  if (error.message.includes("42P13") || error.message.includes("return type")) {
    console.error("\n📝 İmza uyumsuz. SQL dosyasındaki DROP FUNCTION satırı ile tekrar çalıştırın.");
  }
  process.exit(1);
}

const rows = Array.isArray(data) ? data : [];
console.log(`✅ RPC başarılı — ${rows.length} satır döndü\n`);

if (rows.length === 0) {
  console.warn("⚠️  Boş sonuç — profiles/posts tablolarında veri olmayabilir (fallback devreye girer).");
} else {
  const sample = rows[0];
  console.log("📋 Örnek satır alanları:");
  console.log(
    JSON.stringify(
      {
        id: sample.id,
        username: sample.username,
        full_name: sample.full_name,
        is_live: sample.is_live,
        post_count: sample.post_count,
        signal_count: sample.signal_count,
        latest_title: sample.latest_title,
      },
      null,
      2,
    ),
  );
}

console.log("\n" + "=".repeat(50));
