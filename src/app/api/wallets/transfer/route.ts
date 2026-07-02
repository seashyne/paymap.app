export const dynamic = "force-dynamic"
// v24.0: Wallet Transfer API
import { NextRequest } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { ok, created, handleError, zodError, badRequest } from "@/lib/api-response"
import { requireModeUser } from "@/lib/authz"

const schema = z.object({
  fromWalletId: z.string().cuid(),
  toWalletId:   z.string().cuid(),
  amount:       z.coerce.number().positive(),
  fee:          z.coerce.number().min(0).default(0),
  note:         z.string().optional(),
  happenedAt:   z.string().min(10),
})

export async function POST(req: NextRequest) {
  try {
    const auth = await requireModeUser("personal")
    if ("error" in auth) return auth.error

    const data = schema.parse(await req.json())
    if (data.fromWalletId === data.toWalletId) return badRequest("ต้นทางและปลายทางต้องต่างกัน")

    const [from, to] = await Promise.all([
      prisma.wallet.findFirst({ where: { id: data.fromWalletId, userId: auth.user.id } }),
      prisma.wallet.findFirst({ where: { id: data.toWalletId,   userId: auth.user.id } }),
    ])
    if (!from || !to) return badRequest("ไม่พบกระเป๋าเงินที่ระบุ")

    const totalDeduct = data.amount + data.fee
    if (Number(from.balance) < totalDeduct) return badRequest("ยอดเงินในกระเป๋าไม่เพียงพอ")

    // Transaction: deduct from → add to → create record
    const [transfer] = await prisma.$transaction([
      prisma.walletTransfer.create({
        data: {
          userId:       auth.user.id,
          fromWalletId: data.fromWalletId,
          toWalletId:   data.toWalletId,
          amount:       data.amount,
          fee:          data.fee,
          note:         data.note ?? null,
          happenedAt:   new Date(data.happenedAt),
        },
      }),
      prisma.wallet.update({ where: { id: data.fromWalletId }, data: { balance: { decrement: totalDeduct } } }),
      prisma.wallet.update({ where: { id: data.toWalletId },   data: { balance: { increment: data.amount } } }),
    ])
    return created(transfer, "โอนเงินสำเร็จ")
  } catch (e: any) {
    if (e?.name === "ZodError") return zodError(e)
    return handleError(e)
  }
}

export async function GET(req: NextRequest) {
  const auth = await requireModeUser("personal")
  if ("error" in auth) return auth.error

  const transfers = await prisma.walletTransfer.findMany({
    where: { userId: auth.user.id },
    orderBy: { happenedAt: "desc" },
    take: 50,
    include: {
      fromWallet: { select: { id: true, name: true, icon: true, color: true } },
      toWallet:   { select: { id: true, name: true, icon: true, color: true } },
    },
  })
  return ok(transfers.map(t => ({ ...t, amount: Number(t.amount), fee: Number(t.fee) })))
}
