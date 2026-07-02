-- PayMap v4.2.1 R2 branding fields
ALTER TABLE stores ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS banner_url TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS theme_color TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS background_url TEXT;

CREATE INDEX IF NOT EXISTS stores_user_id_created_at_idx ON stores(user_id, created_at);
