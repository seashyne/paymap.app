import { getAccountIdByCode } from "../infrastructure/chart-of-accounts.repository"
import { createJournalEntryService } from "./create-journal-entry.service"

export async function postMerchantSaleService(params: {
  userId: string
  saleOrderId: string
  soldAt?: Date | null
  totalAmount: number
  netSales: number
  vatAmount: number
  cogs: number
}) {
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
  ]

  const mutableLines = [...lines]
  if (Number(params.vatAmount) > 0) {
    mutableLines.push({ accountId: vatPayableId, credit: Number(params.vatAmount), note: "VAT payable" })
  }
  if (Number(params.cogs) > 0) {
    mutableLines.push({ accountId: cogsId, debit: Number(params.cogs), note: "Cost of goods sold" })
    mutableLines.push({ accountId: inventoryId, credit: Number(params.cogs), note: "Inventory reduction" })
  }

  return createJournalEntryService({
    userId: params.userId,
    description: `Merchant sale ${params.saleOrderId}`,
    date: params.soldAt ?? new Date(),
    sourceType: "merchant_sale",
    sourceId: params.saleOrderId,
    lines: mutableLines,
  })
}
