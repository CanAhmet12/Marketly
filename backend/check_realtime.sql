-- Supabase SQL Editor'a yapıştır → Realtime durumunu kontrol et

-- 1. Hangi tablolar Realtime'da var?
SELECT schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime';

-- 2. asset_prices yoksa manuel ekle
-- (schema.sql çalıştırdıysan zaten eklendi, tekrar çalıştırman gerekmiyor)
-- ALTER PUBLICATION supabase_realtime ADD TABLE asset_prices;
