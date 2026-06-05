-- P0-005 — asset_prices anon/authenticated UPDATE kapatma
-- Risk: KRİTİK — mevcut "Asset prices guncellenebilir" FOR ALL USING (true) herkese yazma açar
-- Kanıt: anon PATCH asset_prices?asset_id=eq.BTC → 204, price=999999 (readiness sprint probe)
-- Rollback: FINAL_SQL.sql:771 policy geri ekle (önerilmez)
-- Fiyat güncellemesi: VPS Price API veya Edge Function service role ile (RLS bypass)

DROP POLICY IF EXISTS "Asset prices guncellenebilir" ON asset_prices;

-- Yalnızca public SELECT kalır ("Asset prices herkese acik")
-- INSERT/UPDATE/DELETE: client rolleri için policy yok → RLS deny
-- Service role (backend) RLS bypass eder
