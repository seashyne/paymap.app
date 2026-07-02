-- v2.3.1 renewal-fix: add renewalNotifiedAt to subscriptions
-- Run after deploying v2.3.1

ALTER TABLE "subscriptions"
  ADD COLUMN IF NOT EXISTS "renewalNotifiedAt" TIMESTAMP(3);
