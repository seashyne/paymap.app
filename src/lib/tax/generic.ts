import type { TaxInput, TaxResult } from "./index"

export function Generic_TaxEngine(country: string, input: TaxInput): TaxResult {
  const total   = input.totalIncome
  const personal= input.personalAllowance ?? 0
  const taxable = Math.max(0, total - personal)
  const tax     = taxable * 0.20 // conservative flat 20%
  return {
    country, currency:"USD", totalIncome:total, totalDeductions:personal, taxableIncome:taxable,
    tax:Math.round(tax), effectiveRate:total>0?(tax/total)*100:0,
    brackets:[{ bracket:"Flat 20%", amount:taxable, rate:20, tax }],
    deductionSummary:{ personal }, suggestions:[],
    note:"Tax calculation for this country is not yet fully implemented. Showing a 20% flat estimate only.",
  }
}
