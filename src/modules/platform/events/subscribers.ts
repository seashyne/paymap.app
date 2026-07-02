import { postMerchantSaleToJournal, postPayrollRunToJournal } from "@/lib/accounting/auto-post"
import { DOMAIN_EVENTS } from "./catalog"
import { registerDomainEventHandler } from "./bus"

let initialized = false

export function registerDefaultDomainSubscribers() {
  if (initialized) return
  initialized = true

  registerDomainEventHandler<{
    userId: string
    saleOrderId: string
    soldAt?: string | null
    totalAmount: number
    netSales: number
    vatAmount: number
    cogs: number
  }>(DOMAIN_EVENTS.merchantSaleConfirmed, async (event) => {
    await postMerchantSaleToJournal({
      userId: event.payload.userId,
      saleOrderId: event.payload.saleOrderId,
      soldAt: event.payload.soldAt ? new Date(event.payload.soldAt) : null,
      totalAmount: event.payload.totalAmount,
      netSales: event.payload.netSales,
      vatAmount: event.payload.vatAmount,
      cogs: event.payload.cogs,
    })
  })

  registerDomainEventHandler<{
    userId: string
    orgId: string
    payrollRunId: string
    paidAt?: string | null
    totalGross: number
    totalNet: number
    totalWht: number
    totalSso: number
  }>(DOMAIN_EVENTS.payrollRunPosted, async (event) => {
    await postPayrollRunToJournal({
      userId: event.payload.userId,
      orgId: event.payload.orgId,
      payrollRunId: event.payload.payrollRunId,
      paidAt: event.payload.paidAt ? new Date(event.payload.paidAt) : null,
      totalGross: event.payload.totalGross,
      totalNet: event.payload.totalNet,
      totalWht: event.payload.totalWht,
      totalSso: event.payload.totalSso,
    })
  })
}
