import * as Sentry from "@sentry/nextjs"

let initialized = false

export function registerSentry() {
  if (initialized || !process.env.SENTRY_DSN) return
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0.1),
    environment: process.env.NODE_ENV,
    enabled: process.env.NODE_ENV === "production",
  })
  initialized = true
}

export function captureException(error: unknown, context?: Record<string, unknown>) {
  if (!process.env.SENTRY_DSN) {
    console.error("[sentry:skip]", error, context ?? {})
    return
  }
  registerSentry()
  Sentry.captureException(error, { extra: context })
}
