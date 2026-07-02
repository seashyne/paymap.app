import { BarChart3, Building2, CreditCard, Heart, Landmark, type LucideIcon, Package, PiggyBank, Receipt, Settings, ShoppingCart, Sparkles, Store, UserCircle2, Users, Wallet } from "lucide-react"
import type { DashboardTemplate } from "@/lib/ui-preferences"

export type TemplateQuickAction = {
  href: string
  label: string
  description: string
  accent: string
  icon: LucideIcon
}

export type TemplateWidget = {
  href: string
  title: string
  description: string
  accent: string
  icon: LucideIcon
  tag: string
}

export type KpiKey = "balance" | "wallets" | "transactions" | "activity"

const NAV_LABELS: Record<DashboardTemplate, Array<{ test: (href: string, label: string) => boolean; label: string }>> = {
  personal: [
    { test: (href) => href.includes('/dashboard'), label: 'Overview' },
    { test: (href) => href.includes('/wallet'), label: 'Wallets' },
    { test: (href) => href.includes('/reports'), label: 'Spending Reports' },
    { test: (href) => href.includes('/billing'), label: 'Plan & Billing' },
    { test: (href) => href.includes('/settings'), label: 'Preferences' },
  ],
  business: [
    { test: (href) => href.includes('/business') && href.includes('tab=overview'), label: 'Executive Overview' },
    { test: (href) => href.includes('/business/payroll'), label: 'Payroll Ops' },
    { test: (href) => href.includes('/business/accounting'), label: 'Accounting Close' },
    { test: (href) => href.includes('/reports'), label: 'Board Reports' },
    { test: (href) => href.includes('/settings'), label: 'Admin Settings' },
  ],
  merchant: [
    { test: (href) => href.includes('/merchant') && !href.includes('/merchant/'), label: 'Store Overview' },
    { test: (href) => href.includes('/merchant/sales'), label: 'Sales Flow' },
    { test: (href) => href.includes('/merchant/inventory'), label: 'Stock Control' },
    { test: (href) => href.includes('/reports'), label: 'Sales Reports' },
    { test: (href) => href.includes('/settings'), label: 'Store Settings' },
  ],
  family: [
    { test: (href, label) => href.includes('tab=family') || label.toLowerCase().includes('family'), label: 'Family Hub' },
    { test: (href) => href.includes('/dashboard'), label: 'Home Overview' },
    { test: (href) => href.includes('/wallet'), label: 'Shared Wallets' },
    { test: (href) => href.includes('/reports'), label: 'Family Reports' },
    { test: (href) => href.includes('/settings'), label: 'House Settings' },
  ],
}

const PAGE_CONTENT: Record<DashboardTemplate, Record<string, { title: string; subtitle: string }>> = {
  personal: {
    dashboard: { title: 'Personal Dashboard', subtitle: 'ภาพรวมการเงินส่วนตัวที่อ่านง่าย โฟกัสกระเป๋าเงิน รายงาน และงานที่ควรทำต่อทันที' },
    business: { title: 'Business Finance', subtitle: 'มุมมองธุรกิจสำหรับเจ้าของที่ต้องการติดตามทีม payroll และงบการเงินจากจุดเดียว' },
    merchant: { title: 'Merchant Control', subtitle: 'ติดตามยอดขาย สต็อก และคำสั่งขายได้จากมุมมองที่อ่านเร็วและคลิกงานต่อได้ไว' },
    reports: { title: 'Reports & Exports', subtitle: 'รวมรายงานหลักที่อ่านง่าย ส่งออกได้ และช่วยตัดสินใจจากข้อมูลจริง' },
  },
  business: {
    dashboard: { title: 'Executive Money Hub', subtitle: 'โหมดธุรกิจจะดันงานคุมกระแสเงินสด รายงาน และสิ่งที่ทีมต้องเคลียร์ก่อนปิดงวดขึ้นมาก่อน' },
    business: { title: 'Business Executive Console', subtitle: 'โฟกัส headcount, payroll, accounting close และ board-level reporting ให้เห็นก่อนทุกอย่าง' },
    merchant: { title: 'Revenue Operations', subtitle: 'ใช้มุมมองธุรกิจดูยอดขายและ inventory เป็นส่วนหนึ่งของรายงานผู้บริหารและการควบคุมกำไร' },
    reports: { title: 'Board Reports Center', subtitle: 'รวม personal, business และ merchant metrics ไว้ใน report center แบบพร้อมเอาไปประชุมต่อ' },
  },
  merchant: {
    dashboard: { title: 'Operator Dashboard', subtitle: 'จัดลำดับงานสำหรับคนเปิดร้านจริง เน้นยอดวันนี้ เงินเข้า และปุ่มที่ใช้หน้างานบ่อยที่สุด' },
    business: { title: 'Backoffice & Profit', subtitle: 'มอง payroll และบัญชีในมุมที่รองรับหน้าร้านและการคุมกำไรต่อสินค้า' },
    merchant: { title: 'Merchant Control Center', subtitle: 'ให้ยอดขาย สต็อก และสินค้าที่ต้องรีบจัดการเด่นขึ้นก่อน เพื่อใช้ได้จริงทุกวัน' },
    reports: { title: 'Sales & Margin Reports', subtitle: 'รายงานที่เน้น order velocity, revenue และสินค้าขายดี สำหรับ owner และ operator' },
  },
  family: {
    dashboard: { title: 'Family Shared Hub', subtitle: 'หน้าแรกที่เน้นงบครอบครัว เป้าหมายร่วม และสิ่งที่ควรคุยกันในบ้านแบบเห็นภาพง่าย' },
    business: { title: 'Family Business View', subtitle: 'ถ้าครอบครัวดูแลธุรกิจร่วมกัน จะเน้นความเข้าใจง่ายและงานที่ต้องประสานกันมากกว่าความหนาแน่นของข้อมูล' },
    merchant: { title: 'Family Store View', subtitle: 'ช่วยให้คนในบ้านดูยอดขาย สต็อก และงานหน้าร้านร่วมกันได้ง่ายขึ้น' },
    reports: { title: 'Family Reports', subtitle: 'รายงานที่แปลตัวเลขให้เข้าใจง่าย เหมาะกับการคุยแผนใช้เงินร่วมกันในบ้าน' },
  },
}

const KPI_CONFIG: Record<DashboardTemplate, { order: KpiKey[]; labels: Record<KpiKey, string> }> = {
  personal: {
    order: ["balance", "wallets", "transactions", "activity"],
    labels: { balance: "ยอดรวมทุก wallet", wallets: "จำนวน wallet", transactions: "ธุรกรรมทั้งหมด", activity: "กิจกรรม 30 วัน" },
  },
  business: {
    order: ["balance", "activity", "transactions", "wallets"],
    labels: { balance: "cash position", wallets: "บัญชี/กระเป๋า", transactions: "รายการการเงิน", activity: "กิจกรรมเดือนนี้" },
  },
  merchant: {
    order: ["activity", "balance", "transactions", "wallets"],
    labels: { balance: "เงินพร้อมใช้", wallets: "ช่องเงินเข้า", transactions: "รายการขาย/รับเงิน", activity: "ความเคลื่อนไหว 30 วัน" },
  },
  family: {
    order: ["balance", "wallets", "activity", "transactions"],
    labels: { balance: "เงินรวมของบ้าน", wallets: "กระเป๋าที่ดูร่วมกัน", transactions: "ธุรกรรมทั้งหมด", activity: "กิจกรรมครอบครัว 30 วัน" },
  },
}

const QUICK_ACTIONS: Record<DashboardTemplate, (aiLocked: boolean) => TemplateQuickAction[]> = {
  personal: (aiLocked) => [
    { href: "/wallets", label: "จัดการ Wallet", description: "ดูยอดคงเหลือและโครงสร้างเงินทั้งหมด", icon: Wallet, accent: "#8b5cf6" },
    { href: "/reports", label: "ดู Spending Reports", description: "เช็กรายรับรายจ่ายและหมวดใช้เงินจริง", icon: Landmark, accent: "#14b8a6" },
    { href: "/settings/pay-profile", label: "ตั้ง Pay Profile", description: "สร้างหน้ารับเงินและลิงก์แชร์", icon: UserCircle2, accent: "#10b981" },
    { href: aiLocked ? "/pricing" : "/billing", label: aiLocked ? "ปลดล็อก AI" : "จัดการ AI", description: aiLocked ? "อัปเกรดเพื่อใช้ AI insights" : "ตรวจสิทธิ์ AI และ automation", icon: Sparkles, accent: "#f59e0b" },
    { href: "/billing#history", label: "ประวัติการซื้อ", description: "ตรวจ invoice และการชำระเงินล่าสุด", icon: Receipt, accent: "#0ea5e9" },
    { href: "/settings", label: "ตั้งค่าหน้าตา", description: "ปรับธีม template และ layout ที่ใช้ทุกวัน", icon: Settings, accent: "#f97316" },
  ],
  business: () => [
    { href: "/business", label: "Executive Overview", description: "กลับไปดูภาพรวมทีม เงินเดือน และงานค้าง", icon: Building2, accent: "#38bdf8" },
    { href: "/business/payroll", label: "รัน Payroll", description: "เข้าหน้า payroll และงานพนักงานที่ต้องทำต่อ", icon: CreditCard, accent: "#0ea5e9" },
    { href: "/business/accounting", label: "Close Accounting", description: "เข้า journal, ledger และปิดงวด", icon: Landmark, accent: "#14b8a6" },
    { href: "/reports/financial", label: "Board Reports", description: "เปิดรายงานทางการเงินสำหรับประชุมหรือสรุปผู้บริหาร", icon: BarChart3, accent: "#22c55e" },
    { href: "/settings/legal", label: "Legal & Compliance", description: "เช็ก policy, consent และการตั้งค่าที่กระทบ production", icon: Settings, accent: "#f59e0b" },
    { href: "/billing?product=business", label: "ดูแผน Business", description: "ตรวจแผนและสิทธิ์ของโมดูล accounting/reconciliation", icon: Sparkles, accent: "#8b5cf6" },
  ],
  merchant: () => [
    { href: "/merchant", label: "Store Overview", description: "กลับไปดูยอดขายและสุขภาพร้าน", icon: Store, accent: "#fb7185" },
    { href: "/merchant/sales", label: "เปิด Sales Flow", description: "เข้าสู่หน้าขายและดูคำสั่งขายล่าสุด", icon: ShoppingCart, accent: "#e11d48" },
    { href: "/merchant/inventory", label: "เช็ก Stock", description: "ดูสินค้าใกล้หมดและแก้สต็อกต่อทันที", icon: Package, accent: "#f97316" },
    { href: "/reports", label: "Sales Reports", description: "ดูรายงานยอดขายและสินค้าขายดี", icon: BarChart3, accent: "#22c55e" },
    { href: "/wallets", label: "เช็กเงินเข้า", description: "ดูปลายทางรับเงินและกระแสเงินสดของร้าน", icon: Wallet, accent: "#8b5cf6" },
    { href: "/settings", label: "Store Settings", description: "ปรับหน้าตาและค่าร้านที่ต้องใช้ทุกวัน", icon: Settings, accent: "#0ea5e9" },
  ],
  family: () => [
    { href: "/dashboard?tab=family", label: "เข้า Family Hub", description: "ดูสมาชิก งบประมาณ และสถานะที่บ้านร่วมกัน", icon: Heart, accent: "#f43f5e" },
    { href: "/wallets", label: "กระเป๋าร่วมของบ้าน", description: "เปิดดูบัญชีและกระเป๋าที่ใช้ร่วมกัน", icon: Wallet, accent: "#14b8a6" },
    { href: "/reports", label: "รายงานครอบครัว", description: "สรุปรายรับรายจ่ายให้คุยกันง่ายขึ้น", icon: BarChart3, accent: "#0ea5e9" },
    { href: "/settings", label: "House Preferences", description: "ปรับธีม หน้าตา และโครงสร้างใช้งานร่วมกัน", icon: Settings, accent: "#f59e0b" },
    { href: "/settings/pay-profile", label: "สร้างลิงก์รับเงิน", description: "ตั้งค่าการรับเงินสำหรับคนในบ้านหรือกิจกรรมร่วม", icon: UserCircle2, accent: "#10b981" },
    { href: "/billing", label: "แผนและสิทธิ์ใช้งาน", description: "เช็กฟีเจอร์ที่ใช้กับหลายคนหรือหลาย workspace", icon: Sparkles, accent: "#8b5cf6" },
  ],
}

const RECOMMENDED_WIDGETS: Record<DashboardTemplate, TemplateWidget[]> = {
  personal: [
    { href: "/wallets", title: "Wallet health", description: "เช็กโครงสร้างเงินสดและยอดรวมของทุก wallet", icon: Wallet, accent: "#8b5cf6", tag: "Core" },
    { href: "/reports", title: "Spending report", description: "ดูแนวโน้มรายจ่ายและหมวดที่ใช้มากที่สุด", icon: BarChart3, accent: "#14b8a6", tag: "Insight" },
    { href: "/installments", title: "Installments", description: "ติดตามภาระผ่อนและรายการที่ต้องระวัง", icon: CreditCard, accent: "#f59e0b", tag: "Planning" },
  ],
  business: [
    { href: "/business/payroll", title: "Payroll watch", description: "เข้าไปเคลียร์ payroll, leave และ headcount", icon: Users, accent: "#38bdf8", tag: "Ops" },
    { href: "/business/accounting", title: "Month-end close", description: "เข้า journal, ledger และรายงานการเงิน", icon: Landmark, accent: "#14b8a6", tag: "Finance" },
    { href: "/reports/financial", title: "Board pack", description: "เตรียมรายงานการเงินสำหรับสรุปผู้บริหาร", icon: BarChart3, accent: "#22c55e", tag: "Exec" },
  ],
  merchant: [
    { href: "/merchant/sales", title: "Sales pulse", description: "จับยอดขายและคำสั่งขายของวันให้ไว", icon: ShoppingCart, accent: "#e11d48", tag: "Daily" },
    { href: "/merchant/inventory", title: "Low stock sweep", description: "เช็กสินค้าที่ต้องเติมและ SKU ที่เสี่ยงขาด", icon: Package, accent: "#f97316", tag: "Stock" },
    { href: "/reports", title: "Revenue & margin", description: "รายงานยอดขาย สินค้าขายดี และรายได้รวม", icon: BarChart3, accent: "#22c55e", tag: "Insight" },
  ],
  family: [
    { href: "/dashboard?tab=family", title: "Family hub", description: "ดูสมาชิก งบ และภาพรวมร่วมของครอบครัว", icon: Heart, accent: "#f43f5e", tag: "Shared" },
    { href: "/wallets", title: "Shared wallets", description: "แยกกระเป๋าเงินของบ้านให้เข้าใจง่ายขึ้น", icon: Wallet, accent: "#14b8a6", tag: "Money" },
    { href: "/reports", title: "Family planning", description: "คุยแผนใช้เงินด้วยรายงานที่ย่อยง่ายกว่าเดิม", icon: PiggyBank, accent: "#0ea5e9", tag: "Plan" },
  ],
}

export function getTemplateNavLabel(template: DashboardTemplate, href: string, currentLabel: string) {
  const match = NAV_LABELS[template].find((item) => item.test(href.toLowerCase(), currentLabel.toLowerCase()))
  return match?.label ?? currentLabel
}

export function getTemplatePageContent(template: DashboardTemplate, pageKey: string) {
  return PAGE_CONTENT[template]?.[pageKey] ?? PAGE_CONTENT.personal[pageKey] ?? { title: "PayMap", subtitle: "Workspace" }
}

export function getTemplateKpiConfig(template: DashboardTemplate) {
  return KPI_CONFIG[template]
}

export function getTemplateQuickActions(template: DashboardTemplate, aiLocked: boolean) {
  return QUICK_ACTIONS[template](aiLocked)
}

export function getTemplateRecommendedWidgets(template: DashboardTemplate) {
  return RECOMMENDED_WIDGETS[template]
}
