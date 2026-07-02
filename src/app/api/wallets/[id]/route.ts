// v24.0: Wallet by ID
import { NextRequest } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { ok, handleError, zodError, notFound, badRequest } from "@/lib/api-response"
import { requireModeUser } from "@/lib/authz"

const updateSchema = z.object({
  name:         z.string().min(1).max(60).optional(),
  balance:      z.coerce.number().optional(),
  color:        z.string().optional(),
  icon:         z.string().optional(),
  bankName:     z.string().optional(),
  accountLast4: z.string().max(4).optional(),
  isDefault:    z.boolean().optional(),
  isArchived:   z.boolean().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireModeUser("personal")
    if ("error" in auth) return auth.error

    const wallet = await prisma.wallet.findFirst({ where: { id: params.id, userId: auth.user.id } })
    if (!wallet) return notFound("ไม่พบกระเป๋าเงิน")

    const data = updateSchema.parse(await req.json())
    if (data.isDefault) {
      await prisma.wallet.updateMany({ where: { userId: auth.user.id }, data: { isDefault: false } })
    }

    const updated = await prisma.wallet.update({ where: { id: params.id }, data })
    return ok({ ...updated, balance: Number(updated.balance) })
  } catch (e: any) {
    if (e?.name === "ZodError") return zodError(e)
    return handleError(e)
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireModeUser("personal")
  if ("error" in auth) return auth.error

  const wallet = await prisma.wallet.findFirst({ where: { id: params.id, userId: auth.user.id } })
  if (!wallet) return notFound("ไม่พบกระเป๋าเงิน")

  // Archive แทน delete เพื่อ preserve history
  await prisma.wallet.update({ where: { id: params.id }, data: { isArchived: true } })
  return ok(null, "ลบกระเป๋าเงินแล้ว")
}
