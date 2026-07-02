import { prisma } from "@/lib/prisma"
import { calculatePayroll } from "@/lib/business/payroll"
import type { V13BusinessInsightsPayload, V13FinancialForecast, V13FinancialOsSummary, V13InsightItem } from "@/lib/v13/types"

function monthBounds(offset = 0) {
  const now = new Date()
  return {
    from: new Date(now.getFullYear(), now.getMonth() + offset, 1),
    to: new Date(now.getFullYear(), now.getMonth() + offset + 1, 0, 23, 59, 59),
  }
}

function safeDiv(value: number, total: number) {
  return total > 0 ? value / total : 0
}

function emptyInvoiceAggregate() {
  return { _sum: { subtotal: null, taxAmount: null, totalAmount: null } }
}

function emptySalesAggregate() {
  return { _sum: { subtotal: null, vatAmount: null, totalAmount: null }, _count: { id: 0 } }
}

function emptyPayrollAggregate() {
  return { _sum: { totalNet: null, totalWht: null } }
}

function emptyAmountAggregate() {
  return { _sum: { amount: null } }
}

export async function getFinancialOsSummary(userId: string): Promise<V13FinancialOsSummary> {
  const org = await prisma.organization.findFirst({ where: { ownerId: userId }, select: { id: true, name: true } })
  const store = await prisma.store.findFirst({ where: { userId }, select: { id: true, name: true } })
  const { from, to } = monthBounds(0)
  const { from: prevFrom, to: prevTo } = monthBounds(-1)

  const periodMonth = from.getMonth() + 1
  const periodYear = from.getFullYear()

  const [
    monthInvoicePayments,
    monthInvoices,
    monthPayrollRuns,
    monthSales,
    prevSales,
    chartCount,
    journalCount,
    lowStock,
    employees,
    currentMonthOrders,
    recentOrders,
  ] = await Promise.all([
    org ? prisma.invoicePayment.aggregate({ where: { invoice: { organizationId: org.id }, paidAt: { gte: from, lte: to } }, _sum: { amount: true } }) : Promise.resolve(emptyAmountAggregate()),
    org ? prisma.invoice.aggregate({ where: { organizationId: org.id, OR: [{ issuedAt: { gte: from, lte: to } }, { issuedAt: null, createdAt: { gte: from, lte: to } }] }, _sum: { subtotal: true, taxAmount: true, totalAmount: true } }) : Promise.resolve(emptyInvoiceAggregate()),
    org ? prisma.payrollRun.findMany({ where: { organizationId: org.id, month: periodMonth, year: periodYear }, orderBy: { updatedAt: "desc" }, take: 6 }) : Promise.resolve([]),
    store ? prisma.salesOrder.aggregate({ where: { storeId: store.id, soldAt: { gte: from, lte: to } }, _sum: { subtotal: true, vatAmount: true, totalAmount: true }, _count: { id: true } }) : Promise.resolve(emptySalesAggregate()),
    store ? prisma.salesOrder.aggregate({ where: { storeId: store.id, soldAt: { gte: prevFrom, lte: prevTo } }, _sum: { totalAmount: true }, _count: { id: true } }) : Promise.resolve({ _sum: { totalAmount: null }, _count: { id: 0 } }),
    prisma.chartOfAccount.count({ where: { userId } }),
    prisma.journalEntry.count({ where: { userId, date: { gte: from, lte: to } } }),
    store ? prisma.merchantProduct.findMany({ where: { storeId: store.id, status: "active" }, orderBy: [{ stockQty: "asc" }, { name: "asc" }], take: 6 }) : Promise.resolve([]),
    org ? prisma.employee.findMany({ where: { organizationId: org.id, status: "active", deletedAt: null }, orderBy: { name: "asc" }, take: 12 }) : Promise.resolve([]),
    store ? prisma.salesOrder.findMany({ where: { storeId: store.id, soldAt: { gte: from, lte: to } }, orderBy: { soldAt: "desc" }, take: 50, include: { items: true } }) : Promise.resolve([]),
    store ? prisma.salesOrder.findMany({ where: { storeId: store.id }, orderBy: { soldAt: "desc" }, take: 8, include: { items: true } }) : Promise.resolve([]),
  ])

  const invoiceCollected = Number(monthInvoicePayments._sum.amount ?? 0)
  const invoiceSubtotal = Number(monthInvoices._sum.subtotal ?? 0)
  const invoiceTax = Number(monthInvoices._sum.taxAmount ?? 0)
  const invoiceTotal = Number(monthInvoices._sum.totalAmount ?? 0)
  const salesNet = Number(monthSales._sum.subtotal ?? 0)
  const salesVat = Number(monthSales._sum.vatAmount ?? 0)
  const salesTotal = Number(monthSales._sum.totalAmount ?? 0)
  const prevSalesTotal = Number(prevSales._sum.totalAmount ?? 0)

  const payrollGross = (monthPayrollRuns as any[]).reduce((sum: number, item: any) => sum + Number(item.totalGross), 0)
  const payrollNet = (monthPayrollRuns as any[]).reduce((sum: number, item: any) => sum + Number(item.totalNet), 0)
  const payrollWht = (monthPayrollRuns as any[]).reduce((sum: number, item: any) => sum + Number(item.totalWht), 0)
  const payrollSso = (monthPayrollRuns as any[]).reduce((sum: number, item: any) => sum + Number(item.totalSso), 0)

  const cogs = (currentMonthOrders as any[]).reduce((sum: number, order: any) => sum + (order.items as any[]).reduce((lineSum: number, line: any) => lineSum + Number(line.costPrice) * line.qty, 0), 0)
  const revenue = invoiceSubtotal + salesNet
  const taxExposure = invoiceTax + salesVat + payrollWht
  const operatingOut = payrollNet
  const grossProfit = salesNet - cogs
  const netProfit = revenue - cogs - payrollGross
  const margin = safeDiv(netProfit, revenue) * 100
  const salesGrowth = prevSalesTotal > 0 ? ((salesTotal - prevSalesTotal) / prevSalesTotal) * 100 : (salesTotal > 0 ? 100 : 0)
  const lowStockItems = (lowStock as any[]).filter((item: any) => item.stockQty <= item.minStockQty)

  return {
    org,
    store,
    period: { from: from.toISOString(), to: to.toISOString() },
    totals: {
      revenue,
      invoiceCollected,
      invoiceIssued: invoiceTotal,
      salesTotal,
      salesNet,
      taxExposure,
      operatingOut,
      grossProfit,
      netProfit,
      margin,
      payrollGross,
      payrollNet,
      payrollWht,
      payrollSso,
      chartCount,
      journalCount,
      employeeCount: employees.length,
      orderCount: monthSales._count.id,
      salesGrowth,
      lowStockCount: lowStockItems.length,
    },
    employees: (employees as any[]).map((employee: any) => ({
      id: employee.id,
      name: employee.name,
      position: employee.position,
      department: employee.department,
      baseSalary: Number(employee.baseSalary),
      payrollPreview: calculatePayroll({ baseSalary: Number(employee.baseSalary) }),
    })),
    inventory: (lowStockItems as any[]).map((item: any) => ({
      id: item.id,
      name: item.name,
      sku: item.sku,
      stockQty: item.stockQty,
      minStockQty: item.minStockQty,
      salePrice: Number(item.salePrice),
      costPrice: Number(item.costPrice),
    })),
    recentOrders: (recentOrders as any[]).map((order: any) => ({
      id: order.id,
      orderNo: order.orderNo,
      customerName: order.customerName,
      soldAt: order.soldAt.toISOString(),
      totalAmount: Number(order.totalAmount),
      paymentMethod: order.paymentMethod,
      status: order.status,
      itemCount: order.items.length,
    })),
  }
}

export async function getFinancialForecast(userId: string): Promise<V13FinancialForecast> {
  const store = await prisma.store.findFirst({ where: { userId }, select: { id: true } })
  const org = await prisma.organization.findFirst({ where: { ownerId: userId }, select: { id: true } })

  const months = await Promise.all(
    Array.from({ length: 6 }).map(async (_, index) => {
      const offset = -5 + index
      const { from, to } = monthBounds(offset)
      const [sales, payroll, collected] = await Promise.all([
        store ? prisma.salesOrder.aggregate({ where: { storeId: store.id, soldAt: { gte: from, lte: to } }, _sum: { totalAmount: true } }) : Promise.resolve({ _sum: { totalAmount: null } }),
        org ? prisma.payrollRun.aggregate({ where: { organizationId: org.id, month: from.getMonth() + 1, year: from.getFullYear() }, _sum: { totalNet: true, totalWht: true } }) : Promise.resolve(emptyPayrollAggregate()),
        org ? prisma.invoicePayment.aggregate({ where: { invoice: { organizationId: org.id }, paidAt: { gte: from, lte: to } }, _sum: { amount: true } }) : Promise.resolve(emptyAmountAggregate()),
      ])
      return {
        label: `${from.getFullYear()}-${String(from.getMonth() + 1).padStart(2, "0")}`,
        cashIn: Number(sales._sum.totalAmount ?? 0) + Number(collected._sum.amount ?? 0),
        payrollNet: Number(payroll._sum.totalNet ?? 0),
        tax: Number(payroll._sum.totalWht ?? 0),
      }
    })
  )

  const cashInAvg = months.reduce((sum, item) => sum + item.cashIn, 0) / Math.max(months.length, 1)
  const payrollAvg = months.reduce((sum, item) => sum + item.payrollNet, 0) / Math.max(months.length, 1)
  const taxAvg = months.reduce((sum, item) => sum + item.tax, 0) / Math.max(months.length, 1)
  const trend = months.length >= 2 ? months[months.length - 1].cashIn - months[months.length - 2].cashIn : 0

  const nextQuarter = Array.from({ length: 3 }).map((_, index) => {
    const multiplier = 1 + Math.max(-0.15, Math.min(0.2, safeDiv(trend, cashInAvg || 1) * (index + 1) * 0.25))
    const cashIn = Math.round(cashInAvg * multiplier)
    const payroll = Math.round(payrollAvg)
    const tax = Math.round(taxAvg + cashIn * 0.02)
    return {
      monthOffset: index + 1,
      projectedCashIn: cashIn,
      projectedPayroll: payroll,
      projectedTax: tax,
      projectedNet: cashIn - payroll - tax,
    }
  })

  return {
    history: months,
    forecast: nextQuarter,
  }
}

export async function getBusinessInsights(userId: string): Promise<V13BusinessInsightsPayload> {
  const summary = await getFinancialOsSummary(userId)
  const insights: V13InsightItem[] = []

  if (summary.totals.netProfit > 0) {
    insights.push({ tone: "good", title: "ธุรกิจกำลังทำกำไร", detail: `กำไรสุทธิเดือนนี้ประมาณ ฿${summary.totals.netProfit.toLocaleString("th-TH")}` })
  } else {
    insights.push({ tone: "critical", title: "กำไรสุทธิติดลบ", detail: `เดือนนี้ขาดทุนประมาณ ฿${Math.abs(summary.totals.netProfit).toLocaleString("th-TH")} ควรดู payroll และต้นทุนสินค้า` })
  }

  if (summary.totals.taxExposure > Math.max(summary.totals.revenue * 0.12, 25000)) {
    insights.push({ tone: "warn", title: "ภาระภาษีเริ่มสูง", detail: `ภาษีที่กระทบเดือนนี้ประมาณ ฿${summary.totals.taxExposure.toLocaleString("th-TH")} ควรจัด deductible expense และตรวจใบกำกับภาษีซื้อ` })
  }

  if (summary.totals.lowStockCount > 0) {
    const first = summary.inventory[0]
    insights.push({ tone: "warn", title: "มีสินค้าต่ำกว่า minimum", detail: `${summary.totals.lowStockCount} รายการใกล้หมด เช่น ${first?.name ?? "สินค้าหลัก"} ควรเติมสต็อกก่อนยอดขายสะดุด` })
  }

  const payrollRatio = safeDiv(summary.totals.payrollGross, summary.totals.revenue) * 100
  if (payrollRatio > 35) {
    insights.push({ tone: "warn", title: "ต้นทุนแรงงานสูง", detail: `Payroll คิดเป็น ${payrollRatio.toFixed(1)}% ของรายได้ ควรเช็ก OT, allowance และ productivity รายทีม` })
  } else if (payrollRatio > 0) {
    insights.push({ tone: "good", title: "ต้นทุนแรงงานยังคุมได้", detail: `Payroll คิดเป็น ${payrollRatio.toFixed(1)}% ของรายได้ อยู่ในช่วงที่ยังบริหารได้` })
  }

  if (summary.totals.salesGrowth >= 10) {
    insights.push({ tone: "good", title: "ยอดขายโตจากเดือนก่อน", detail: `ยอดขายรวมโตประมาณ ${summary.totals.salesGrowth.toFixed(1)}% จากเดือนก่อน` })
  } else if (summary.totals.salesGrowth < 0) {
    insights.push({ tone: "critical", title: "ยอดขายชะลอลง", detail: `ยอดขายลดลงประมาณ ${Math.abs(summary.totals.salesGrowth).toFixed(1)}% จากเดือนก่อน ควรดู SKU หลักและ conversion หน้าร้าน` })
  }

  if (!summary.org) {
    insights.push({ tone: "warn", title: "ยังไม่ตั้งค่าองค์กร", detail: "เปิด Business workspace แล้วสร้าง organization เพื่อเริ่ม payroll, invoices และ accounting flow" })
  }
  if (!summary.store) {
    insights.push({ tone: "warn", title: "ยังไม่ตั้งค่าร้านค้า", detail: "เปิด Merchant workspace แล้วสร้าง store เพื่อให้ POS, inventory และยอดขายถูก sync เข้าระบบบัญชี" })
  }

  return { summary, insights }
}
