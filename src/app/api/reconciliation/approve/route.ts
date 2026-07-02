export const dynamic = "force-dynamic"

import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireApiFeature } from "@/lib/subscription/api-guard"
import { ok, handleError } from "@/lib/api-response"
import { z } from "zod"

const schema = z.object({ matchIds: z.array(z.string()).min(1) })

export async function POST(req: NextRequest) {
  try {
    const auth = await requireApiFeature("business_reconciliation")
    if ("error" in auth) return auth.error

    const input = schema.parse(await req.json())
    const now = new Date()

    const updated = await prisma.reconciliationMatch.updateMany({
      where: { id: { in: input.matchIds }, userId: auth.user.id },
      data: { status: "approved", approvedAt: now, approvedById: auth.user.id },
    })

    return ok({ approved: updated.count, approvedAt: now.toISOString() }, "อนุมัติ reconciliation แล้ว")
  } catch (error) {
    return handleError(error)
  }
}
