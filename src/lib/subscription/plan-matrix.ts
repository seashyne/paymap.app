export type ProductKey = "personal" | "business" | "merchant" | "enterprise"

export type FeatureKey =
  | "wallets"
  | "budget"
  | "savings"
  | "networth"
  | "reports_basic"
  | "reports_financial"
  | "simulation"
  | "investments"
  | "installments"
  | "tax_basic"
  | "ai_insights"
  | "advanced_exports"
  | "business_overview"
  | "business_payroll_basic"
  | "business_invoices_lite"
  | "business_accounting"
  | "business_reconciliation"
  | "business_tax_advanced"
  | "merchant_overview"
  | "merchant_sales_basic"
  | "merchant_inventory_basic"
  | "merchant_accounting"
  | "merchant_reconciliation"
  | "merchant_vat"
  | "enterprise_controls"
  | "enterprise_reports"

export const FEATURE_META: Record<FeatureKey, { title: string; description: string; upgradeProduct: ProductKey; minimumPlan: string }> = {
  wallets: { title: "Wallets", description: "ติดตามยอดเงินและ cash positions", upgradeProduct: "personal", minimumPlan: "free" },
  budget: { title: "Budget", description: "จัดการ budget และ envelope แบบรายเดือน", upgradeProduct: "personal", minimumPlan: "free" },
  savings: { title: "Savings", description: "เป้าหมายการออมและเงินสำรอง", upgradeProduct: "personal", minimumPlan: "free" },
  networth: { title: "Net worth", description: "ดูภาพรวมทรัพย์สินและหนี้สิน", upgradeProduct: "personal", minimumPlan: "free" },
  reports_basic: { title: "Basic reports", description: "รายงานส่วนตัวและ export เบื้องต้น", upgradeProduct: "personal", minimumPlan: "free" },
  reports_financial: { title: "Financial statements", description: "งบการเงินและรายงานการเงินขั้นสูง", upgradeProduct: "personal", minimumPlan: "free" },
  simulation: { title: "Simulation", description: "วางแผนอนาคตด้วยข้อมูลการเงินจริง", upgradeProduct: "personal", minimumPlan: "free" },
  investments: { title: "Investments", description: "ติดตามพอร์ตลงทุนและผลตอบแทน", upgradeProduct: "personal", minimumPlan: "free" },
  installments: { title: "Installments", description: "ติดตามผ่อนชำระและภาระผูกพัน", upgradeProduct: "personal", minimumPlan: "free" },
  tax_basic: { title: "Tax basic", description: "คำนวณภาษีพื้นฐานและ preview", upgradeProduct: "personal", minimumPlan: "free" },
  ai_insights: { title: "AI insights", description: "AI Advisor, insights และ automation", upgradeProduct: "personal", minimumPlan: "pro" },
  advanced_exports: { title: "Advanced exports", description: "Export ขั้นสูงและ automation", upgradeProduct: "personal", minimumPlan: "pro" },
  business_overview: { title: "Business overview", description: "แดชบอร์ดธุรกิจ, พนักงาน และภาพรวมทีม", upgradeProduct: "business", minimumPlan: "free" },
  business_payroll_basic: { title: "Payroll basic", description: "พนักงาน, ลา, payroll พื้นฐานสำหรับทีมเล็ก", upgradeProduct: "business", minimumPlan: "free" },
  business_invoices_lite: { title: "Invoices Lite", description: "ออก invoice ได้จำนวนจำกัดสำหรับธุรกิจเล็ก", upgradeProduct: "business", minimumPlan: "free" },
  business_accounting: { title: "Business accounting", description: "ledger, journal, statements และ close", upgradeProduct: "business", minimumPlan: "sme" },
  business_reconciliation: { title: "Business reconciliation", description: "กระทบยอด statement และ accounting", upgradeProduct: "business", minimumPlan: "sme" },
  business_tax_advanced: { title: "Business tax", description: "VAT / tax workflow ขั้นสูงสำหรับธุรกิจ", upgradeProduct: "business", minimumPlan: "sme" },
  merchant_overview: { title: "Merchant overview", description: "ภาพรวมร้านค้าและ POS dashboard", upgradeProduct: "merchant", minimumPlan: "free" },
  merchant_sales_basic: { title: "Sales basic", description: "ขายสินค้าและติดตามออเดอร์พื้นฐาน", upgradeProduct: "merchant", minimumPlan: "free" },
  merchant_inventory_basic: { title: "Inventory basic", description: "สต็อกพื้นฐานและแจ้งเตือนของใกล้หมด", upgradeProduct: "merchant", minimumPlan: "free" },
  merchant_accounting: { title: "Merchant accounting", description: "VAT, accounting และ statements สำหรับร้าน", upgradeProduct: "merchant", minimumPlan: "growth" },
  merchant_reconciliation: { title: "Merchant reconciliation", description: "กระทบยอดยอดขายกับ statement", upgradeProduct: "merchant", minimumPlan: "growth" },
  merchant_vat: { title: "Merchant VAT", description: "VAT report และ tax workflow สำหรับร้าน", upgradeProduct: "merchant", minimumPlan: "growth" },
  enterprise_controls: { title: "Enterprise controls", description: "governance, approvals และ member controls", upgradeProduct: "enterprise", minimumPlan: "enterprise" },
  enterprise_reports: { title: "Enterprise reports", description: "cross-org reporting และ executive dashboards", upgradeProduct: "enterprise", minimumPlan: "enterprise" },
}

export const PERSONAL_PLAN_FEATURES = {
  free: ["wallets", "budget", "savings", "networth", "reports_basic", "reports_financial", "simulation", "investments", "installments", "tax_basic"] as FeatureKey[],
  pro: ["wallets", "budget", "savings", "networth", "reports_basic", "reports_financial", "simulation", "investments", "installments", "tax_basic", "ai_insights", "advanced_exports"] as FeatureKey[],
  family: ["wallets", "budget", "savings", "networth", "reports_basic", "reports_financial", "simulation", "investments", "installments", "tax_basic", "ai_insights", "advanced_exports"] as FeatureKey[],
} as const

export const BUSINESS_PLAN_FEATURES = {
  free: ["business_overview", "business_payroll_basic", "business_invoices_lite"] as FeatureKey[],
  sme: ["business_overview", "business_payroll_basic", "business_invoices_lite", "business_accounting", "business_reconciliation", "business_tax_advanced"] as FeatureKey[],
  scale: ["business_overview", "business_payroll_basic", "business_invoices_lite", "business_accounting", "business_reconciliation", "business_tax_advanced"] as FeatureKey[],
  enterprise: ["business_overview", "business_payroll_basic", "business_invoices_lite", "business_accounting", "business_reconciliation", "business_tax_advanced", "enterprise_controls", "enterprise_reports"] as FeatureKey[],
} as const

export const MERCHANT_PLAN_FEATURES = {
  free: ["merchant_overview", "merchant_sales_basic", "merchant_inventory_basic"] as FeatureKey[],
  starter: ["merchant_overview", "merchant_sales_basic", "merchant_inventory_basic"] as FeatureKey[],
  growth: ["merchant_overview", "merchant_sales_basic", "merchant_inventory_basic", "merchant_accounting", "merchant_reconciliation", "merchant_vat"] as FeatureKey[],
  scale: ["merchant_overview", "merchant_sales_basic", "merchant_inventory_basic", "merchant_accounting", "merchant_reconciliation", "merchant_vat"] as FeatureKey[],
  enterprise: ["merchant_overview", "merchant_sales_basic", "merchant_inventory_basic", "merchant_accounting", "merchant_reconciliation", "merchant_vat", "enterprise_controls", "enterprise_reports"] as FeatureKey[],
} as const

export const FEATURED_PRICING_COPY = {
  free: "ใช้ฟรีได้เยอะ เหมาะกับการใช้งานจริงรายวัน",
  pro: "ปลดล็อก AI และ analytics สำหรับ power users",
  business: "เปิด accounting, tax และ reconciliation สำหรับธุรกิจ",
  enterprise: "governance, multi-org และ executive controls"
} as const
