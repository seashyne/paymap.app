export const dynamic = "force-dynamic"

import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireApiUser } from "@/lib/authz"
import { handleError } from "@/lib/api-response"

export async function GET(req: NextRequest) {
  try {
    const auth = await requireApiUser()
    if ("error" in auth) return auth.error

    const statementId = new URL(req.url).searchParams.get("statementId")
    if (!statementId) {
      return new Response("statementId is required", { status: 400 })
    }

    const rows = await prisma.reconciliationMatch.findMany({
      where: { userId: auth.user.id, statementLine: { statementId } },
      include: {
        statementLine: true,
        transaction: { select: { id: true, happenedAt: true, amount: true, type: true, note: true } },
      },
      orderBy: { createdAt: "asc" },
    })

    const csv = [
      ["lineNo", "bookedAt", "description", "statementAmount", "transactionId", "transactionDate", "transactionAmount", "status", "confidence"].join(","),
      ...rows.map((row) => [
        row.statementLine.lineNo,
        row.statementLine.bookedAt.toISOString(),
        JSON.stringify(row.statementLine.description),
        Number(row.statementLine.amount),
        row.transaction.id,
        row.transaction.happenedAt.toISOString(),
        Number(row.transaction.amount),
        row.status,
        row.confidence,
      ].join(",")),
    ].join("\n")

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="reconciliation-${statementId}.csv"`,
      },
    })
  } catch (error) {
    return handleError(error)
  }
}
