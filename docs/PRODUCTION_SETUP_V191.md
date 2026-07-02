# PayMap v1.9.1 Production Setup Guide

## What changed in this build
- Personal and Business are separated more clearly.
- Personal free plan can access all core features with monthly limits.
- Pro messaging and pricing are adjusted to improve conversion.
- Homepage explains benefits and upgrade path more clearly.
- Middleware, security headers, demo control, export limits, and health checks were hardened.
- Soft delete fields were added for transactions, employees, and merchant sales orders.

## Environment variables
Create `.env.local` from `.env.example`.

### Minimum required for production
- `DATABASE_URL`
- `DIRECT_URL`
- `AUTH_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `NEXTAUTH_URL`
- `HEALTHCHECK_SECRET`
- `ENABLE_DEMO=false`

### Billing
Set Stripe keys and price ids only when you are ready to sell paid plans.

### Email
Set `RESEND_API_KEY` and `EMAIL_FROM` for password reset and verification emails.

### Redis
Set `REDIS_URL` for distributed rate limiting in production.

## Recommended production stack
- Frontend / app: Vercel
- Database: Neon PostgreSQL
- Cache / rate limit: Upstash Redis or Redis Cloud
- Email: Resend
- Billing: Stripe
- File storage later: S3 / Cloudflare R2

## Database steps
1. Review `prisma/schema.prisma`.
2. Run `npx prisma generate`.
3. Run `npx prisma db push` for a fast deploy or `npx prisma migrate dev` for migration history.
4. Seed demo data only in staging, not in production, unless you intentionally keep demo mode enabled.

## Demo policy
Production should use:
- `ENABLE_DEMO=false`

If demo mode is needed for sales, use a separate staging environment.

## Health checks
- Public liveness: `/api/health?public=1`
- Private readiness: `/api/health` with header `x-health-secret: <HEALTHCHECK_SECRET>`

## Personal product positioning
### Free
Users can access all important personal features but with monthly ceilings.
Good for acquisition and habit-building.

### Pro
Users pay to increase limits, export more often, and use heavier analytics.
This makes the upgrade feel like a real productivity unlock instead of a paywall.

## Deploy checklist
1. Remove `.env` and `.env.local` from git.
2. Add all secrets in hosting provider settings.
3. Set `ENABLE_DEMO=false`.
4. Set strong `AUTH_SECRET`.
5. Verify Stripe checkout works with server-generated success/cancel URLs.
6. Verify health endpoint protection.
7. Verify login, register, export, dashboard, and billing flows.
8. Verify Personal dashboard is the default post-login destination.
9. Verify Business routes redirect to pricing without business subscription.
10. Run smoke tests after deployment.

## Post-deploy smoke test
- Register a new personal user
- Create categories, transactions, budgets, goals
- Export transactions CSV
- Verify monthly free limit messages appear correctly
- Upgrade through Stripe in staging first
- Confirm billing page reflects active product subscription

## Known follow-up work recommended
- Add a dedicated usage table for exports, AI calls, and recurring automation instead of counting audit logs.
- Add migration files for new `deletedAt` fields.
- Add automated e2e tests for personal onboarding and billing.
- Add separate business landing page and onboarding wizard polish.
