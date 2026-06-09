-- Settings S6: Web tercihleri (bildirim/gizlilik/görünüm/güvenlik) profiles JSONB
-- Supabase SQL Editor'da bir kez çalıştır.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS web_settings_json JSONB NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN profiles.web_settings_json IS
  'Web ayarları: notifications (push/email hariç), privacy, appearance, security';
