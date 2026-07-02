// v24.0: Record installment payment
import { NextRequest } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { ok, handleError, zodError, notFound, badRequest } from "@/lib/api-response"
import { requireModeUser } from "@/lib/authz"
import { grantXP } from "@/lib/gamification"

const paySchema = z.object({
  amount:  z.coerce.number().positive(),
  paidAt:  z.string().min(10),
  note:    z.string().optional(),
})

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireModeUser("personal")
    if ("error" in auth) return auth.error

    const item = await prisma.installment.findFirst({ where: { id: params.id, userId: auth.user.id } })
    if (!item) return notFound("ไม่พบรายการผ่อนชำระ")
    if (item.status !== "active") return badRequest("รายการนี้ไม่ได้อยู่ในสถานะ active")

    const data = paySchema.parse(await req.json())
    const newPaid = item.paidMonths + 1

    // คำนวณ nextDueDate ถัดไป
    const nextDue = new Date(item.nextDueDate)
    nextDue.setMonth(nextDue.getMonth() + 1)

    const isCompleted = newPaid >= item.totalMonths

    await prisma.$transaction([
      prisma.installmentPayment.create({
        data: {
          installmentId: params.id,
          amount:        data.amount,
          paidAt:        new Date(data.paidAt),
          note:          data.note ?? null,
        },
      }),
      prisma.installment.update({
        where: { id: params.id },
        data: {
          paidMonths:  newPaid,
          nextDueDate: isCompleted ? item.nextDueDate : nextDue,
          status:      isCompleted ? "completed" : "active",
        },
      }),
    ])

    await grantXP(auth.user.id, 5, "installment_payment")

    return ok({ paidMonths: newPaid, isCompleted }, isCompleted ? "ผ่อนชำระครบแล้ว 🎉" : `จ่ายงวดที่ ${newPaid} แล้ว`)
  } catch (e: any) {
    if (e?.name === "ZodError") return zodError(e)
    return handleError(e)
  }
}
