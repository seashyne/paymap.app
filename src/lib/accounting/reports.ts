// PayMap v5.1 — Financial Statements Engine
// P&L (Income Statement) · Balance Sheet · Cash Flow Statement
// ต่อยอดจาก ChartOfAccount + LedgerLine ที่มีอยู่

import { prisma } from "@/lib/prisma"

export interface DateRange {
  from: Date
  to: Date
}

// ─── helpers ─────────────────────────────────────────────────────────────────

/** Sum debit/credit of ledger lines for a set of account types within a date range */
async function sumByTypes(userId: string, types: string[], range?: DateRange) {
  const accounts = await prisma.chartOfAccount.findMany({
    where: { userId, type: { in: types as any[] } },
    include: {
      lines: {
        where: range
          ? { journal: { date: { gte: range.from, lte: range.to } } }
          : undefined,
        select: { debit: true, credit: true },
      },
    },
  })

  return accounts.map((acc) => {
    const debit  = acc.lines.reduce((s, l) => s + (l.debit  ?? 0), 0)
    const credit = acc.lines.reduce((s, l) => s + (l.credit ?? 0), 0)
    // Revenue/Liability/Equity: normal credit balance → credit - debit
    // Asset/Expense: normal debit balance → debit - credit
    const normalCredit = ["revenue", "liability", "equity"].includes(acc.type)
    const balance = normalCredit ? credit - debit : debit - credit
    return { id: acc.id, code: acc.code, name: acc.name, nameTH: acc.nameTH, type: acc.type, debit, credit, balance }
  })
}

// ─── P&L (Income Statement) ───────────────────────────────────────────────────

export interface PLStatement {
  period: { from: string; to: string }
  revenue: { items: AccountBalance[]; total: number }
  expenses: { items: AccountBalance[]; total: number }
  grossProfit: number
  netProfit: number
  profitMargin: number   // %
}

export interface AccountBalance {
  id: string; code: string; name: string; nameTH: string | null
  type: string; balance: number
}

export async function getProfitAndLoss(userId: string, range: DateRange): Promise<PLStatement> {
  const [revenueAccs, expenseAccs] = await Promise.all([
    sumByTypes(userId, ["revenue"], range),
    sumByTypes(userId, ["expense"], range),
  ])

  const totalRevenue  = revenueAccs.reduce((s, a) => s + a.balance, 0)
  const totalExpenses = expenseAccs.reduce((s, a) => s + a.balance, 0)
  const netProfit     = totalRevenue - totalExpenses
  const profitMargin  = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 10000) / 100 : 0

  // Gross profit = Revenue - COGS (code 5100)
  const cogs = expenseAccs.find(a => a.code === "5100")?.balance ?? 0
  const grossProfit = totalRevenue - cogs

  return {
    period:      { from: range.from.toISOString(), to: range.to.toISOString() },
    revenue:     { items: revenueAccs,  total: totalRevenue  },
    expenses:    { items: expenseAccs,  total: totalExpenses },
    grossProfit,
    netProfit,
    profitMargin,
  }
}

// ─── Balance Sheet ────────────────────────────────────────────────────────────

export interface BalanceSheet {
  asOf: string
  assets:      { current: AccountBalance[]; nonCurrent: AccountBalance[]; total: number }
  liabilities: { current: AccountBalance[]; longTerm:   AccountBalance[]; total: number }
  equity:      { items: AccountBalance[];   total: number }
  balanced:    boolean
  totalAssetsVsLiabEquity: { assets: number; liabEquity: number; diff: number }
}

// Current assets: cash, bank, AR, inventory (code 1100–1399)
// Non-current: fixed assets etc. (1400+)
// Current liabilities: AP, short-term loan, VAT payable (2100–2399)
// Long-term: 2400+
function splitAssets(items: AccountBalance[]) {
  return {
    current:    items.filter(a => a.code >= "1100" && a.code <= "1399"),
    nonCurrent: items.filter(a => a.code >= "1400"),
  }
}
function splitLiabilities(items: AccountBalance[]) {
  return {
    current:  items.filter(a => a.code >= "2100" && a.code <= "2399"),
    longTerm: items.filter(a => a.code >= "2400"),
  }
}

export async function getBalanceSheet(userId: string, asOf: Date): Promise<BalanceSheet> {
  const range: DateRange = { from: new Date("2000-01-01"), to: asOf }

  const [assetAccs, liabilityAccs, equityAccs, revenueAccs, expenseAccs] = await Promise.all([
    sumByTypes(userId, ["asset"],     range),
    sumByTypes(userId, ["liability"], range),
    sumByTypes(userId, ["equity"],    range),
    sumByTypes(userId, ["revenue"],   range),
    sumByTypes(userId, ["expense"],   range),
  ])

  // Retained earnings = cumulative net profit (added to equity)
  const totalRevenue  = revenueAccs.reduce((s, a) => s + a.balance, 0)
  const totalExpenses = expenseAccs.reduce((s, a) => s + a.balance, 0)
  const retainedEarnings = totalRevenue - totalExpenses

  const totalAssets      = assetAccs.reduce((s, a) => s + a.balance, 0)
  const totalLiabilities = liabilityAccs.reduce((s, a) => s + a.balance, 0)
  const totalEquity      = equityAccs.reduce((s, a) => s + a.balance, 0) + retainedEarnings

  const { current: currentAssets, nonCurrent } = splitAssets(assetAccs)
  const { current: currentLiab,   longTerm }   = splitLiabilities(liabilityAccs)

  const liabPlusEquity = totalLiabilities + totalEquity
  const diff = Math.abs(totalAssets - liabPlusEquity)

  return {
    asOf:        asOf.toISOString(),
    assets:      { current: currentAssets, nonCurrent, total: totalAssets },
    liabilities: { current: currentLiab, longTerm, total: totalLiabilities },
    equity:      { items: equityAccs, total: totalEquity },
    balanced:    diff < 0.01,
    totalAssetsVsLiabEquity: {
      assets:     totalAssets,
      liabEquity: liabPlusEquity,
      diff,
    },
  }
}

// ─── Cash Flow Statement ──────────────────────────────────────────────────────

export interface CashFlowStatement {
  period: { from: string; to: string }
  operating: { items: CashFlowItem[]; total: number }
  investing:  { items: CashFlowItem[]; total: number }
  financing:  { items: CashFlowItem[]; total: number }
  netChange:  number
  openingBalance: number
  closingBalance: number
}

export interface CashFlowItem {
  description: string
  amount: number
  type: "inflow" | "outflow"
}

export async function getCashFlowStatement(userId: string, range: DateRange): Promise<CashFlowStatement> {
  // Indirect method: start from net profit, adjust for non-cash items

  // 1. Get net profit from P&L
  const pl = await getProfitAndLoss(userId, range)

  // 2. Get AR/AP changes (working capital)
  const arRange    = { from: new Date("2000-01-01"), to: range.to }
  const arPrevRange = { from: new Date("2000-01-01"), to: range.from }

  const [arNow, arPrev, apNow, apPrev] = await Promise.all([
    sumByTypes(userId, ["asset"],     arRange).then(accs => accs.find(a => a.code === "1200")?.balance ?? 0),
    sumByTypes(userId, ["asset"],     arPrevRange).then(accs => accs.find(a => a.code === "1200")?.balance ?? 0),
    sumByTypes(userId, ["liability"], arRange).then(accs => accs.find(a => a.code === "2100")?.balance ?? 0),
    sumByTypes(userId, ["liability"], arPrevRange).then(accs => accs.find(a => a.code === "2100")?.balance ?? 0),
  ])

  const arChange = -(arNow - arPrev)   // AR ↑ = cash used
  const apChange =   apNow - apPrev    // AP ↑ = cash saved

  // 3. Cash account balance (opening/closing)
  const cashAccs = await sumByTypes(userId, ["asset"], arRange)
  const cashAcc  = cashAccs.find(a => a.code === "1100" || a.code === "1110")
  const closingCash = cashAcc?.balance ?? 0

  const prevCashAccs = await sumByTypes(userId, ["asset"], arPrevRange)
  const prevCash = prevCashAccs.find(a => a.code === "1100" || a.code === "1110")?.balance ?? 0

  // 4. Fixed asset changes → investing
  const fixedNow  = cashAccs.find(a => a.code === "1500")?.balance ?? 0
  const fixedPrev = prevCashAccs.find(a => a.code === "1500")?.balance ?? 0
  const capEx = -(fixedNow - fixedPrev)  // increase in fixed assets = cash used

  // 5. Loan changes → financing
  const loanAccs     = await sumByTypes(userId, ["liability"], arRange)
  const loanPrevAccs = await sumByTypes(userId, ["liability"], arPrevRange)
  const loanNow  = loanAccs.find(a => a.code === "2200")?.balance ?? 0
  const loanPrev = loanPrevAccs.find(a => a.code === "2200")?.balance ?? 0
  const loanChange = loanNow - loanPrev  // borrowing = inflow, repayment = outflow

  const operating: CashFlowItem[] = [
    { description: "กำไรสุทธิ", amount: pl.netProfit, type: pl.netProfit >= 0 ? "inflow" : "outflow" },
  ]
  if (arChange !== 0) operating.push({ description: "การเปลี่ยนแปลงลูกหนี้การค้า", amount: arChange, type: arChange >= 0 ? "inflow" : "outflow" })
  if (apChange !== 0) operating.push({ description: "การเปลี่ยนแปลงเจ้าหนี้การค้า", amount: apChange, type: apChange >= 0 ? "inflow" : "outflow" })

  const investing: CashFlowItem[] = []
  if (capEx !== 0) investing.push({ description: "ซื้อสินทรัพย์ถาวร", amount: capEx, type: capEx >= 0 ? "inflow" : "outflow" })

  const financing: CashFlowItem[] = []
  if (loanChange !== 0) financing.push({ description: loanChange > 0 ? "กู้เงิน" : "ชำระเงินกู้", amount: loanChange, type: loanChange >= 0 ? "inflow" : "outflow" })

  const opTotal = operating.reduce((s, i) => s + i.amount, 0)
  const invTotal = investing.reduce((s, i) => s + i.amount, 0)
  const finTotal = financing.reduce((s, i) => s + i.amount, 0)
  const netChange = opTotal + invTotal + finTotal

  return {
    period:         { from: range.from.toISOString(), to: range.to.toISOString() },
    operating:      { items: operating,  total: opTotal  },
    investing:      { items: investing,  total: invTotal  },
    financing:      { items: financing,  total: finTotal  },
    netChange,
    openingBalance: prevCash,
    closingBalance: closingCash,
  }
}
