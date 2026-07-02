// v24.0: Investment buy/sell/dividend transaction
import { NextRequest } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { ok, created, handleError, zodError, notFound } from "@/lib/api-response"
import { requireModeUser } from "@/lib/authz"

const txSchema = z.object({
  txType:    z.enum(["buy","sell","dividend"]),
  units:     z.coerce.number().positive(),
  price:     z.coerce.number().positive(),
  fee:       z.coerce.number().min(0).default(0),
  happenedAt:z.string().min(10),
  note:      z.string().optional(),
})

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireModeUser("personal")
    if ("error" in auth) return auth.error

    const inv = await prisma.investment.findFirst({ where: { id: params.id, userId: auth.user.id } })
    if (!inv) return notFound("ไม่พบการลงทุน")

    const data = txSchema.parse(await req.json())

    // Update avgCost using weighted average for buy; reduce units for sell
    let newUnits     = Number(inv.units)
    let newAvgCost   = Number(inv.avgCost)

    if (data.txType === "buy") {
      const totalCost = newUnits * newAvgCost + data.units * data.price + data.fee
      newUnits   += data.units
      newAvgCost  = newUnits > 0 ? totalCost / newUnits : data.price
    } else if (data.txType === "sell") {
      newUnits = Math.max(0, newUnits - data.units)
    }
    // dividend doesn't change units/cost

    await prisma.$transaction([
      prisma.investmentTx.create({
        data: {
          investmentId: params.id,
          txType:     data.txType,
          units:      data.units,
          price:      data.price,
          fee:        data.fee,
          happenedAt: new Date(data.happenedAt),
          note:       data.note ?? null,
        },
      }),
      prisma.investment.update({
        where: { id: params.id },
        data: { units: newUnits, avgCost: newAvgCost },
      }),
    ])

    return created(null, `บันทึก ${data.txType === "buy" ? "ซื้อ" : data.txType === "sell" ? "ขาย" : "เงินปันผล"} แล้ว`)
  } catch (e: any) {
    if (e?.name === "ZodError") return zodError(e)
    return handleError(e)
  }
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireModeUser("personal")
  if ("error" in auth) return auth.error

  const txs = await prisma.investmentTx.findMany({
    where:   { investmentId: params.id },
    orderBy: { happenedAt: "desc" },
  })
  return ok(txs.map(t => ({ ...t, units: Number(t.units), price: Number(t.price), fee: Number(t.fee) })))
}
