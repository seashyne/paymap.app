// PayMap v5 — Bank Reconciliation API
// จับคู่ bank statement กับ transactions ใน PayMap อัตโนมัติ
export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { requireApiFeature } from "@/lib/subscription/api-guard"
import { prisma } from "@/lib/prisma"
import { ok, handleError } from "@/lib/api-response"
import { z } from "zod"

const bankTxSchema = z.object({
  date:        z.string(),
  description: z.string(),
  amount:      z.number(),
  type:        z.enum(["credit", "debit"]),  // credit = money in, debit = money out
  ref:         z.string().optional(),
})

const reconcileSchema = z.object({
  walletId:     z.string().optional(),
  bankTxs:      z.array(bankTxSchema),
  fromDate:     z.string(),
  toDate:       z.string(),
  tolerance:    z.number().optional().default(1), // baht tolerance for matching
})

// POST /api/accounting/reconcile — match bank statement with PayMap transactions
export async function POST(req: NextRequest) {
  try {
    const auth = await requireApiFeature("business_reconciliation")
    if ("error" in auth) return auth.error

    const body = await req.json()
    const parsed = reconcileSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const { walletId, bankTxs, fromDate, toDate, tolerance } = parsed.data

    // Fetch PayMap transactions in date range
    const paymapTxs = await prisma.transaction.findMany({
      where: {
        userId:    auth.user.id,
        deletedAt: null,
        happenedAt: {
          gte: new Date(fromDate),
          lte: new Date(toDate),
        },
        ...(walletId ? { walletId } : {}),
      },
      orderBy: { happenedAt: "asc" },
    })

    const matched:   Array<{ bankTx: z.infer<typeof bankTxSchema>; paymapTxId: string; delta: number }> = []
    const unmatched: Array<z.infer<typeof bankTxSchema>> = []
    const usedIds = new Set<string>()

    for (const bTx of bankTxs) {
      const bAmount = Math.abs(bTx.amount)
      const bDate   = new Date(bTx.date)
      const bType   = bTx.type === "credit" ? "income" : "expense"

      // Find closest PayMap tx by amount + date + type
      const candidate = paymapTxs.find((pTx) => {
        if (usedIds.has(pTx.id)) return false
        if (pTx.type !== bType) return false
        const delta = Math.abs(Number(pTx.amount) - bAmount)
        if (delta > tolerance) return false
        const daysDiff = Math.abs((pTx.happenedAt.getTime() - bDate.getTime()) / 86400000)
        return daysDiff <= 3 // within 3 days
      })

      if (candidate) {
        const delta = Math.abs(Number(candidate.amount) - bAmount)
        matched.push({ bankTx: bTx, paymapTxId: candidate.id, delta })
        usedIds.add(candidate.id)
      } else {
        unmatched.push(bTx)
      }
    }

    const unmatchedPaymap = paymapTxs.filter((t) => !usedIds.has(t.id))

    return ok({
      summary: {
        bankTxCount:         bankTxs.length,
        matchedCount:        matched.length,
        unmatchedBankCount:  unmatched.length,
        unmatchedPaymapCount: unmatchedPaymap.length,
        matchRate:           bankTxs.length > 0 ? Math.round((matched.length / bankTxs.length) * 100) : 0,
      },
      matched,
      unmatchedBank:   unmatched,
      unmatchedPaymap: unmatchedPaymap.map((t) => ({
        id:     t.id,
        date:   t.happenedAt,
        amount: t.amount,
        type:   t.type,
        note:   t.note,
      })),
    })
  } catch (err: any) {
    console.error("[reconcile]", err)
    return handleError(err)
  }
}
