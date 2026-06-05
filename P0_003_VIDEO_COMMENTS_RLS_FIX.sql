-- P0-003: video_comments UPDATE RLS düzeltmesi
-- Tarih: 5 Haziran 2026
-- Problem: "User video yorum begenisini guncelleyebilir" → UPDATE USING(true) WITH CHECK(true)
--          Anon dahil herkes herhangi bir video yorumunu güncelleyebilir (canlı test doğrulandı).
-- Çözüm: Yalnızca yorum sahibi güncelleyebilir.
-- Not: increment_video_comment_likes RPC SECURITY DEFINER — RLS bypass, beğeni akışı korunur.
-- Idempotent: güvenle tekrar çalıştırılabilir.

DROP POLICY IF EXISTS "User video yorum begenisini guncelleyebilir" ON video_comments;

CREATE POLICY "Video yorum sahibi guncelleyebilir"
  ON video_comments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
