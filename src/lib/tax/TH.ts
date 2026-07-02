import type { TaxInput, TaxResult } from "./index"

const BRACKETS = [
  { min:0,         max:150_000,    rate:0    },
  { min:150_001,   max:300_000,    rate:0.05 },
  { min:300_001,   max:500_000,    rate:0.10 },
  { min:500_001,   max:750_000,    rate:0.15 },
  { min:750_001,   max:1_000_000,  rate:0.20 },
  { min:1_000_001, max:2_000_000,  rate:0.25 },
  { min:2_000_001, max:5_000_000,  rate:0.30 },
  { min:5_000_001, max:Infinity,   rate:0.35 },
]

function progressive(taxable: number) {
  let tax = 0; const breakdown: Array<{ bracket: string; amount: number; rate: number; tax: number }> = []
  for (const b of BRACKETS) {
    if (taxable <= b.min) break
    const amt = Math.min(taxable, b.max) - b.min
    const t   = amt * b.rate; tax += t
    if (amt > 0) breakdown.push({
      bracket: b.max === Infinity ? `${b.min.toLocaleString()}+` : `${b.min.toLocaleString()}–${b.max.toLocaleString()}`,
      amount: amt, rate: b.rate * 100, tax: t,
    })
  }
  return { tax, breakdown }
}

export function TH_TaxEngine(input: TaxInput): TaxResult {
  const salary = input.salaryIncome ?? input.totalIncome
  const other  = input.otherIncome ?? 0
  const total  = salary + other

  const expense   = Math.min(salary * 0.5, 100_000)
  const personal  = input.personalAllowance ?? 60_000
  const spouse    = input.spouseAllowance  ?? 0
  const child     = input.childAllowance   ?? 0
  const parent    = input.parentAllowance  ?? 0
  const rmfCapped = Math.min(input.rmf ?? 0, total * 0.30, 500_000)
  const retirement= Math.min((input.ssf ?? 0) + rmfCapped, 500_000)
  const life      = Math.min(input.lifeInsurance   ?? 0, 100_000)
  const health    = Math.min(input.healthInsurance  ?? 0, 25_000)
  const ss        = Math.min(input.socialSecurity   ?? 0, 9_000)
  const donate    = Math.min((input.donation ?? 0)*2, (total-expense)*0.10)
  const home      = Math.min(input.homeLoanInterest ?? 0, 100_000)

  const totalDeductions = expense+personal+spouse+child+parent+retirement+life+health+ss+donate+home
  const taxableIncome   = Math.max(0, total - totalDeductions)
  const { tax, breakdown } = progressive(taxableIncome)
  const effectiveRate   = total > 0 ? (tax/total)*100 : 0

  const suggestions: string[] = []
  if ((input.ssf ?? 0) < 200_000 && tax > 0)
    suggestions.push(`ลงทุน SSF เพิ่ม ${(200_000-(input.ssf??0)).toLocaleString()} บาท ประหยัดภาษีสูงสุด ${Math.round((200_000-(input.ssf??0))*0.20).toLocaleString()} บาท`)
  if ((input.lifeInsurance ?? 0) < 100_000 && tax > 0)
    suggestions.push(`ประกันชีวิตลดหย่อนได้อีก ${(100_000-(input.lifeInsurance??0)).toLocaleString()} บาท`)

  return {
    country:"TH", currency:"THB", totalIncome:total, totalDeductions, taxableIncome,
    tax:Math.round(tax), effectiveRate:Math.round(effectiveRate*100)/100, brackets:breakdown,
    deductionSummary:{ expense,personal,spouse,child,parent,retirement,life,health,ss,donate,home },
    suggestions,
  }
}
