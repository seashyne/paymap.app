// Onboarding templates — v33
// ใช้ร่วมกันระหว่าง UI (/onboarding) และ API (/api/onboarding/apply)

export type TemplateMode = "personal" | "business" | "merchant"

export interface OnboardingTemplate {
  id: string
  mode: TemplateMode
  emoji: string
  name: string
  tagline: string
  desc: string
  popular?: boolean
  color: string
  bg: string
  border: string
  glow: string
  items: string[]         // feature bullets
  setupTime: string       // "2 นาที"
  excelReplace: string    // "สมุดบัญชี Excel"
  // seed data ที่ apply ตอน user เลือก template
  seed: TemplateSeed
}

export interface TemplateSeed {
  // หมวดหมู่พิเศษที่จะ add นอกจาก default
  extraCategories?: { name: string; type: "income" | "expense"; color: string; icon: string }[]
  // budget เริ่มต้น (จะสร้างสำหรับเดือนปัจจุบัน)
  budgets?: { categoryName: string; limitAmount: number }[]
  // savings goals เริ่มต้น
  savingsGoals?: { name: string; targetAmount: number; icon: string; color: string; months?: number }[]
  // currency override
  currency?: string
  // flag พิเศษสำหรับ feature ที่ต้องเปิด
  features?: string[]
}

const now = new Date()
const thisMonth = now.getMonth() + 1
const thisYear  = now.getFullYear()

export const ONBOARDING_TEMPLATES: OnboardingTemplate[] = [
  // ─── PERSONAL ────────────────────────────────────────────────────────────
  {
    id: "personal_basic",
    mode: "personal",
    emoji: "💰",
    name: "บัญชีส่วนตัว",
    tagline: "เริ่มต้นง่าย ใช้แทน Excel ทันที",
    desc: "บันทึกรายรับ-รายจ่าย แยกหมวดหมู่อัตโนมัติ ดู balance รายเดือน",
    popular: true,
    color: "#7c3aed",
    bg: "rgba(124,58,237,0.10)",
    border: "rgba(124,58,237,0.25)",
    glow: "rgba(124,58,237,0.18)",
    items: ["รายรับ / รายจ่าย", "หมวดหมู่อัตโนมัติ", "สรุปรายเดือน", "กราฟ Cashflow"],
    setupTime: "2 นาที",
    excelReplace: "สมุดบัญชี Excel",
    seed: {
      budgets: [
        { categoryName: "Food & Drink",   limitAmount: 5000  },
        { categoryName: "Transport",      limitAmount: 2000  },
        { categoryName: "Shopping",       limitAmount: 3000  },
        { categoryName: "Entertainment",  limitAmount: 1500  },
        { categoryName: "Utilities",      limitAmount: 1000  },
      ],
    },
  },
  {
    id: "personal_budget",
    mode: "personal",
    emoji: "🎯",
    name: "Budget & ออมเงิน",
    tagline: "ตั้งเป้า ติดตามผล ออมได้จริง",
    desc: "ตั้ง Budget แต่ละหมวด + เป้าหมายออมเงิน แจ้งเตือนเมื่อใกล้เกิน",
    color: "#059669",
    bg: "rgba(5,150,105,0.10)",
    border: "rgba(5,150,105,0.25)",
    glow: "rgba(5,150,105,0.18)",
    items: ["Budget แต่ละหมวด", "เป้าหมายออมเงิน", "แจ้งเตือนเกิน budget", "Progress tracking"],
    setupTime: "5 นาที",
    excelReplace: "ตาราง Budget Excel",
    seed: {
      budgets: [
        { categoryName: "Food & Drink",   limitAmount: 6000  },
        { categoryName: "Transport",      limitAmount: 2500  },
        { categoryName: "Housing",        limitAmount: 8000  },
        { categoryName: "Health",         limitAmount: 1000  },
        { categoryName: "Shopping",       limitAmount: 2000  },
        { categoryName: "Entertainment",  limitAmount: 1000  },
        { categoryName: "Utilities",      limitAmount: 1500  },
      ],
      savingsGoals: [
        { name: "กองฉุกเฉิน 3 เดือน", targetAmount: 30000, icon: "🛡️", color: "#059669", months: 12 },
        { name: "ท่องเที่ยวประจำปี",   targetAmount: 20000, icon: "✈️", color: "#0ea5e9",  months: 6  },
      ],
    },
  },
  {
    id: "personal_tax",
    mode: "personal",
    emoji: "🧾",
    name: "บัญชี + ภาษี",
    tagline: "คำนวณภาษีให้อัตโนมัติ",
    desc: "บันทึกรายได้-ค่าใช้จ่าย พร้อมคำนวณภาษีและค่าลดหย่อนรายปี",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.10)",
    border: "rgba(245,158,11,0.25)",
    glow: "rgba(245,158,11,0.18)",
    items: ["รายรับ-รายจ่ายครบ", "คำนวณภาษีอัตโนมัติ", "ค่าลดหย่อน 18+ รายการ", "Export สรุปภาษี"],
    setupTime: "5 นาที",
    excelReplace: "ตารางภาษีประจำปี",
    seed: {
      extraCategories: [
        { name: "ลดหย่อนประกัน",   type: "expense", color: "#f59e0b", icon: "🛡️" },
        { name: "ลดหย่อน RMF/LTF", type: "expense", color: "#f59e0b", icon: "📊" },
        { name: "ลดหย่อนบริจาค",   type: "expense", color: "#f59e0b", icon: "🤲" },
      ],
      budgets: [
        { categoryName: "Food & Drink",  limitAmount: 6000 },
        { categoryName: "Transport",     limitAmount: 2000 },
        { categoryName: "Housing",       limitAmount: 8000 },
      ],
      features: ["tax"],
    },
  },
  {
    id: "personal_family",
    mode: "personal",
    emoji: "🏠",
    name: "บัญชีครอบครัว",
    tagline: "จัดการเงินทั้งบ้านจากที่เดียว",
    desc: "หลายคนในครอบครัวบันทึกร่วมกัน เห็น dashboard รวม แบ่งค่าใช้จ่าย",
    color: "#e11d48",
    bg: "rgba(225,29,72,0.10)",
    border: "rgba(225,29,72,0.25)",
    glow: "rgba(225,29,72,0.18)",
    items: ["Multi-user ในครอบครัว", "Dashboard รวม", "แบ่งค่าใช้จ่าย", "เป้าหมายร่วมกัน"],
    setupTime: "10 นาที",
    excelReplace: "ไฟล์ Excel แชร์ครอบครัว",
    seed: {
      budgets: [
        { categoryName: "Food & Drink",  limitAmount: 15000 },
        { categoryName: "Housing",       limitAmount: 12000 },
        { categoryName: "Transport",     limitAmount: 5000  },
        { categoryName: "Education",     limitAmount: 5000  },
        { categoryName: "Health",        limitAmount: 3000  },
        { categoryName: "Utilities",     limitAmount: 3000  },
      ],
      savingsGoals: [
        { name: "กองทุนครอบครัว",   targetAmount: 100000, icon: "🏠", color: "#e11d48", months: 24 },
      ],
      features: ["family"],
    },
  },
  // ─── BUSINESS ────────────────────────────────────────────────────────────
  {
    id: "business_payroll",
    mode: "business",
    emoji: "🏢",
    name: "Payroll & HR",
    tagline: "คิดเงินเดือนพนักงานอัตโนมัติ",
    desc: "จัดการพนักงาน คำนวณ payroll ประกันสังคม ภาษี ทุกอย่างอัตโนมัติ",
    color: "#0ea5e9",
    bg: "rgba(14,165,233,0.10)",
    border: "rgba(14,165,233,0.25)",
    glow: "rgba(14,165,233,0.18)",
    items: ["คิดเงินเดือนอัตโนมัติ", "ประกันสังคม + ภาษี", "Leave management", "Slip เงินเดือน PDF"],
    setupTime: "15 นาที",
    excelReplace: "ตาราง Payroll Excel",
    seed: {
      features: ["payroll", "hr"],
    },
  },
  {
    id: "business_invoice",
    mode: "business",
    emoji: "📄",
    name: "Invoice & บัญชีร้าน",
    tagline: "ออก invoice ส่งลูกค้าได้ทันที",
    desc: "สร้าง invoice/quotation ติดตามการชำระเงิน บัญชีรายรับร้านค้า",
    color: "#6366f1",
    bg: "rgba(99,102,241,0.10)",
    border: "rgba(99,102,241,0.25)",
    glow: "rgba(99,102,241,0.18)",
    items: ["สร้าง Invoice / Quotation", "ติดตามการชำระ", "บัญชีรายรับ-รายจ่าย", "รายงาน P&L"],
    setupTime: "10 นาที",
    excelReplace: "ตาราง Invoice Excel",
    seed: {
      features: ["invoice"],
    },
  },
  // ─── MERCHANT ────────────────────────────────────────────────────────────
  {
    id: "merchant_pos",
    mode: "merchant",
    emoji: "🏪",
    name: "POS & ขายหน้าร้าน",
    tagline: "ระบบขายแทนกระดาษและ Excel",
    desc: "บันทึกยอดขาย stock สินค้า คำนวณ VAT รายงานกำไร-ขาดทุนอัตโนมัติ",
    color: "#e11d48",
    bg: "rgba(225,29,72,0.10)",
    border: "rgba(225,29,72,0.25)",
    glow: "rgba(225,29,72,0.18)",
    items: ["บันทึกยอดขาย POS", "จัดการ Stock", "คำนวณ VAT 7%", "รายงาน P&L รายวัน"],
    setupTime: "10 นาที",
    excelReplace: "ตาราง Stock & ยอดขาย",
    seed: {
      features: ["pos", "inventory", "vat"],
    },
  },
]

export function getTemplateById(id: string): OnboardingTemplate | undefined {
  return ONBOARDING_TEMPLATES.find(t => t.id === id)
}

export function getTemplatesByMode(mode: TemplateMode): OnboardingTemplate[] {
  return ONBOARDING_TEMPLATES.filter(t => t.mode === mode)
}
