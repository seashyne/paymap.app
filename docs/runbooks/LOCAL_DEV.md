# Local Development Runbook

1. Copy `.env.example` to `.env.local`
2. Fill required variables
3. Run `npm install`
4. Run `npm run verify-env`
5. Run `npm run build`
6. Run `npm run dev`

Recommended stack:
- Web: Vercel
- Database: Neon PostgreSQL
- Auth: Firebase Auth
- Payments: Stripe
- Storage: Cloudflare R2
- Cache/Queue: Redis / Upstash
