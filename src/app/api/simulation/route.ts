export const dynamic = "force-dynamic"
// v24.0: Financial Simulation API — v3.1: added auth + rate limiting
// จำลองอนาคต: ถ้าออมเดือนละ X บาท Y ปีจะมีเท่าไหร่
import { NextRequest } from "next/server"
import { z } from "zod"
import { ok, zodError } from "@/lib/api-response"
import { requireModeUser } from "@/lib/authz"
import { checkRateLimit } from "@/lib/rate-limit"

const schema = z.object({
  monthlySaving:  z.coerce.number().min(0),
  years:          z.coerce.number().int().min(1).max(50),
  annualReturn:   z.coerce.number().min(0).max(100).default(5),  // % ต่อปี
  initialAmount:  z.coerce.number().min(0).default(0),
  monthlyExpense: z.coerce.number().min(0).default(0),           // ค่าใช้จ่ายต่อเดือน
  inflation:      z.coerce.number().min(0).max(20).default(3),   // % เงินเฟ้อ
})

export async function POST(req: NextRequest) {
  try {
    // v3.1: require auth to prevent abuse
    const auth = await requireModeUser("personal")
    if ("error" in auth) return auth.error

    // Rate limit: 60 simulations/hour per user
    const rl = await checkRateLimit(`simulation:${auth.user.id}`, 60, 60 * 60 * 1000)
    if (!rl.allowed) return new Response(JSON.stringify({ error: "เกินโควต้า simulation กรุณารอสักครู่" }), { status: 429 })

    const data = schema.parse(await req.json())

    const monthlyRate = data.annualReturn / 100 / 12
    const months = data.years * 12
    const inflationRate = data.inflation / 100 / 12

    const timeline: Array<{
      year: number
      balance: number
      totalSaved: number
      totalReturn: number
      realValue: number
    }> = []

    let balance    = data.initialAmount
    let totalSaved = data.initialAmount
    let totalReturn= 0

    for (let m = 1; m <= months; m++) {
      const interest = balance * monthlyRate
      balance   += data.monthlySaving + interest
      totalSaved += data.monthlySaving
      totalReturn += interest

      if (m % 12 === 0) {
        const year = m / 12
        const realValue = balance / Math.pow(1 + data.inflation / 100, year) // inflation adjusted
        timeline.push({
          year,
          balance:     Math.round(balance),
          totalSaved:  Math.round(totalSaved),
          totalReturn: Math.round(totalReturn),
          realValue:   Math.round(realValue),
        })
      }
    }

    // Milestones
    const milestones: string[] = []
    const finalBalance = timeline[timeline.length - 1]?.balance ?? 0
    if (finalBalance >= 1_000_000) milestones.push(`🎯 ถึง 1 ล้านบาท ปีที่ ${timeline.find(t => t.balance >= 1_000_000)?.year ?? "?"}`)
    if (finalBalance >= 10_000_000) milestones.push(`💎 ถึง 10 ล้านบาท ปีที่ ${timeline.find(t => t.balance >= 10_000_000)?.year ?? "?"}`)
    if (data.monthlySaving > 0) {
      const breakEvenYear = timeline.find(t => t.totalReturn >= t.totalSaved)?.year
      if (breakEvenYear) milestones.push(`📈 ดอกผลเกินเงินต้น ปีที่ ${breakEvenYear}`)
    }

    return ok({
      summary: {
        finalBalance,
        totalSaved:   timeline[timeline.length - 1]?.totalSaved  ?? 0,
        totalReturn:  timeline[timeline.length - 1]?.totalReturn ?? 0,
        realValue:    timeline[timeline.length - 1]?.realValue   ?? 0,
      },
      timeline,
      milestones,
      params: data,
    })
  } catch (e: any) {
    if (e?.name === "ZodError") return zodError(e)
    throw e
  }
}
