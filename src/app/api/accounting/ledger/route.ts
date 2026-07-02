// PayMap v5 — Ledger & Trial Balance API
export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { requireApiFeature } from "@/lib/subscription/api-guard"
import { prisma } from "@/lib/prisma"
import { getTrialBalance } from "@/lib/accounting/engine"
import { ok, handleError } from "@/lib/api-response"

// GET /api/accounting/ledger?accountId=xxx  — account ledger detail
// GET /api/accounting/ledger?trial=1        — trial balance
export async function GET(req: NextRequest) {
  try {
    const auth = await requireApiFeature("business_accounting")
    if ("error" in auth) return auth.error

    const { searchParams } = new URL(req.url)
    const trial     = searchParams.get("trial") === "1"
    const accountId = searchParams.get("accountId")

    if (trial) {
      const balance = await getTrialBalance(auth.user.id)
      const totalDebit  = balance.reduce((s, a) => s + a.debit, 0)
      const totalCredit = balance.reduce((s, a) => s + a.credit, 0)
      return ok({ accounts: balance, totalDebit, totalCredit, balanced: Math.abs(totalDebit - totalCredit) < 0.01 })
    }

    if (accountId) {
      const account = await prisma.chartOfAccount.findFirst({
        where: { id: accountId, userId: auth.user.id },
      })
      if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 })

      const lines = await prisma.ledgerLine.findMany({
        where:   { accountId },
        include: { journal: { select: { description: true, date: true, sourceType: true, sourceId: true } } },
        orderBy: { journal: { date: "desc" } },
      })

      const runningBalance = lines.reduce((s, l) => s + (l.debit ?? 0) - (l.credit ?? 0), 0)
      return ok({ account, lines, balance: runningBalance })
    }

    // List all accounts
    const accounts = await prisma.chartOfAccount.findMany({
      where:   { userId: auth.user.id },
      orderBy: { code: "asc" },
    })
    return ok({ accounts })
  } catch (err: any) {
    return handleError(err)
  }
}

// POST /api/accounting/ledger — create chart of account
export async function POST(req: NextRequest) {
  try {
    const auth = await requireApiFeature("business_accounting")
    if ("error" in auth) return auth.error

    const body = await req.json()
    const { code, name, nameTH, type } = body
    if (!code || !name || !type) {
      return NextResponse.json({ error: "code, name, type are required" }, { status: 400 })
    }

    const exists = await prisma.chartOfAccount.findFirst({ where: { userId: auth.user.id, code } })
    if (exists) return NextResponse.json({ error: `Account code ${code} already exists` }, { status: 409 })

    const account = await prisma.chartOfAccount.create({
      data: { userId: auth.user.id, code, name, nameTH: nameTH ?? name, type },
    })

    return NextResponse.json({ ok: true, account }, { status: 201 })
  } catch (err: any) {
    return handleError(err)
  }
}
