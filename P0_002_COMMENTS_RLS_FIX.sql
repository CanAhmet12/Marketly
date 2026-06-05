-- P0-002: comments UPDATE RLS düzeltmesi
-- Tarih: 5 Haziran 2026
-- Problem: "Yorum begeni guncellenebilir" → UPDATE USING(true)
--          Authenticated herhangi biri herhangi bir yorum satırını güncelleyebilir.
-- Çözüm: Yalnızca yorum sahibi güncelleyebilir.
-- Not: Beğeni akışı comment_likes tablosu + RPC üzerinden; bu policy content düzenleme içindir.
-- Idempotent: güvenle tekrar çalıştırılabilir.

DROP POLICY IF EXISTS "Yorum begeni guncellenebilir" ON comments;

CREATE POLICY "Yorum sahibi guncelleyebilir"
  ON comments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
