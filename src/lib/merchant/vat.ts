// ── VAT Engine — Thai ภ.พ.30 ─────────────────────────────────────────────────
export const VAT_RATE = 0.07

export interface VatLineItem {
  amount: number        // total including VAT
  vatIncluded: boolean  // ราคารวม VAT หรือยัง
}

export function extractVat(amountIncVat: number): { base: number; vat: number } {
  const base = Math.round((amountIncVat / 1.07) * 100) / 100
  const vat  = Math.round((amountIncVat - base) * 100) / 100
  return { base, vat }
}

export function addVat(base: number): { total: number; vat: number } {
  const vat   = Math.round(base * VAT_RATE * 100) / 100
  const total = Math.round((base + vat) * 100) / 100
  return { total, vat }
}

export function calcOrderVat(items: VatLineItem[]): { subtotal: number; vatAmount: number; total: number } {
  let subtotal = 0
  let vatAmount = 0
  for (const item of items) {
    if (item.vatIncluded) {
      const { base, vat } = extractVat(item.amount)
      subtotal += base
      vatAmount += vat
    } else {
      subtotal += item.amount
      const { vat } = addVat(item.amount)
      vatAmount += vat
    }
  }
  return {
    subtotal:  Math.round(subtotal * 100) / 100,
    vatAmount: Math.round(vatAmount * 100) / 100,
    total:     Math.round((subtotal + vatAmount) * 100) / 100,
  }
}

export function buildVatReport(month: number, year: number, salesOrders: { totalAmount: number; vatAmount: number }[], purchaseOrders: { totalAmount: number; vatAmount: number }[]) {
  const totalSales     = salesOrders.reduce((s, o) => s + o.totalAmount, 0)
  const salesVat       = salesOrders.reduce((s, o) => s + o.vatAmount, 0)
  const totalPurchases = purchaseOrders.reduce((s, o) => s + o.totalAmount, 0)
  const purchaseVat    = purchaseOrders.reduce((s, o) => s + o.vatAmount, 0)
  const vatPayable     = Math.max(0, salesVat - purchaseVat)

  return { month, year, totalSales: Math.round(totalSales), salesVat: Math.round(salesVat), totalPurchases: Math.round(totalPurchases), purchaseVat: Math.round(purchaseVat), vatPayable: Math.round(vatPayable) }
}
