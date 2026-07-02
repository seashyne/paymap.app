export type V13AccountMode = "personal" | "business" | "merchant"

export type V13InsightItem = {
  tone: "good" | "warn" | "critical"
  title: string
  detail: string
}

export type V13PayrollPreview = {
  baseSalary: number
  grossSalary: number
  netSalary: number
  whtAmount: number
  ssoEmployee: number
  ssoEmployer: number
  otAmount: number
  bonus: number
  commission: number
  allowance: number
  otherDeductions: number
}

export type V13SummaryEmployee = {
  id: string
  name: string
  position: string | null
  department: string | null
  baseSalary: number
  payrollPreview: V13PayrollPreview
}

export type V13SummaryInventoryItem = {
  id: string
  name: string
  sku: string | null
  stockQty: number
  minStockQty: number
  salePrice: number
  costPrice: number
}

export type V13SummaryOrder = {
  id: string
  orderNo: string
  customerName: string | null
  soldAt: string
  totalAmount: number
  paymentMethod: string | null
  status: string
  itemCount: number
}

export type V13FinancialOsSummary = {
  org: { id: string; name: string } | null
  store: { id: string; name: string } | null
  period: { from: string; to: string }
  totals: {
    revenue: number
    invoiceCollected: number
    invoiceIssued: number
    salesTotal: number
    salesNet: number
    taxExposure: number
    operatingOut: number
    grossProfit: number
    netProfit: number
    margin: number
    payrollGross: number
    payrollNet: number
    payrollWht: number
    payrollSso: number
    chartCount: number
    journalCount: number
    employeeCount: number
    orderCount: number
    salesGrowth: number
    lowStockCount: number
  }
  employees: V13SummaryEmployee[]
  inventory: V13SummaryInventoryItem[]
  recentOrders: V13SummaryOrder[]
}

export type V13ForecastHistoryPoint = {
  label: string
  cashIn: number
  payrollNet: number
  tax: number
}

export type V13ForecastPoint = {
  monthOffset: number
  projectedCashIn: number
  projectedPayroll: number
  projectedTax: number
  projectedNet: number
}

export type V13FinancialForecast = {
  history: V13ForecastHistoryPoint[]
  forecast: V13ForecastPoint[]
}

export type V13BusinessInsightsPayload = {
  summary: V13FinancialOsSummary
  insights: V13InsightItem[]
}
