// ── Payroll Engine — Thai Compliance ─────────────────────────────────────────
// SSO: ประกันสังคม มาตรา 33 — 5% of salary (max ฿750/month, ceiling ฿15,000)
// WHT: ภาษีหัก ณ ที่จ่าย — progressive rate on annual income

export interface PayrollInput {
  baseSalary: number
  otHours?: number
  otMultiplier?: number    // default 1.5
  bonus?: number
  commission?: number
  allowance?: number
  otherDeductions?: number
  annualIncome?: number    // for WHT estimation if known
}

export interface PayrollResult {
  baseSalary: number
  otAmount: number
  bonus: number
  commission: number
  allowance: number
  grossSalary: number
  ssoEmployee: number    // ลูกจ้าง 5%
  ssoEmployer: number    // นายจ้าง 5%
  whtAmount: number      // ภาษีหัก ณ ที่จ่าย
  otherDeductions: number
  netSalary: number
}

const SSO_RATE = 0.05
const SSO_SALARY_CAP = 15000   // ฿15,000 ceiling
const SSO_MAX = 750            // ฿750/month max

// Thai progressive income tax 2567 (personal deduction included estimate)
const WHT_BRACKETS = [
  { min: 0,       max: 150000,  rate: 0     },
  { min: 150001,  max: 300000,  rate: 0.05  },
  { min: 300001,  max: 500000,  rate: 0.10  },
  { min: 500001,  max: 750000,  rate: 0.15  },
  { min: 750001,  max: 1000000, rate: 0.20  },
  { min: 1000001, max: 2000000, rate: 0.25  },
  { min: 2000001, max: 5000000, rate: 0.30  },
  { min: 5000001, max: Infinity,rate: 0.35  },
]

export function calcSso(salary: number): number {
  const base = Math.min(salary, SSO_SALARY_CAP)
  return Math.min(Math.round(base * SSO_RATE), SSO_MAX)
}

export function calcAnnualWht(annualGross: number): number {
  // Rough estimate: 50% expense deduction (max 100k) + personal exemption 60k
  const expenseDeduction = Math.min(annualGross * 0.5, 100000)
  const personalExemption = 60000
  const taxableIncome = Math.max(0, annualGross - expenseDeduction - personalExemption)
  let tax = 0
  for (const bracket of WHT_BRACKETS) {
    if (taxableIncome <= bracket.min) break
    const taxable = Math.min(taxableIncome, bracket.max) - bracket.min
    tax += taxable * bracket.rate
  }
  return Math.round(tax)
}

export function calcMonthlyWht(monthlyGross: number, annualGross?: number): number {
  const annual = annualGross ?? monthlyGross * 12
  return Math.round(calcAnnualWht(annual) / 12)
}

export function calculatePayroll(input: PayrollInput): PayrollResult {
  const baseSalary = input.baseSalary
  const dailyRate = baseSalary / 26
  const hourlyRate = dailyRate / 8
  const otMultiplier = input.otMultiplier ?? 1.5
  const otAmount = Math.round((input.otHours ?? 0) * hourlyRate * otMultiplier)
  const bonus = input.bonus ?? 0
  const commission = input.commission ?? 0
  const allowance = input.allowance ?? 0

  const grossSalary = baseSalary + otAmount + bonus + commission + allowance

  const ssoEmployee = calcSso(baseSalary)
  const ssoEmployer = calcSso(baseSalary)
  const whtAmount = calcMonthlyWht(grossSalary, input.annualIncome)
  const otherDeductions = input.otherDeductions ?? 0

  const netSalary = grossSalary - ssoEmployee - whtAmount - otherDeductions

  return {
    baseSalary, otAmount, bonus, commission, allowance,
    grossSalary, ssoEmployee, ssoEmployer, whtAmount,
    otherDeductions, netSalary: Math.round(netSalary),
  }
}

export function formatPayslipData(employee: { name: string; position?: string | null; taxId?: string | null }, payroll: PayrollResult, period: { month: number; year: number }) {
  return {
    employee: employee.name,
    position: employee.position ?? "",
    taxId: employee.taxId ?? "",
    period: `${period.month}/${period.year}`,
    earnings: [
      { label: "เงินเดือน", amount: payroll.baseSalary },
      ...(payroll.otAmount > 0 ? [{ label: "OT", amount: payroll.otAmount }] : []),
      ...(payroll.bonus > 0 ? [{ label: "โบนัส", amount: payroll.bonus }] : []),
      ...(payroll.commission > 0 ? [{ label: "ค่าคอมมิชชั่น", amount: payroll.commission }] : []),
      ...(payroll.allowance > 0 ? [{ label: "เบี้ยเลี้ยง/ค่าเดินทาง", amount: payroll.allowance }] : []),
    ],
    deductions: [
      { label: "ประกันสังคม (ลูกจ้าง 5%)", amount: payroll.ssoEmployee },
      { label: "ภาษีหัก ณ ที่จ่าย", amount: payroll.whtAmount },
      ...(payroll.otherDeductions > 0 ? [{ label: "หักอื่นๆ", amount: payroll.otherDeductions }] : []),
    ],
    grossSalary: payroll.grossSalary,
    netSalary: payroll.netSalary,
  }
}
