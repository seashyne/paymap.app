// PayMap v5 — Accounting Engine
// Double-entry bookkeeping: every JournalEntry must balance (debit = credit)

import { prisma } from "@/lib/prisma"

export interface JournalLine {
  accountId: string
  debit?: number
  credit?: number
  note?: string
}

export interface CreateJournalParams {
  orgId?: string
  userId: string
  description?: string
  date?: Date
  lines: JournalLine[]
  sourceType?: string   // "transaction" | "payroll" | "invoice" | "manual"
  sourceId?: string
}

/** Validate that journal lines balance (sum debit = sum credit) */
export function validateJournal(lines: JournalLine[]): void {
  const debit  = lines.reduce((s, l) => s + (l.debit  ?? 0), 0)
  const credit = lines.reduce((s, l) => s + (l.credit ?? 0), 0)
  const diff   = Math.abs(debit - credit)
  if (diff > 0.001) {
    throw new Error(`Journal not balanced — debit ${debit.toFixed(2)} ≠ credit ${credit.toFixed(2)}`)
  }
  if (lines.length < 2) {
    throw new Error("Journal must have at least 2 lines")
  }
}

/** Create a balanced journal entry in DB */
export async function createJournalEntry(params: CreateJournalParams) {
  validateJournal(params.lines)

  const entry = await prisma.journalEntry.create({
    data: {
      userId:      params.userId,
      orgId:       params.orgId ?? null,
      description: params.description ?? null,
      date:        params.date ?? new Date(),
      sourceType:  params.sourceType ?? null,
      sourceId:    params.sourceId ?? null,
      lines: {
        create: params.lines.map((l) => ({
          accountId: l.accountId,
          debit:     l.debit  ?? 0,
          credit:    l.credit ?? 0,
          note:      l.note   ?? null,
        })),
      },
    },
    include: { lines: true },
  })

  return entry
}

/** Get account balance = sum(debit) - sum(credit) for asset/expense, or credit - debit for liability/equity/revenue */
export async function getAccountBalance(accountId: string): Promise<number> {
  const result = await prisma.ledgerLine.aggregate({
    where: { accountId },
    _sum: { debit: true, credit: true },
  })
  const debit  = result._sum.debit  ?? 0
  const credit = result._sum.credit ?? 0
  return debit - credit
}

/** Trial balance for an org/user — returns all accounts with their net balance */
export async function getTrialBalance(userId: string) {
  const accounts = await prisma.chartOfAccount.findMany({
    where: { userId },
    include: {
      lines: {
        select: { debit: true, credit: true },
      },
    },
    orderBy: { code: "asc" },
  })

  return accounts.map((acc) => {
    const debit  = acc.lines.reduce((s, l) => s + (l.debit  ?? 0), 0)
    const credit = acc.lines.reduce((s, l) => s + (l.credit ?? 0), 0)
    return {
      id:      acc.id,
      code:    acc.code,
      name:    acc.name,
      type:    acc.type,
      debit,
      credit,
      balance: debit - credit,
    }
  })
}

/** Auto-create double-entry from a PayMap transaction */
export async function journalFromTransaction(tx: {
  id: string
  userId: string
  type: "income" | "expense"
  amount: number
  note?: string | null
  happenedAt: Date
  cashAccountId: string
  counterAccountId: string
}) {
  const lines: JournalLine[] =
    tx.type === "income"
      ? [
          { accountId: tx.cashAccountId,    debit:  tx.amount },
          { accountId: tx.counterAccountId, credit: tx.amount },
        ]
      : [
          { accountId: tx.counterAccountId, debit:  tx.amount },
          { accountId: tx.cashAccountId,    credit: tx.amount },
        ]

  return createJournalEntry({
    userId:      tx.userId,
    description: tx.note ?? `Transaction ${tx.id}`,
    date:        tx.happenedAt,
    sourceType:  "transaction",
    sourceId:    tx.id,
    lines,
  })
}
