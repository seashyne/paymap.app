-- PayMap v3: 1 account = 1 mode
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AccountMode') THEN
    CREATE TYPE "AccountMode" AS ENUM ('personal', 'business', 'merchant');
  END IF;
END $$;

ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "accountMode" "AccountMode" NOT NULL DEFAULT 'personal';
