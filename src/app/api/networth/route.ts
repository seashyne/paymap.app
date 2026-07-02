export const dynamic = "force-dynamic"
// v24.0: Net Worth System API
import { NextRequest } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { ok, created, handleError, zodError, notFound } from "@/lib/api-response"
import { requireModeUser } from "@/lib/authz"

const assetSchema = z.object({
  name:     z.string().min(1).max(100),
  type:     z.enum(["cash","stock","crypto","property","vehicle","fund","other"]),
  value:    z.coerce.number().min(0),
  currency: z.string().length(3).default("THB"),
  icon:     z.string().optional(),
  color:    z.string().optional(),
  note:     z.string().optional(),
  asOfDate: z.string().optional(),
})

const liabilitySchema = z.object({
  name:     z.string().min(1).max(100),
  type:     z.enum(["credit_card","mortgage","car_loan","personal_loan","other"]),
  amount:   z.coerce.number().min(0),
  currency: z.string().length(3).default("THB"),
  icon:     z.string().optional(),
  color:    z.string().optional(),
  note:     z.string().optional(),
  asOfDate: z.string().optional(),
})

export async function GET() {
  const auth = await requireModeUser("personal")
  if ("error" in auth) return auth.error

  const [assets, liabilities, snapshots] = await Promise.all([
    prisma.asset.findMany({
      where: { userId: auth.user.id },
      orderBy: { value: "desc" },
    }),
    prisma.liability.findMany({
      where: { userId: auth.user.id },
      orderBy: { amount: "desc" },
    }),
    prisma.netWorthSnapshot.findMany({
      where: { userId: auth.user.id },
      orderBy: { snapshotAt: "asc" },
      take: 12,
    }),
  ])

  const totalAssets = assets.reduce((sum, a) => sum + Number(a.value), 0)
  const totalDebt   = liabilities.reduce((sum, l) => sum + Number(l.amount), 0)
  const netWorth    = totalAssets - totalDebt

  return ok({
    assets:      assets.map(a => ({ ...a, value: Number(a.value) })),
    liabilities: liabilities.map(l => ({ ...l, amount: Number(l.amount) })),
    summary:     { totalAssets, totalDebt, netWorth },
    history:     snapshots.map(s => ({
      ...s,
      totalAssets: Number(s.totalAssets),
      totalDebt:   Number(s.totalDebt),
      netWorth:    Number(s.netWorth),
    })),
  })
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireModeUser("personal")
    if ("error" in auth) return auth.error

    const sp   = req.nextUrl.searchParams
    const kind = sp.get("kind") // "asset" | "liability"
    const body = await req.json()

    if (kind === "liability") {
      const data = liabilitySchema.parse(body)
      const item = await prisma.liability.create({
        data: { userId: auth.user.id, ...data, amount: data.amount, asOfDate: data.asOfDate ? new Date(data.asOfDate) : new Date() },
      })
      await snapshotNetWorth(auth.user.id)
      return created({ ...item, amount: Number(item.amount) }, "เพิ่มหนี้สินแล้ว")
    }

    // default: asset
    const data = assetSchema.parse(body)
    const item = await prisma.asset.create({
      data: { userId: auth.user.id, ...data, asOfDate: data.asOfDate ? new Date(data.asOfDate) : new Date() },
    })
    await snapshotNetWorth(auth.user.id)
    return created({ ...item, value: Number(item.value) }, "เพิ่มทรัพย์สินแล้ว")
  } catch (e: any) {
    if (e?.name === "ZodError") return zodError(e)
    return handleError(e)
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireModeUser("personal")
  if ("error" in auth) return auth.error

  const sp   = req.nextUrl.searchParams
  const kind = sp.get("kind")
  const id   = sp.get("id")
  if (!id) return ok(null, "id required")

  if (kind === "liability") {
    await prisma.liability.deleteMany({ where: { id, userId: auth.user.id } })
  } else {
    await prisma.asset.deleteMany({ where: { id, userId: auth.user.id } })
  }
  await snapshotNetWorth(auth.user.id)
  return ok(null, "ลบแล้ว")
}

// Helper: save monthly snapshot
async function snapshotNetWorth(userId: string) {
  const [assets, liabilities] = await Promise.all([
    prisma.asset.findMany({ where: { userId } }),
    prisma.liability.findMany({ where: { userId } }),
  ])
  const totalAssets = assets.reduce((s, a) => s + Number(a.value), 0)
  const totalDebt   = liabilities.reduce((s, l) => s + Number(l.amount), 0)
  await prisma.netWorthSnapshot.create({
    data: { userId, totalAssets, totalDebt, netWorth: totalAssets - totalDebt },
  })
}
