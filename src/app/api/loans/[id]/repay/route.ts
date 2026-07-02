// v24.0: Loan repayment
import { NextRequest } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { ok, handleError, zodError, notFound, badRequest } from "@/lib/api-response"
import { requireModeUser } from "@/lib/authz"

const repaySchema = z.object({
  amount: z.coerce.number().positive(),
  paidAt: z.string().min(10),
  note:   z.string().optional(),
})

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireModeUser("personal")
    if ("error" in auth) return auth.error

    const loan = await prisma.loan.findFirst({ where: { id: params.id, userId: auth.user.id } })
    if (!loan) return notFound("ไม่พบรายการยืมเงิน")
    if (loan.status === "settled") return badRequest("รายการนี้ชำระครบแล้ว")

    const data = repaySchema.parse(await req.json())
    if (data.amount > Number(loan.remaining)) return badRequest(`ยอดคืนเกินกว่าที่เหลือ (${Number(loan.remaining)} ${loan.currency})`)

    const newRemaining = Number(loan.remaining) - data.amount
    const isSettled = newRemaining <= 0

    await prisma.$transaction([
      prisma.loanRepayment.create({
        data: {
          loanId: params.id,
          amount: data.amount,
          paidAt: new Date(data.paidAt),
          note:   data.note ?? null,
        },
      }),
      prisma.loan.update({
        where: { id: params.id },
        data: {
          remaining: newRemaining,
          status:    isSettled ? "settled" : "active",
        },
      }),
    ])

    return ok({ remaining: newRemaining, isSettled }, isSettled ? "ชำระครบแล้ว ✓" : `บันทึกการคืนเงินแล้ว`)
  } catch (e: any) {
    if (e?.name === "ZodError") return zodError(e)
    return handleError(e)
  }
}
