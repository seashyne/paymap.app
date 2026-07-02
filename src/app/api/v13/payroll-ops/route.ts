export const dynamic = "force-dynamic"

import { requireApiUser } from "@/lib/authz"
import { ok } from "@/lib/api-response"
import { withRouteErrorHandling } from "@/modules/platform/http/route"
import { getPayrollOpsService } from "@/modules/payroll/application/get-payroll-ops.service"

export async function GET() {
  return withRouteErrorHandling(async () => {
    const auth = await requireApiUser()
    if ("error" in auth) return auth.error
    const data = await getPayrollOpsService(auth.user.id)
    return ok(data)
  })
}
