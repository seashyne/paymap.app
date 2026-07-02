import { getFinancialOsSummary } from "@/lib/v13/sme-os"
import { logModuleEvent } from "@/modules/platform/observability/log"

export async function getFinancialSummaryService(userId: string) {
  const summary = await getFinancialOsSummary(userId)
  logModuleEvent("financial-os", "summary.loaded", { userId, hasOrg: Boolean(summary.org), hasStore: Boolean(summary.store) })
  return summary
}
