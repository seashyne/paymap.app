export const dynamic = "force-dynamic"
// v24.0: Investment Tracker API
import { NextRequest } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { ok, created, handleError, zodError } from "@/lib/api-response"
import { requireModeUser } from "@/lib/authz"

const createSchema = z.object({
  name:         z.string().min(1).max(100),
  ticker:       z.string().max(20).optional(),
  type:         z.enum(["stock","fund","crypto","etf","bond","other"]),
  units:        z.coerce.number().min(0).default(0),
  avgCost:      z.coerce.number().min(0).default(0),
  currentPrice: z.coerce.number().min(0).default(0),
  currency:     z.string().length(3).default("THB"),
  exchange:     z.string().optional(),
  icon:         z.string().optional(),
  color:        z.string().optional(),
  note:         z.string().optional(),
})

function calcStats(inv: any) {
  const units        = Number(inv.units)
  const avgCost      = Number(inv.avgCost)
  const currentPrice = Number(inv.currentPrice)
  const costBasis    = units * avgCost
  const marketValue  = units * currentPrice
  const unrealizedPL = marketValue - costBasis
  const returnPct    = costBasis > 0 ? (unrealizedPL / costBasis) * 100 : 0
  return { ...inv, units, avgCost, currentPrice, costBasis, marketValue, unrealizedPL, returnPct: Number(returnPct.toFixed(2)) }
}

export async function GET() {
  const auth = await requireModeUser("personal")
  if ("error" in auth) return auth.error

  const items = await prisma.investment.findMany({
    where:   { userId: auth.user.id },
    orderBy: { createdAt: "asc" },
    include: { transactions: { orderBy: { happenedAt: "desc" }, take: 10 } },
  })

  const portfolio = items.map(calcStats)
  const totalCost   = portfolio.reduce((s, i) => s + i.costBasis, 0)
  const totalMarket = portfolio.reduce((s, i) => s + i.marketValue, 0)

  return ok({
    portfolio,
    summary: {
      totalCost,
      totalMarket,
      totalPL:     totalMarket - totalCost,
      totalReturn: totalCost > 0 ? ((totalMarket - totalCost) / totalCost) * 100 : 0,
    },
  })
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireModeUser("personal")
    if ("error" in auth) return auth.error

    const data = createSchema.parse(await req.json())
    const item = await prisma.investment.create({ data: { userId: auth.user.id, ...data } })
    return created(calcStats(item), "เพิ่มการลงทุนแล้ว")
  } catch (e: any) {
    if (e?.name === "ZodError") return zodError(e)
    return handleError(e)
  }
}
