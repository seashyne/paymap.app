// PayMap v5.1 — Financial Reports API
// GET /api/accounting/reports?type=pl|bs|cf&from=YYYY-MM-DD&to=YYYY-MM-DD
export const dynamic = "force-dynamic"
import { NextRequest } from "next/server"
import { requireApiUser } from "@/lib/authz"
import { ok, handleError } from "@/lib/api-response"
import {
  getProfitAndLoss,
  getBalanceSheet,
  getCashFlowStatement,
} from "@/lib/accounting/reports"

export async function GET(req: NextRequest) {
  try {
    const auth = await requireApiUser()
    if ("error" in auth) return auth.error

    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type") ?? "pl"          // pl | bs | cf
    const fromParam = searchParams.get("from")
    const toParam   = searchParams.get("to")

    // Default: current month
    const now   = new Date()
    const from  = fromParam ? new Date(fromParam) : new Date(now.getFullYear(), now.getMonth(), 1)
    const to    = toParam   ? new Date(toParam)   : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    if (type === "pl") {
      const report = await getProfitAndLoss(auth.user.id, { from, to })
      return ok(report)
    }

    if (type === "bs") {
      const report = await getBalanceSheet(auth.user.id, to)
      return ok(report)
    }

    if (type === "cf") {
      const report = await getCashFlowStatement(auth.user.id, { from, to })
      return ok(report)
    }

    // all 3 at once
    if (type === "all") {
      const [pl, bs, cf] = await Promise.all([
        getProfitAndLoss(auth.user.id, { from, to }),
        getBalanceSheet(auth.user.id, to),
        getCashFlowStatement(auth.user.id, { from, to }),
      ])
      return ok({ pl, bs, cf })
    }

    return ok({ error: "type must be pl | bs | cf | all" })
  } catch (err: any) {
    return handleError(err)
  }
}
