// v2.0: Real tax engines for all supported countries
import type { TaxInput, TaxResult } from "./index"

// ─── helpers ──────────────────────────────────────────────────────────────────
function progressive(taxable: number, brackets: { min: number; max: number; rate: number }[]) {
  let tax = 0
  const breakdown: { bracket: string; amount: number; rate: number; tax: number }[] = []
  for (const b of brackets) {
    if (taxable <= b.min) break
    const amt = Math.min(taxable, b.max) - b.min
    const t = amt * b.rate
    tax += t
    if (amt > 0)
      breakdown.push({
        bracket: b.max === Infinity ? `${b.min.toLocaleString()}+` : `${b.min.toLocaleString()}–${b.max.toLocaleString()}`,
        amount: amt, rate: b.rate * 100, tax: t,
      })
  }
  return { tax, breakdown }
}

// ─── Thailand ─────────────────────────────────────────────────────────────────
export function TH(input: TaxInput): TaxResult {
  const salary = input.salaryIncome ?? input.totalIncome
  const other = input.otherIncome ?? 0
  const total = salary + other
  const expense = Math.min(salary * 0.5, 100_000)
  const personal = input.personalAllowance ?? 60_000
  const spouse = input.spouseAllowance ?? 0
  const child = input.childAllowance ?? 0
  const parent = input.parentAllowance ?? 0
  const rmfCapped = Math.min(input.rmf ?? 0, total * 0.30, 500_000)
  const retirement = Math.min((input.ssf ?? 0) + rmfCapped, 500_000)
  const life = Math.min(input.lifeInsurance ?? 0, 100_000)
  const health = Math.min(input.healthInsurance ?? 0, 25_000)
  const ss = Math.min(input.socialSecurity ?? 0, 9_000)
  const donate = Math.min((input.donation ?? 0) * 2, (total - expense) * 0.10)
  const home = Math.min(input.homeLoanInterest ?? 0, 100_000)
  const totalDeductions = expense + personal + spouse + child + parent + retirement + life + health + ss + donate + home
  const taxableIncome = Math.max(0, total - totalDeductions)
  const { tax, breakdown } = progressive(taxableIncome, [
    { min: 0, max: 150_000, rate: 0 },
    { min: 150_001, max: 300_000, rate: 0.05 },
    { min: 300_001, max: 500_000, rate: 0.10 },
    { min: 500_001, max: 750_000, rate: 0.15 },
    { min: 750_001, max: 1_000_000, rate: 0.20 },
    { min: 1_000_001, max: 2_000_000, rate: 0.25 },
    { min: 2_000_001, max: 5_000_000, rate: 0.30 },
    { min: 5_000_001, max: Infinity, rate: 0.35 },
  ])
  const suggestions: string[] = []
  if ((input.ssf ?? 0) < 200_000 && tax > 0)
    suggestions.push(`ลงทุน SSF เพิ่ม ${(200_000 - (input.ssf ?? 0)).toLocaleString()} บาท ประหยัดภาษีได้อีก ${Math.round((200_000 - (input.ssf ?? 0)) * 0.20).toLocaleString()} บาท`)
  if ((input.lifeInsurance ?? 0) < 100_000 && tax > 0)
    suggestions.push(`ประกันชีวิตลดหย่อนได้อีก ${(100_000 - (input.lifeInsurance ?? 0)).toLocaleString()} บาท`)
  return { country: "TH", currency: "THB", totalIncome: total, totalDeductions, taxableIncome, tax: Math.round(tax), effectiveRate: total > 0 ? Math.round((tax / total) * 10000) / 100 : 0, brackets: breakdown, deductionSummary: { expense, personal, spouse, child, parent, retirement, life, health, ss, donate, home }, suggestions }
}

// ─── Singapore ────────────────────────────────────────────────────────────────
export function SG(input: TaxInput): TaxResult {
  const total = input.totalIncome
  const cpf = Math.min(total * 0.20, 37_740) // employee CPF 20%
  const earned = Math.min(total, 80_000) * 0.11 // earned income relief
  const personal = 1_000
  const totalDeductions = Math.min(cpf + earned + personal, total)
  const taxable = Math.max(0, total - totalDeductions)
  const { tax, breakdown } = progressive(taxable, [
    { min: 0, max: 20_000, rate: 0 },
    { min: 20_000, max: 30_000, rate: 0.02 },
    { min: 30_000, max: 40_000, rate: 0.035 },
    { min: 40_000, max: 80_000, rate: 0.07 },
    { min: 80_000, max: 120_000, rate: 0.115 },
    { min: 120_000, max: 160_000, rate: 0.15 },
    { min: 160_000, max: 200_000, rate: 0.18 },
    { min: 200_000, max: 240_000, rate: 0.19 },
    { min: 240_000, max: 280_000, rate: 0.195 },
    { min: 280_000, max: 320_000, rate: 0.20 },
    { min: 320_000, max: 500_000, rate: 0.22 },
    { min: 500_000, max: 1_000_000, rate: 0.23 },
    { min: 1_000_000, max: Infinity, rate: 0.24 },
  ])
  return { country: "SG", currency: "SGD", totalIncome: total, totalDeductions, taxableIncome: taxable, tax: Math.round(tax), effectiveRate: total > 0 ? Math.round((tax / total) * 10000) / 100 : 0, brackets: breakdown, deductionSummary: { cpf, earned_income_relief: earned, personal_relief: personal }, suggestions: ["Singapore tax rates are among the lowest in Asia — CPF contributions reduce taxable income significantly."] }
}

// ─── Malaysia ─────────────────────────────────────────────────────────────────
export function MY(input: TaxInput): TaxResult {
  const total = input.totalIncome
  const personal = 9_000
  const epf = Math.min(total * 0.11, 4_000)
  const life = Math.min(input.lifeInsurance ?? 0, 3_000)
  const totalDeductions = personal + epf + life
  const taxable = Math.max(0, total - totalDeductions)
  const { tax, breakdown } = progressive(taxable, [
    { min: 0, max: 5_000, rate: 0 },
    { min: 5_001, max: 20_000, rate: 0.01 },
    { min: 20_001, max: 35_000, rate: 0.03 },
    { min: 35_001, max: 50_000, rate: 0.08 },
    { min: 50_001, max: 70_000, rate: 0.13 },
    { min: 70_001, max: 100_000, rate: 0.21 },
    { min: 100_001, max: 250_000, rate: 0.24 },
    { min: 250_001, max: 400_000, rate: 0.245 },
    { min: 400_001, max: 600_000, rate: 0.25 },
    { min: 600_001, max: 1_000_000, rate: 0.26 },
    { min: 1_000_001, max: Infinity, rate: 0.30 },
  ])
  return { country: "MY", currency: "MYR", totalIncome: total, totalDeductions, taxableIncome: taxable, tax: Math.round(tax), effectiveRate: total > 0 ? Math.round((tax / total) * 10000) / 100 : 0, brackets: breakdown, deductionSummary: { personal_relief: personal, epf, life_insurance: life }, suggestions: ["EPF contribution (11%) is deductible up to MYR 4,000/year."] }
}

// ─── Japan ────────────────────────────────────────────────────────────────────
export function JP(input: TaxInput): TaxResult {
  const total = input.totalIncome
  const basicDeduction = 480_000
  const salaryDeduction = total <= 1_625_000 ? 550_000 : total <= 1_800_000 ? total * 0.4 - 100_000 : total <= 3_600_000 ? total * 0.3 + 80_000 : total <= 6_600_000 ? total * 0.2 + 440_000 : total <= 8_500_000 ? total * 0.1 + 1_100_000 : 1_950_000
  const totalDeductions = basicDeduction + salaryDeduction
  const taxable = Math.max(0, total - totalDeductions)
  const { tax: nationalTax, breakdown } = progressive(taxable, [
    { min: 0, max: 1_950_000, rate: 0.05 },
    { min: 1_950_001, max: 3_300_000, rate: 0.10 },
    { min: 3_300_001, max: 6_950_000, rate: 0.20 },
    { min: 6_950_001, max: 9_000_000, rate: 0.23 },
    { min: 9_000_001, max: 18_000_000, rate: 0.33 },
    { min: 18_000_001, max: 40_000_000, rate: 0.40 },
    { min: 40_000_001, max: Infinity, rate: 0.45 },
  ])
  const reconstruction = nationalTax * 0.021
  const localTax = taxable * 0.10
  const tax = nationalTax + reconstruction + localTax
  return { country: "JP", currency: "JPY", totalIncome: total, totalDeductions, taxableIncome: taxable, tax: Math.round(tax), effectiveRate: total > 0 ? Math.round((tax / total) * 10000) / 100 : 0, brackets: breakdown, deductionSummary: { basic_deduction: basicDeduction, salary_deduction: salaryDeduction }, suggestions: ["Japan has both national tax (5–45%) and local/resident tax (10%). Total effective rate can be significant at high incomes."] }
}

// ─── United States (simplified federal) ──────────────────────────────────────
export function US(input: TaxInput): TaxResult {
  const total = input.totalIncome
  const standardDeduction = 14_600 // 2024 single filer
  const personalExemption = input.personalAllowance ?? standardDeduction
  const taxable = Math.max(0, total - personalExemption)
  const { tax, breakdown } = progressive(taxable, [
    { min: 0, max: 11_600, rate: 0.10 },
    { min: 11_600, max: 47_150, rate: 0.12 },
    { min: 47_150, max: 100_525, rate: 0.22 },
    { min: 100_525, max: 191_950, rate: 0.24 },
    { min: 191_950, max: 243_725, rate: 0.32 },
    { min: 243_725, max: 609_350, rate: 0.35 },
    { min: 609_350, max: Infinity, rate: 0.37 },
  ])
  return { country: "US", currency: "USD", totalIncome: total, totalDeductions: personalExemption, taxableIncome: taxable, tax: Math.round(tax), effectiveRate: total > 0 ? Math.round((tax / total) * 10000) / 100 : 0, brackets: breakdown, deductionSummary: { standard_deduction: personalExemption }, suggestions: ["Federal tax only. Add ~10–13% for state income tax and 7.65% FICA (Social Security + Medicare).", "Contributing to 401(k) up to $23,000/year reduces federal taxable income."] }
}

// ─── United Kingdom ───────────────────────────────────────────────────────────
export function GB(input: TaxInput): TaxResult {
  const total = input.totalIncome
  const personalAllowance = total > 125_140 ? 0 : total > 100_000 ? (125_140 - total) / 2 : 12_570
  const taxable = Math.max(0, total - personalAllowance)
  const { tax, breakdown } = progressive(taxable, [
    { min: 0, max: 37_700, rate: 0.20 },
    { min: 37_700, max: 125_140, rate: 0.40 },
    { min: 125_140, max: Infinity, rate: 0.45 },
  ])
  const ni = Math.max(0, Math.min(total, 50_270) - 12_570) * 0.08 + Math.max(0, total - 50_270) * 0.02
  return { country: "GB", currency: "GBP", totalIncome: total, totalDeductions: personalAllowance, taxableIncome: taxable, tax: Math.round(tax + ni), effectiveRate: total > 0 ? Math.round(((tax + ni) / total) * 10000) / 100 : 0, brackets: breakdown, deductionSummary: { personal_allowance: personalAllowance, national_insurance: ni }, suggestions: ["National Insurance (NI) included. Personal allowance phases out above £100,000."] }
}

// ─── Australia ────────────────────────────────────────────────────────────────
export function AU(input: TaxInput): TaxResult {
  const total = input.totalIncome
  const lowIncomeOffset = total <= 37_500 ? 700 : total <= 45_000 ? 700 - (total - 37_500) * 0.05 : total <= 66_667 ? 325 - (total - 45_000) * 0.015 : 0
  const { tax: baseTax, breakdown } = progressive(total, [
    { min: 0, max: 18_200, rate: 0 },
    { min: 18_200, max: 45_000, rate: 0.19 },
    { min: 45_000, max: 120_000, rate: 0.325 },
    { min: 120_000, max: 180_000, rate: 0.37 },
    { min: 180_000, max: Infinity, rate: 0.45 },
  ])
  const medicare = total > 26_000 ? total * 0.02 : 0
  const tax = Math.max(0, baseTax - lowIncomeOffset) + medicare
  return { country: "AU", currency: "AUD", totalIncome: total, totalDeductions: 0, taxableIncome: total, tax: Math.round(tax), effectiveRate: total > 0 ? Math.round((tax / total) * 10000) / 100 : 0, brackets: breakdown, deductionSummary: { low_income_offset: lowIncomeOffset, medicare_levy: medicare }, suggestions: ["2% Medicare levy included. Low Income Tax Offset (LITO) reduces tax for incomes under $66,667."] }
}

// ─── Germany ──────────────────────────────────────────────────────────────────
export function DE(input: TaxInput): TaxResult {
  const total = input.totalIncome
  const basicAllowance = 11_604
  const taxable = Math.max(0, total - basicAllowance)
  let tax = 0
  if (taxable <= 0) tax = 0
  else if (taxable <= 15_999) { const y = (taxable - 11_604) / 10000; tax = (979.18 * y + 1_400) * y }
  else if (taxable <= 62_809) { const z = (taxable - 15_999) / 10000; tax = (192.59 * z + 2_397) * z + 966.53 }
  else if (taxable <= 277_825) tax = 0.42 * taxable - 9_972.98
  else tax = 0.45 * taxable - 18_307.73
  const solidarity = tax > 18_130 ? tax * 0.055 : 0
  const totalTax = tax + solidarity
  return { country: "DE", currency: "EUR", totalIncome: total, totalDeductions: basicAllowance, taxableIncome: taxable, tax: Math.round(totalTax), effectiveRate: total > 0 ? Math.round((totalTax / total) * 10000) / 100 : 0, brackets: [{ bracket: "Progressive", amount: taxable, rate: totalTax / (taxable || 1) * 100, tax: totalTax }], deductionSummary: { grundfreibetrag: basicAllowance, solidarity_surcharge: solidarity }, suggestions: ["German income tax uses a complex formula. Social security contributions (pension, health, unemployment) are additional."] }
}

// ─── Generic fallback (flat 20%) ──────────────────────────────────────────────
export function Generic(country: string, currency: string, input: TaxInput): TaxResult {
  const total = input.totalIncome
  const personal = input.personalAllowance ?? 0
  const taxable = Math.max(0, total - personal)
  const tax = taxable * 0.20
  return { country, currency, totalIncome: total, totalDeductions: personal, taxableIncome: taxable, tax: Math.round(tax), effectiveRate: total > 0 ? Math.round((tax / total) * 10000) / 100 : 0, brackets: [{ bracket: "Flat 20% (estimate)", amount: taxable, rate: 20, tax }], deductionSummary: { personal_allowance: personal }, suggestions: [`Full ${country} tax engine coming soon. Showing 20% flat estimate only.`], note: `Simplified estimate for ${country}. Please consult a local tax advisor.` }
}
