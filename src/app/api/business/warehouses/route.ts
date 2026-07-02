export const dynamic = "force-dynamic"

import { NextRequest } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireModeUser } from "@/lib/authz"
import { created, handleError, notFound, ok } from "@/lib/api-response"
import { getOwnedBusinessOrg } from "@/lib/business-org"

const db = prisma as any

const warehouseSchema = z.object({
  code: z.string().trim().max(40).optional().nullable(),
  name: z.string().trim().min(1, "ชื่อคลังจำเป็น").max(160),
  address: z.string().trim().max(1000).optional().nullable(),
  note: z.string().trim().max(1000).optional().nullable(),
})

export async function GET() {
  try {
    const auth = await requireModeUser("business")
    if ("error" in auth) return auth.error

    const org = await getOwnedBusinessOrg(auth.user.id)
    if (!org) return notFound("ยังไม่มีองค์กรสำหรับ warehouse master")

    const warehouses = await db.warehouse.findMany({
      where: { organizationId: org.id, deletedAt: null },
      include: {
        _count: { select: { balances: true, movements: true } },
      },
      orderBy: [{ isActive: "desc" }, { name: "asc" }],
    })

    const summary = warehouses.reduce((acc: any, warehouse: any) => {
      acc.count += 1
      if (warehouse.isActive) acc.active += 1
      return acc
    }, { count: 0, active: 0 })

    return ok({
      items: warehouses.map((warehouse: any) => ({
        ...warehouse,
        productCount: warehouse._count?.balances ?? 0,
        movementCount: warehouse._count?.movements ?? 0,
      })),
      summary,
    })
  } catch (error) {
    return handleError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireModeUser("business")
    if ("error" in auth) return auth.error

    const org = await getOwnedBusinessOrg(auth.user.id)
    if (!org) return notFound("ยังไม่มีองค์กรสำหรับ warehouse master")

    const parsed = warehouseSchema.safeParse(await req.json())
    if (!parsed.success) return handleError(parsed.error)

    const warehouse = await db.warehouse.create({
      data: {
        organizationId: org.id,
        code: parsed.data.code?.trim() || null,
        name: parsed.data.name,
        address: parsed.data.address?.trim() || null,
        note: parsed.data.note?.trim() || null,
      },
      include: { _count: { select: { balances: true, movements: true } } },
    })

    return created({
      warehouse: {
        ...warehouse,
        productCount: warehouse._count?.balances ?? 0,
        movementCount: warehouse._count?.movements ?? 0,
      },
    }, "เพิ่มคลังสินค้าเรียบร้อย")
  } catch (error) {
    return handleError(error)
  }
}
