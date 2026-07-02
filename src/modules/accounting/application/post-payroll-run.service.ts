import { getAccountIdByCode } from "../infrastructure/chart-of-accounts.repository"
import { createJournalEntryService } from "./create-journal-entry.service"

export async function postPayrollRunService(params: {
  userId: string
  orgId: string
  payrollRunId: string
  paidAt?: Date | null
  totalGross: number
  totalNet: number
  totalWht: number
  totalSso: number
}) {
  const [bankAccountId, salaryExpenseId, payableId] = await Promise.all([
    getAccountIdByCode(params.userId, "1110"),
    getAccountIdByCode(params.userId, "5200"),
    getAccountIdByCode(params.userId, "2100"),
  ])

  const liabilities = Math.max(0, Number(params.totalWht) + Number(params.totalSso))
  const lines = [
    { accountId: salaryExpenseId, debit: Number(params.totalGross), note: "Payroll gross expense" },
    { accountId: bankAccountId, credit: Number(params.totalNet), note: "Payroll paid to employees" },
  ] as { accountId: string; debit?: number; credit?: number; note?: string }[]

  if (liabilities > 0) {
    lines.push({ accountId: payableId, credit: liabilities, note: "SSO / withholding tax payable" })
  }

  return createJournalEntryService({
    userId: params.userId,
    orgId: params.orgId,
    description: `Payroll payment ${params.payrollRunId}`,
    date: params.paidAt ?? new Date(),
    sourceType: "payroll_paid",
    sourceId: params.payrollRunId,
    lines,
  })
}
