import { getBusinessInsights } from "@/lib/v13/sme-os"
import { logModuleEvent } from "@/modules/platform/observability/log"

export async function getBusinessInsightsService(userId: string) {
  const payload = await getBusinessInsights(userId)
  logModuleEvent("financial-os", "insights.loaded", { userId, insightCount: payload.insights.length })
  return payload
}
