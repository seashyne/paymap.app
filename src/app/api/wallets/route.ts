export const dynamic = "force-dynamic"
// v24.0: Multi-Wallet API
import { NextRequest } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { ok, created, handleError, zodError, badRequest, notFound } from "@/lib/api-response"
import { requireModeUser } from "@/lib/authz"

const createSchema = z.object({
  name:         z.string().min(1).max(60),
  type:         z.enum(["cash","bank","credit_card","ewallet","crypto"]),
  balance:      z.coerce.number().default(0),
  currency:     z.string().length(3).default("THB"),
  color:        z.string().optional(),
  icon:         z.string().optional(),
  bankName:     z.string().optional(),
  accountLast4: z.string().max(4).optional(),
  isDefault:    z.boolean().optional(),
})

export async function GET() {
  const auth = await requireModeUser("personal")
  if ("error" in auth) return auth.error

  const wallets = await prisma.wallet.findMany({
    where: { userId: auth.user.id, isArchived: false },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  })
  return ok(wallets.map(w => ({ ...w, balance: Number(w.balance) })))
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireModeUser("personal")
    if ("error" in auth) return auth.error

    const data = createSchema.parse(await req.json())

    // ถ้า isDefault ให้ unset wallet อื่นก่อน
    if (data.isDefault) {
      await prisma.wallet.updateMany({
        where: { userId: auth.user.id },
        data: { isDefault: false },
      })
    }

    const wallet = await prisma.wallet.create({
      data: { ...data, userId: auth.user.id },
    })
    return created({ ...wallet, balance: Number(wallet.balance) })
  } catch (e: any) {
    if (e?.name === "ZodError") return zodError(e)
    return handleError(e)
  }
}
