import { getOptionalEnv } from "@/lib/env"

export type BillingInterval = "monthly" | "yearly"
export type PlanKey = "free" | "pro" | "family"
export type BusinessPlanKey = "free" | "sme" | "scale" | "enterprise"
export type MerchantPlanKey = "free" | "starter" | "growth" | "scale" | "enterprise"

export const PLAN_LIMITS = {
  free: {
    transactions: 500,       // v3.1: generous free tier to attract users
    budgets: 10,
    goals: 5,
    export: true,            // allow basic export
    exportPerMonth: 5,
    multiCurrency: false,
    aiInsights: 5,           // taste of AI advisor
    recurring: 5,
    storage_mb: 500,
  },
  pro: {
    transactions: 100_000,
    budgets: 100,
    goals: 100,
    export: true,
    exportPerMonth: 1_000,
    multiCurrency: true,
    aiInsights: 300,
    recurring: 100,
    storage_mb: 5_000,
  },
  family: {
    transactions: 100_000,
    budgets: 250,
    goals: 250,
    export: true,
    exportPerMonth: 2_000,
    multiCurrency: true,
    aiInsights: 600,
    recurring: 250,
    storage_mb: 10_000,
  },
} as const

export const BUSINESS_LIMITS = {
  free: { employees: 10, payrollRuns: 1, invoices: 25, bankFile: false, eFiling: false, analytics: false, admins: 1 },
  sme: { employees: 100, payrollRuns: 12, invoices: 2_000, bankFile: true, eFiling: true, analytics: true, admins: 5 },
  scale: { employees: 500, payrollRuns: 24, invoices: 10_000, bankFile: true, eFiling: true, analytics: true, admins: 15 },
  enterprise: { employees: 9_999, payrollRuns: 999, invoices: 999_999, bankFile: true, eFiling: true, analytics: true, admins: 999 },
} as const

export const MERCHANT_LIMITS = {
  free: { skus: 100, salesOrders: 300, branches: 1, vatReport: false, users: 1, suppliers: 0, purchaseOrders: 0 },
  starter: { skus: 500, salesOrders: 3_000, branches: 1, vatReport: false, users: 2, suppliers: 10, purchaseOrders: 30 },
  growth: { skus: 50_000, salesOrders: 50_000, branches: 3, vatReport: true, users: 5, suppliers: 100, purchaseOrders: 1_000 },
  scale: { skus: 250_000, salesOrders: 250_000, branches: 10, vatReport: true, users: 20, suppliers: 1_000, purchaseOrders: 10_000 },
  enterprise: { skus: 999_999, salesOrders: 999_999, branches: 999, vatReport: true, users: 999, suppliers: 999_999, purchaseOrders: 999_999 },
} as const

export const PLAN_PRICING = {
  free: {
    name: "Personal Free",
    thb: 0,
    yearlyThb: 0,
    badge: null,
    features: [
      "บันทึกรายรับ-รายจ่าย 500 รายการ/เดือน",
      "Budget planner 10 หมวด",
      "Savings goals 5 เป้า",
      "Export ข้อมูล 5 ครั้ง/เดือน",
      "AI Advisor 5 ครั้ง/เดือน",
      "Dashboard + Tax คำนวณภาษี",
    ],
  },
  pro: {
    name: "Personal Pro",
    thb: 129,
    yearlyThb: 1290,
    badge: "ยอดนิยม",
    features: [
      "รายรับ-รายจ่ายไม่จำกัด",
      "OCR อ่านสลิปอัตโนมัติ",
      "Subscription tracker",
      "Savings goals + Cashflow forecast",
      "Export PDF / Excel",
    ],
  },
  family: {
    name: "Family",
    thb: 249,
    yearlyThb: 2490,
    badge: "สำหรับครอบครัว",
    features: [
      "สมาชิกสูงสุด 5 คน",
      "Family budget",
      "Net worth ครอบครัว",
      "รายงานรวมทั้งบ้าน",
    ],
  },
} as const

export const BUSINESS_PRICING = {
  free: {
    name: "Business Free",
    thb: 0,
    yearlyThb: 0,
    features: [
      "พนักงานสูงสุด 10 คน",
      "Payroll basic",
      "Payslip",
      "Leave management",
      "ภ.ง.ด.1",
    ],
  },
  sme: {
    name: "Business SME",
    thb: 1190,
    yearlyThb: 11900,
    features: [
      "พนักงานสูงสุด 100 คน",
      "Payroll automation",
      "Bank transfer file",
      "e-Filing",
      "HR dashboard + 5 admin",
    ],
  },
  scale: {
    name: "Business Scale",
    thb: 2490,
    yearlyThb: 24900,
    features: [
      "พนักงานสูงสุด 500 คน",
      "HR analytics",
      "Performance system",
      "API",
    ],
  },
  enterprise: {
    name: "Business Enterprise",
    thb: 35,
    yearlyThb: 350,
    features: [
      "คิดราคา 35 บาท / คน / เดือน",
      "Unlimited employee",
      "ERP integration",
      "Custom payroll + SLA",
    ],
  },
} as const

export const MERCHANT_PRICING = {
  free: {
    name: "Merchant Free",
    thb: 0,
    yearlyThb: 0,
    features: [
      "1 สาขา · 100 SKU · 1 user",
      "POS + ใบเสร็จ",
      "Inventory basic",
      "Dashboard ยอดขาย + Stock alert",
    ],
  },
  starter: {
    name: "Merchant Starter",
    thb: 199,
    yearlyThb: 1990,
    features: [
      "1 สาขา · 500 SKU · 2 users",
      "POS + Inventory",
      "Sales report",
      "Stock alert + Export report",
    ],
  },
  growth: {
    name: "Merchant Growth",
    thb: 399,
    yearlyThb: 3990,
    features: [
      "3 สาขา · SKU ไม่จำกัด · 5 users",
      "VAT + ภ.พ.30",
      "Supplier + Purchase order",
      "Sales analytics + Customer data",
    ],
  },
  scale: {
    name: "Merchant Scale",
    thb: 699,
    yearlyThb: 6990,
    features: [
      "10 สาขา · 20 users",
      "Multi branch",
      "Advanced analytics",
      "API integration + CRM ลูกค้า",
    ],
  },
  enterprise: {
    name: "Merchant Enterprise",
    thb: 0,
    yearlyThb: 0,
    features: [
      "Custom pricing",
      "สาขาไม่จำกัด",
      "ERP integration + API",
      "SLA",
    ],
  },
} as const

export function getStripePrices() {
  return {
    personal: {
      pro: {
        monthly: getOptionalEnv("STRIPE_PRICE_PRO_MONTHLY") ?? "",
        yearly: getOptionalEnv("STRIPE_PRICE_PRO_YEARLY") ?? "",
      },
      family: {
        monthly: getOptionalEnv("STRIPE_PRICE_FAMILY_MONTHLY") ?? "",
        yearly: getOptionalEnv("STRIPE_PRICE_FAMILY_YEARLY") ?? "",
      },
    },
    business: {
      sme: {
        monthly: getOptionalEnv("STRIPE_PRICE_BUSINESS_SME_MONTHLY") ?? "",
        yearly: getOptionalEnv("STRIPE_PRICE_BUSINESS_SME_YEARLY") ?? "",
      },
      scale: {
        monthly: getOptionalEnv("STRIPE_PRICE_BUSINESS_SCALE_MONTHLY") ?? getOptionalEnv("STRIPE_PRICE_BUSINESS_GROWING_MONTHLY") ?? "",
        yearly: getOptionalEnv("STRIPE_PRICE_BUSINESS_SCALE_YEARLY") ?? getOptionalEnv("STRIPE_PRICE_BUSINESS_GROWING_YEARLY") ?? "",
      },
    },
    merchant: {
      starter: {
        monthly: getOptionalEnv("STRIPE_PRICE_MERCHANT_STARTER_MONTHLY") ?? "",
        yearly: getOptionalEnv("STRIPE_PRICE_MERCHANT_STARTER_YEARLY") ?? "",
      },
      growth: {
        monthly: getOptionalEnv("STRIPE_PRICE_MERCHANT_GROWTH_MONTHLY") ?? "",
        yearly: getOptionalEnv("STRIPE_PRICE_MERCHANT_GROWTH_YEARLY") ?? "",
      },
      scale: {
        monthly: getOptionalEnv("STRIPE_PRICE_MERCHANT_SCALE_MONTHLY") ?? "",
        yearly: getOptionalEnv("STRIPE_PRICE_MERCHANT_SCALE_YEARLY") ?? "",
      },
    },
    aiAdvisor: {
      monthly: getOptionalEnv("STRIPE_PRICE_AI_ADVISOR_MONTHLY") ?? "",
      yearly: getOptionalEnv("STRIPE_PRICE_AI_ADVISOR_YEARLY") ?? "",
    },
  } as const
}

export function resolvePersonalPlan(planTier?: string | null): PlanKey {
  if (planTier === "pro" || planTier === "family") return planTier
  return "free"
}

export function resolveProductFromPriceId(priceId: string): { product: "personal" | "business" | "merchant"; tier: string } | null {
  const prices = getStripePrices()

  if ([prices.personal.pro.monthly, prices.personal.pro.yearly].includes(priceId)) return { product: "personal", tier: "pro" }
  if ([prices.personal.family.monthly, prices.personal.family.yearly].includes(priceId)) return { product: "personal", tier: "family" }

  if ([prices.business.sme.monthly, prices.business.sme.yearly].includes(priceId)) return { product: "business", tier: "sme" }
  if ([prices.business.scale.monthly, prices.business.scale.yearly].includes(priceId)) return { product: "business", tier: "scale" }

  if ([prices.merchant.starter.monthly, prices.merchant.starter.yearly].includes(priceId)) return { product: "merchant", tier: "starter" }
  if ([prices.merchant.growth.monthly, prices.merchant.growth.yearly].includes(priceId)) return { product: "merchant", tier: "growth" }
  if ([prices.merchant.scale.monthly, prices.merchant.scale.yearly].includes(priceId)) return { product: "merchant", tier: "scale" }

  if ([prices.aiAdvisor.monthly, prices.aiAdvisor.yearly].includes(priceId)) return { product: "personal", tier: "ai_advisor" }

  return null
}

export function checkPlanLimit(plan: PlanKey, feature: keyof typeof PLAN_LIMITS.free, current?: number) {
  const limit = PLAN_LIMITS[plan][feature]
  if (typeof limit === "boolean") return { allowed: limit, limit }
  if (typeof current === "number") return { allowed: current < (limit as number), limit: limit as number, current }
  return { allowed: true, limit: limit as number }
}

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return null
  const Stripe = require("stripe")
  return new Stripe(key, { apiVersion: "2024-04-10" })
}

export function getPlanFromPriceId(priceId: string): string | null {
  return resolveProductFromPriceId(priceId)?.tier ?? null
}

export const BUSINESS_PLAN_LIMITS = BUSINESS_LIMITS
export const MERCHANT_PLAN_LIMITS = MERCHANT_LIMITS
