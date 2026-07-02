export const dynamic = "force-dynamic"

import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireApiFeature } from "@/lib/subscription/api-guard"
import { ok, handleError } from "@/lib/api-response"
import { matchStatementLines } from "@/lib/reconciliation/engine"
import { z } from "zod"

const schema = z.object({
  statementId: z.string().min(1),
  tolerance: z.number().min(0).max(500).default(1),
})

export async function POST(req: NextRequest) {
  try {
    const auth = await requireApiFeature("business_reconciliation")
    if ("error" in auth) return auth.error

    const input = schema.parse(await req.json())
    const statement = await prisma.bankStatement.findFirst({
      where: { id: input.statementId, userId: auth.user.id },
      include: { lines: { orderBy: { lineNo: "asc" } } },
    })

    if (!statement) return ok({ statementId: input.statementId, matches: [], unmatchedLines: [], unmatchedTransactions: [] }, "ไม่พบ statement")

    const minDate = statement.lines.reduce((acc, line) => (line.bookedAt < acc ? line.bookedAt : acc), statement.lines[0]?.bookedAt ?? new Date())
    const maxDate = statement.lines.reduce((acc, line) => (line.bookedAt > acc ? line.bookedAt : acc), statement.lines[0]?.bookedAt ?? new Date())
    const windowStart = new Date(minDate); windowStart.setDate(windowStart.getDate() - 5)
    const windowEnd = new Date(maxDate); windowEnd.setDate(windowEnd.getDate() + 5)

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: auth.user.id,
        deletedAt: null,
        happenedAt: { gte: windowStart, lte: windowEnd },
      },
      select: { id: true, amount: true, happenedAt: true, type: true, note: true },
      orderBy: { happenedAt: "asc" },
    })

    const result = matchStatementLines(
      statement.lines.map((line) => ({
        lineNo: line.lineNo,
        bookedAt: line.bookedAt,
        description: line.description,
        reference: line.reference,
        amount: Number(line.amount),
        kind: line.kind,
      })),
      transactions.map((tx) => ({
        id: tx.id,
        amount: Number(tx.amount),
        happenedAt: tx.happenedAt,
        type: tx.type,
        note: tx.note,
      })),
      input.tolerance,
    )

    const lineMap = new Map(statement.lines.map((line) => [line.lineNo, line.id]))

    await prisma.$transaction(async (trx) => {
      await trx.reconciliationMatch.deleteMany({ where: { userId: auth.user.id, statementLine: { statementId: statement.id }, status: "matched" } })
      if (result.matches.length) {
        await trx.reconciliationMatch.createMany({
          data: result.matches.map((match) => ({
            userId: auth.user.id,
            statementLineId: lineMap.get(match.statementLineNo)!,
            transactionId: match.transactionId,
            status: "matched",
            confidence: match.confidence,
            deltaAmount: match.deltaAmount,
            deltaDays: match.deltaDays,
          })),
        })
      }
    })

    const createdMatches = await prisma.reconciliationMatch.findMany({
      where: { userId: auth.user.id, statementLine: { statementId: statement.id }, status: "matched" },
      orderBy: { createdAt: "asc" },
    })
    const matchIdMap = new Map(createdMatches.map((match) => [match.transactionId + ":" + match.statementLineId, match.id]))

    return ok({
      statementId: statement.id,
      summary: {
        totalLines: statement.lines.length,
        matched: result.matches.length,
        unmatchedLines: result.unmatchedLines.length,
        unmatchedTransactions: result.unmatchedTransactions.length,
        matchRate: statement.lines.length ? Number(((result.matches.length / statement.lines.length) * 100).toFixed(1)) : 0,
      },
      matches: result.matches.map((match) => ({ ...match, id: matchIdMap.get(match.transactionId + ":" + lineMap.get(match.statementLineNo)!) ?? null })),
      unmatchedLines: result.unmatchedLines,
      unmatchedTransactions: result.unmatchedTransactions,
    })
  } catch (error) {
    return handleError(error)
  }
}
