# PayMap v12 Production SaaS Core Pack

This pack adds the core production layers requested for the next release:

- BullMQ-ready queue foundation with Redis fallback
- Rate limiting policies in middleware for auth, billing, notifications, and realtime routes
- Sentry-ready instrumentation helper
- Billing usage limits API and billing UI capacity cards
- CQRS-lite cached dashboard read model
- Improved audit log UI for admins
- Notification service helper with queue hook
- Onboarding copy refresh for faster value delivery
- Landing overview bug removed with a simpler production-safe preview panel

## Notes

This is a best-effort integration pass from the uploaded repository. It has not been fully runtime-verified against live Stripe, Firebase, Redis, and database services in this environment.
