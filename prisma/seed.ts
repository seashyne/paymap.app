import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { DEFAULT_CHART_OF_ACCOUNTS } from "./chart-of-accounts.seed"

const prisma = new PrismaClient()

const INCOME_CATS = [
  { name: "Salary",       color: "#34d399", icon: "💰" },
  { name: "Freelance",    color: "#60a5fa", icon: "💻" },
  { name: "Investment",   color: "#f59e0b", icon: "📈" },
  { name: "Other Income", color: "#a78bfa", icon: "🎁" },
]
const EXPENSE_CATS = [
  { name: "Food & Drink",  color: "#f59e0b", icon: "🍜" },
  { name: "Transport",     color: "#60a5fa", icon: "🚗" },
  { name: "Housing",       color: "#f87171", icon: "🏠" },
  { name: "Health",        color: "#34d399", icon: "💊" },
  { name: "Shopping",      color: "#f472b6", icon: "🛍️" },
  { name: "Entertainment", color: "#fb923c", icon: "🎬" },
  { name: "Utilities",     color: "#94a3b8", icon: "💡" },
  { name: "Education",     color: "#2dd4bf", icon: "📚" },
  { name: "Subscription",  color: "#818cf8", icon: "📱" },
  { name: "Travel",        color: "#34d399", icon: "✈️" },
]

async function ensureDefaultCategories(userId: string) {
  const all = [
    ...INCOME_CATS.map(c => ({ ...c, type: "income" as const })),
    ...EXPENSE_CATS.map(c => ({ ...c, type: "expense" as const })),
  ]
  for (const cat of all) {
    await prisma.category.upsert({
      where: { userId_name_type: { userId, name: cat.name, type: cat.type } },
      update: { color: cat.color, icon: cat.icon, isSystem: true },
      create: { userId, ...cat, isSystem: true },
    })
  }
}


async function ensureDefaultChartOfAccounts(userId: string) {
  for (const account of DEFAULT_CHART_OF_ACCOUNTS) {
    await prisma.chartOfAccount.upsert({
      where: { userId_code: { userId, code: account.code } },
      update: { name: account.name, nameTH: account.nameTH, type: account.type, isSystem: true },
      create: { userId, code: account.code, name: account.name, nameTH: account.nameTH, type: account.type, isSystem: true },
    })
  }
}

async function main() {
  console.log("🌱 Seeding PayMap v14.0...")

  const hash = await bcrypt.hash("Demo1234", 12)

  // ── Demo Personal User ───────────────────────────────────────────────────
  const personalUser = await prisma.user.upsert({
    where: { email_accountMode: { email: "demo@paymap.th", accountMode: "personal" } },
    update: {},
    create: {
      email: "demo@paymap.th", name: "Demo User", passwordHash: hash, accountMode: "personal",
      provider: "credentials", plan: "pro", role: "user",
      emailVerified: new Date(), country: "TH", currency: "THB",
      locale: "th-TH", timezone: "Asia/Bangkok",
    },
  })
  await ensureDefaultCategories(personalUser.id)
  await ensureDefaultChartOfAccounts(personalUser.id)
  await prisma.productSubscription.upsert({
    where: { userId_product: { userId: personalUser.id, product: "personal" } },
    update: {}, create: { userId: personalUser.id, product: "personal", planTier: "pro", status: "active" },
  })

  // Sample transactions for personal user
  const cats = await prisma.category.findMany({ where: { userId: personalUser.id } })
  const salarycat = cats.find((c: { name: string; type: string }) => c.name === "Salary" && c.type === "income")!
  const foodcat   = cats.find((c: { name: string }) => c.name === "Food & Drink")!
  const transcat  = cats.find((c: { name: string }) => c.name === "Transport")!

  const now = new Date()
  const txData = [
    { type: "income" as const, amount: 45000, note: "เงินเดือน ม.ค.", happenedAt: new Date(now.getFullYear(), now.getMonth(), 1), categoryId: salarycat?.id },
    { type: "expense" as const, amount: 280,   note: "ข้าวมันไก่", happenedAt: new Date(now.getFullYear(), now.getMonth(), 3), categoryId: foodcat?.id },
    { type: "expense" as const, amount: 85,    note: "BTS", happenedAt: new Date(now.getFullYear(), now.getMonth(), 4), categoryId: transcat?.id },
    { type: "expense" as const, amount: 1200,  note: "Netflix + Spotify", happenedAt: new Date(now.getFullYear(), now.getMonth(), 5), categoryId: cats.find((c: { name: string; id: string }) => c.name === "Subscription")?.id },
    { type: "income" as const, amount: 8000,   note: "งาน Freelance Design", happenedAt: new Date(now.getFullYear(), now.getMonth(), 10), categoryId: cats.find((c: { name: string; id: string }) => c.name === "Freelance")?.id },
  ]
  for (const tx of txData) {
    await prisma.transaction.create({ data: { userId: personalUser.id, currency: "THB", ...tx } })
  }

  // ── Demo Business User ───────────────────────────────────────────────────
  const bizUser = await prisma.user.upsert({
    where: { email_accountMode: { email: "biz@paymap.th", accountMode: "business" } },
    update: {},
    create: {
      email: "biz@paymap.th", name: "Business Demo", passwordHash: hash, accountMode: "business",
      provider: "credentials", plan: "free", role: "user",
      emailVerified: new Date(), country: "TH", currency: "THB", locale: "th-TH", timezone: "Asia/Bangkok",
    },
  })
  await ensureDefaultCategories(bizUser.id)
  await ensureDefaultChartOfAccounts(bizUser.id)
  await prisma.productSubscription.upsert({
    where: { userId_product: { userId: bizUser.id, product: "business" } },
    update: {}, create: { userId: bizUser.id, product: "business", planTier: "scale", status: "active" },
  })

  const org = await prisma.organization.upsert({
    where: { slug: "demo-company" },
    update: {},
    create: { name: "Demo Company Co., Ltd.", slug: "demo-company", ownerId: bizUser.id, baseCurrency: "THB", country: "TH", plan: "pro" },
  })
  await prisma.organizationMember.upsert({
    where: { organizationId_userId: { organizationId: org.id, userId: bizUser.id } },
    update: { role: "owner" },
    create: { organizationId: org.id, userId: bizUser.id, role: "owner" },
  })

  // Seed employees
  const employees = [
    { name: "สมชาย ใจดี",    position: "Software Engineer", department: "Engineering", baseSalary: 45000 },
    { name: "สมหญิง รักงาน",  position: "Marketing Manager",  department: "Marketing",   baseSalary: 38000 },
    { name: "ประสิทธิ์ เก่ง", position: "Sales Executive",    department: "Sales",       baseSalary: 28000 },
  ]
  for (const e of employees) {
    const existing = await prisma.employee.findFirst({ where: { organizationId: org.id, name: e.name } })
    if (!existing) {
      const emp = await prisma.employee.create({
        data: { organizationId: org.id, ...e, startDate: new Date("2023-01-01"), status: "active", employmentType: "fulltime" },
      })
      const year = now.getFullYear()
      await prisma.leaveBalance.createMany({
        data: [
          { employeeId: emp.id, leaveType: "annual",  year, entitled: 6,  used: 0, remaining: 6  },
          { employeeId: emp.id, leaveType: "sick",    year, entitled: 30, used: 0, remaining: 30 },
          { employeeId: emp.id, leaveType: "personal",year, entitled: 3,  used: 0, remaining: 3  },
        ],
      })
    }
  }



  const businessEmployees = await prisma.employee.findMany({ where: { organizationId: org.id } })

  const payroll = await prisma.payrollRun.upsert({
    where: { organizationId_month_year: { organizationId: org.id, month: now.getMonth() + 1, year: now.getFullYear() } },
    update: { totalGross: 121000, totalNet: 115250, totalWht: 2700, totalSso: 3050, employeeCount: businessEmployees.length, status: "approved" },
    create: { organizationId: org.id, month: now.getMonth() + 1, year: now.getFullYear(), totalGross: 121000, totalNet: 115250, totalWht: 2700, totalSso: 3050, employeeCount: businessEmployees.length, status: "approved" },
  })

  for (const emp of businessEmployees) {
    await prisma.payrollItem.upsert({
      where: { payrollRunId_employeeId: { payrollRunId: payroll.id, employeeId: emp.id } },
      update: {},
      create: {
        payrollRunId: payroll.id,
        employeeId: emp.id,
        baseSalary: emp.baseSalary,
        grossSalary: emp.baseSalary,
        ssoEmployee: Math.min(Number(emp.baseSalary) * 0.05, 750),
        ssoEmployer: Math.min(Number(emp.baseSalary) * 0.05, 750),
        whtAmount: Number(emp.baseSalary) > 40000 ? 1200 : Number(emp.baseSalary) > 30000 ? 900 : 600,
        netSalary: Number(emp.baseSalary) - (Math.min(Number(emp.baseSalary) * 0.05, 750)) - (Number(emp.baseSalary) > 40000 ? 1200 : Number(emp.baseSalary) > 30000 ? 900 : 600),
      },
    })
  }

  const invoiceNumber = `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}-001`
  let invoice = await prisma.invoice.findFirst({ where: { organizationId: org.id, number: invoiceNumber } })
  if (!invoice) {
    invoice = await prisma.invoice.create({
      data: {
        organizationId: org.id,
        number: invoiceNumber,
        customerName: "Acme SME Co., Ltd.",
        customerEmail: "finance@acme.test",
        issuedAt: new Date(now.getFullYear(), now.getMonth(), 5),
        dueDate: new Date(now.getFullYear(), now.getMonth(), 20),
        paidAt: new Date(now.getFullYear(), now.getMonth(), 12),
        status: "paid",
        subtotal: 85000,
        taxAmount: 5950,
        totalAmount: 90950,
        items: {
          create: [
            { description: "Monthly consulting retainer", quantity: 1, unitPrice: 85000, lineTotal: 85000 },
          ],
        },
      },
    })
  }
  const existingPayment = await prisma.invoicePayment.findFirst({ where: { invoiceId: invoice.id, reference: "SEED-PAYMENT" } })
  if (!existingPayment) {
    await prisma.invoicePayment.create({ data: { invoiceId: invoice.id, paidAt: new Date(now.getFullYear(), now.getMonth(), 12), amount: 90950, method: "transfer", reference: "SEED-PAYMENT" } })
  }


  const pendingEmployee = businessEmployees[0]
  if (pendingEmployee) {
    const leaveExisting = await prisma.leaveRequest.findFirst({ where: { employeeId: pendingEmployee.id, organizationId: org.id } })
    if (!leaveExisting) {
      await prisma.leaveRequest.create({
        data: { employeeId: pendingEmployee.id, organizationId: org.id, leaveType: "annual", startDate: new Date(now.getFullYear(), now.getMonth(), 18), endDate: new Date(now.getFullYear(), now.getMonth(), 19), days: 2, reason: "พักผ่อน", status: "pending" },
      })
    }
  }

  // ── Demo Merchant User ───────────────────────────────────────────────────
  const merchantUser = await prisma.user.upsert({
    where: { email_accountMode: { email: "shop@paymap.th", accountMode: "merchant" } },
    update: {},
    create: {
      email: "shop@paymap.th", name: "Shop Demo", passwordHash: hash, accountMode: "merchant",
      provider: "credentials", plan: "free", role: "user",
      emailVerified: new Date(), country: "TH", currency: "THB", locale: "th-TH", timezone: "Asia/Bangkok",
    },
  })
  await ensureDefaultCategories(merchantUser.id)
  await ensureDefaultChartOfAccounts(merchantUser.id)
  await prisma.productSubscription.upsert({
    where: { userId_product: { userId: merchantUser.id, product: "merchant" } },
    update: {}, create: { userId: merchantUser.id, product: "merchant", planTier: "growth", status: "active" },
  })

  const store = await prisma.store.upsert({
    where: { id: "store-demo-001" },
    update: {},
    create: { id: "store-demo-001", userId: merchantUser.id, name: "ร้านสาธิต payMap", vatRegistered: true, taxId: "0000000000000", currency: "THB" },
  })

  const products = [
    { name: "กาแฟดำ",    sku: "COF-001", costPrice: 15, salePrice: 45, stockQty: 100, minStockQty: 20, category: "เครื่องดื่ม" },
    { name: "ลาเต้",     sku: "COF-002", costPrice: 25, salePrice: 65, stockQty: 80,  minStockQty: 15, category: "เครื่องดื่ม" },
    { name: "ชาไทย",     sku: "TEA-001", costPrice: 12, salePrice: 40, stockQty: 4,   minStockQty: 10, category: "เครื่องดื่ม" }, // low stock
    { name: "ขนมปัง",    sku: "BRD-001", costPrice: 8,  salePrice: 25, stockQty: 30,  minStockQty: 10, category: "อาหาร" },
  ]
  for (const p of products) {
    await prisma.merchantProduct.upsert({
      where: { storeId_sku: { storeId: store.id, sku: p.sku } },
      update: { stockQty: p.stockQty },
      create: { storeId: store.id, ...p, vatIncluded: true, status: "active", unit: "แก้ว" },
    })
  }



  const merchantProducts = await prisma.merchantProduct.findMany({ where: { storeId: store.id }, orderBy: { sku: "asc" } })
  const existingOrder = await prisma.salesOrder.findFirst({ where: { storeId: store.id } })
  if (!existingOrder && merchantProducts.length >= 3) {
    const lines = [
      { product: merchantProducts[0], qty: 18 },
      { product: merchantProducts[1], qty: 12 },
      { product: merchantProducts[2], qty: 9 },
    ]
    const subtotal = lines.reduce((sum, line) => sum + Number(line.product.salePrice) * line.qty, 0)
    const vat = subtotal * 0.07
    const order = await prisma.salesOrder.create({
      data: {
        storeId: store.id,
        orderNo: `SO-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,"0")}-001`,
        customerName: "Walk-in Customer",
        subtotal,
        vatAmount: vat,
        totalAmount: subtotal + vat,
        paymentMethod: "qr",
        status: "confirmed",
        soldAt: new Date(now.getFullYear(), now.getMonth(), 7, 10, 30),
        items: {
          create: lines.map((line) => ({
            productId: line.product.id,
            qty: line.qty,
            costPrice: line.product.costPrice,
            salePrice: line.product.salePrice,
            lineTotal: Number(line.product.salePrice) * line.qty,
          })),
        },
      },
    })

    for (const line of lines) {
      await prisma.inventoryLog.create({
        data: {
          productId: line.product.id,
          type: "out",
          qty: line.qty,
          qtyBefore: line.product.stockQty,
          qtyAfter: Math.max(0, line.product.stockQty - line.qty),
          note: `Sold in ${order.orderNo}`,
          refType: "sale",
          refId: order.id,
        },
      })
      await prisma.merchantProduct.update({ where: { id: line.product.id }, data: { stockQty: Math.max(0, line.product.stockQty - line.qty) } })
    }

    await prisma.vatReport.upsert({
      where: { storeId_month_year: { storeId: store.id, month: now.getMonth() + 1, year: now.getFullYear() } },
      update: { salesVat: vat, vatPayable: vat, totalSales: subtotal + vat },
      create: { storeId: store.id, month: now.getMonth() + 1, year: now.getFullYear(), salesVat: vat, vatPayable: vat, totalSales: subtotal + vat },
    })
  }


  // ── Demo Family Workspace ─────────────────────────────────────────────────


  // ── Admin User (personal mode + all product subscriptions for full access) ──
  const adminUser = await prisma.user.upsert({
    where: { email_accountMode: { email: "admin@paymap.th", accountMode: "personal" } },
    update: {},
    create: {
      email: "admin@paymap.th", name: "Admin", passwordHash: hash, accountMode: "personal",
      provider: "credentials", plan: "pro", role: "admin",
      emailVerified: new Date(), country: "TH", currency: "THB", locale: "th-TH", timezone: "Asia/Bangkok",
    },
  })
  await ensureDefaultCategories(adminUser.id)
  await ensureDefaultChartOfAccounts(adminUser.id)
  // Admin gets all product subscriptions at highest tier for full system inspection
  for (const [product, tier] of [["personal","pro"],["business","scale"],["merchant","growth"]] as const) {
    await prisma.productSubscription.upsert({
      where: { userId_product: { userId: adminUser.id, product } },
      update: { planTier: tier, status: "active" },
      create: { userId: adminUser.id, product, planTier: tier, status: "active" },
    })
  }

  // ── Demo Multi-Workspace (2nd org + 2nd store) ─────────────────────────────
  const bizUser2 = await prisma.user.upsert({
    where: { email_accountMode: { email: "biz@paymap.th", accountMode: "business" } },
    update: {},
    create: { email: "biz@paymap.th", name: "Business Demo", passwordHash: hash, accountMode: "business",
      provider: "credentials", plan: "free", role: "user",
      emailVerified: new Date(), country: "TH", currency: "THB", locale: "th-TH", timezone: "Asia/Bangkok" },
  })
  const secondOrg = await prisma.organization.upsert({
    where: { slug: "demo-company-2" },
    update: {},
    create: { name: "Demo Startup Co., Ltd.", slug: "demo-company-2", ownerId: bizUser2.id, baseCurrency: "THB", country: "TH", plan: "free" },
  })
  await prisma.organizationMember.upsert({
    where: { organizationId_userId: { organizationId: secondOrg.id, userId: bizUser2.id } },
    update: { role: "owner" },
    create: { organizationId: secondOrg.id, userId: bizUser2.id, role: "owner" },
  })

  // Second merchant store for shop@paymap.th
  const merchantUser2 = await prisma.user.upsert({
    where: { email_accountMode: { email: "shop@paymap.th", accountMode: "merchant" } },
    update: {},
    create: { email: "shop@paymap.th", name: "Shop Demo", passwordHash: hash, accountMode: "merchant",
      provider: "credentials", plan: "free", role: "user",
      emailVerified: new Date(), country: "TH", currency: "THB", locale: "th-TH", timezone: "Asia/Bangkok" },
  })
  const existingStores = await prisma.store.count({ where: { userId: merchantUser2.id } })
  if (existingStores < 2) {
    await prisma.store.create({
      data: { userId: merchantUser2.id, name: "ร้านสาธิต สาขา 2", vatRegistered: false, currency: "THB" },
    })
  }

  console.log("✅ Seed complete!")
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  console.log("👤 Personal: demo@paymap.th  / Demo1234  → /dashboard")
  console.log("🏢 Business: biz@paymap.th   / Demo1234  → /business")
  console.log("🏪 Merchant: shop@paymap.th  / Demo1234  → /merchant")
  console.log("🔑 Admin:    admin@paymap.th / Demo1234  → /dashboard (role=admin)")
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
