import { analytics } from "@/server/analytics/analytics-service"

export async function trackEvent(event: string, properties?: Record<string, unknown>) {
  return analytics.track({ event, properties })
}
