import { prisma } from "@/lib/prisma"
import { createJournalEntry } from "@/lib/accounting/engine"
import { DEFAULT_CHART_OF_ACCOUNTS } from "@/lib/accounting/chart-of-accounts"

async function ensureDefaultAccounts(userId: string) {
  const existing = await prisma.chartOfAccount.findMany({ where: { userId }, select: { code: true } })
  const existingCodes = new Set(existing.map((item) => item.code))
  const missing = DEFAULT_CHART_OF_ACCOUNTS.filter((item) => !existingCodes.has(item.code))
  if (!missing.length) return

  await prisma.chartOfAccount.createMany({
    data: missing.map((item) => ({
      userId,
      code: item.code,
      name: item.name,
      nameTH: item.nameTH,
      type: item.type,
      isSystem: true,
    })),
    skipDuplicates: true,
  })
}

async function getAccountIdByCode(userId: string, code: string) {
  await ensureDefaultAccounts(userId)
  const account = await prisma.chartOfAccount.findFirst({ where: { userId, code }, select: { id: true } })
  if (!account) throw new Error(`Missing chart of account ${code}`)
  return account.id
}

export async function postPayrollRunToJournal(params: {
  userId: string
  orgId: string
  payrollRunId: string
  paidAt?: Date | null
  totalGross: number
  totalNet: number
  totalWht: number
  totalSso: number
}) {
  const existing = await prisma.journalEntry.findFirst({
    where: { userId: params.userId, sourceType: "payroll_paid", sourceId: params.payrollRunId },
    select: { id: true },
  })
  if (existing) return existing

  const [bankAccountId, salaryExpenseId, payableId] = await Promise.all([
    getAccountIdByCode(params.userId, "1110"),
    getAccountIdByCode(params.userId, "5200"),
    getAccountIdByCode(params.userId, "2100"),
  ])

  const liabilities = Math.max(0, Number(params.totalWht) + Number(params.totalSso))
  const lines: { accountId: string; debit?: number; credit?: number; note?: string }[] = [
    { accountId: salaryExpenseId, debit: Number(params.totalGross), note: "Payroll gross expense" },
    { accountId: bankAccountId, credit: Number(params.totalNet), note: "Payroll paid to employees" },
  ]

  if (liabilities > 0) {
    lines.push({ accountId: payableId, credit: liabilities, note: "SSO / withholding tax payable" })
  }

  return createJournalEntry({
    userId: params.userId,
    orgId: params.orgId,
    description: `Payroll payment ${params.payrollRunId}`,
    date: params.paidAt ?? new Date(),
    sourceType: "payroll_paid",
    sourceId: params.payrollRunId,
    lines,
  })
}

export async function postMerchantSaleToJournal(params: {
  userId: string
  saleOrderId: string
  soldAt?: Date | null
  totalAmount: number
  netSales: number
  vatAmount: number
  cogs: number
}) {
  const existing = await prisma.journalEntry.findFirst({
    where: { userId: params.userId, sourceType: "merchant_sale", sourceId: params.saleOrderId },
    select: { id: true },
  })
  if (existing) return existing

  const [bankAccountId, salesRevenueId, vatPayableId, cogsId, inventoryId] = await Promise.all([
    getAccountIdByCode(params.userId, "1110"),
    getAccountIdByCode(params.userId, "4100"),
    getAccountIdByCode(params.userId, "2300"),
    getAccountIdByCode(params.userId, "5100"),
    getAccountIdByCode(params.userId, "1300"),
  ])

  const lines = [
    { accountId: bankAccountId, debit: Number(params.totalAmount), note: "Merchant sale receipt" },
    { accountId: salesRevenueId, credit: Number(params.netSales), note: "Merchant sales revenue" },
  ] as { accountId: string; debit?: number; credit?: number; note?: string }[]

  if (Number(params.vatAmount) > 0) {
    lines.push({ accountId: vatPayableId, credit: Number(params.vatAmount), note: "VAT payable" })
  }
  if (Number(params.cogs) > 0) {
    lines.push({ accountId: cogsId, debit: Number(params.cogs), note: "Cost of goods sold" })
    lines.push({ accountId: inventoryId, credit: Number(params.cogs), note: "Inventory reduction" })
  }

  return createJournalEntry({
    userId: params.userId,
    description: `Merchant sale ${params.saleOrderId}`,
    date: params.soldAt ?? new Date(),
    sourceType: "merchant_sale",
    sourceId: params.saleOrderId,
    lines,
  })
}
