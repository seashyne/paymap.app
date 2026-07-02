import { TH, SG, MY, JP, US, GB, AU, DE, Generic } from "./engines"
import { getCountry } from "@/lib/i18n/countries"

export interface TaxInput {
  totalIncome: number; salaryIncome?: number; otherIncome?: number
  personalAllowance?: number; spouseAllowance?: number; childAllowance?: number; parentAllowance?: number
  ssf?: number; rmf?: number; lifeInsurance?: number; healthInsurance?: number
  socialSecurity?: number; thaeesp?: number; ltf?: number; donation?: number; homeLoanInterest?: number
}

export interface TaxResult {
  country: string; currency: string; totalIncome: number; totalDeductions: number
  taxableIncome: number; tax: number; effectiveRate: number
  brackets: { bracket: string; amount: number; rate: number; tax: number }[]
  deductionSummary: Record<string, number>
  suggestions: string[]; note?: string
}

export function calculateTax(country: string, input: TaxInput): TaxResult {
  const c = country.toUpperCase()
  const countryInfo = getCountry(c)
  switch (c) {
    case "TH": return TH(input)
    case "SG": return SG(input)
    case "MY": return MY(input)
    case "JP": return JP(input)
    case "US": return US(input)
    case "GB": return GB(input)
    case "AU": return AU(input)
    case "DE": return DE(input)
    default:   return Generic(c, countryInfo.currency, input)
  }
}
