import { eventBus } from "@/server/events/event-bus"
import { auditLog } from "@/server/audit/audit-service"

type AnalyticsInput = {
  event: string
  workspaceId?: string
  userId?: string
  properties?: Record<string, unknown>
}

export async function trackAnalytics(input: AnalyticsInput) {
  const entry = {
    event: input.event,
    workspaceId: input.workspaceId,
    userId: input.userId,
    properties: input.properties ?? {},
    at: new Date().toISOString(),
  }

  eventBus.emit("admin.viewed", { source: "analytics.track", ...entry })

  if (input.userId) {
    await auditLog({
      actorId: input.userId,
      workspaceId: input.workspaceId,
      action: `analytics.${input.event}`,
      metadata: input.properties ?? {},
    })
  }

  if (process.env.NODE_ENV !== "production") {
    console.info("[analytics]", entry)
  }

  return entry
}

export const analytics = { track: trackAnalytics }
