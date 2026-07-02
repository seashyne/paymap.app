export const dynamic = "force-dynamic"

import { requireApiUser } from "@/lib/authz"
import { ok, handleError } from "@/lib/api-response"
import { getFinancialForecast } from "@/lib/v13/sme-os"

export async function GET() {
  try {
    const auth = await requireApiUser()
    if ("error" in auth) return auth.error
    const data = await getFinancialForecast(auth.user.id)
    return ok(data)
  } catch (error) {
    return handleError(error)
  }
}
