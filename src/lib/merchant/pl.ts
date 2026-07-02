// ── P&L Calculator ────────────────────────────────────────────────────────────

export interface PLInput {
  totalSales: number       // รายได้จากขาย (ก่อน VAT)
  totalCogs: number        // ต้นทุนสินค้า (COGS)
  operatingExpenses?: number
  vatPayable?: number
}

export interface PLResult {
  revenue: number
  cogs: number
  grossProfit: number
  grossMargin: number      // %
  operatingExpenses: number
  ebitda: number
  vatPayable: number
  netProfit: number
  netMargin: number        // %
}

export function calcPL(input: PLInput): PLResult {
  const revenue = input.totalSales
  const cogs = input.totalCogs
  const grossProfit = revenue - cogs
  const grossMargin = revenue > 0 ? Math.round((grossProfit / revenue) * 10000) / 100 : 0
  const operatingExpenses = input.operatingExpenses ?? 0
  const ebitda = grossProfit - operatingExpenses
  const vatPayable = input.vatPayable ?? 0
  const netProfit = ebitda - vatPayable
  const netMargin = revenue > 0 ? Math.round((netProfit / revenue) * 10000) / 100 : 0

  return { revenue, cogs, grossProfit, grossMargin, operatingExpenses, ebitda, vatPayable, netProfit, netMargin }
}

export function calcProductMargin(salePrice: number, costPrice: number) {
  const profit = salePrice - costPrice
  const margin = salePrice > 0 ? Math.round((profit / salePrice) * 10000) / 100 : 0
  return { profit, margin, salePrice, costPrice }
}

export function detectLowStock(products: { id: string; name: string; sku?: string | null; stockQty: number; minStockQty: number }[]) {
  return products.filter(p => p.stockQty <= p.minStockQty).sort((a, b) => a.stockQty - b.stockQty)
}

export function calcReorderSuggestion(product: { stockQty: number; minStockQty: number }, avgDailySales: number, leadTimeDays = 7): number {
  const safetyStock = avgDailySales * leadTimeDays
  const target = product.minStockQty + safetyStock
  return Math.max(0, Math.ceil(target - product.stockQty))
}
