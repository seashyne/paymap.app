import { Activity, BarChart3, BookOpen, Briefcase, Building2, CreditCard, Download, FileText, Globe, HelpCircle, Home, Landmark, LayoutGrid, LifeBuoy, LineChart, Lock, Plus, Receipt, Settings, ShieldCheck, ShoppingCart, Sparkles, Store, User, Users, Wallet, type LucideIcon } from 'lucide-react'

export type RouteAudience = 'Public' | 'Personal' | 'Business' | 'Merchant' | 'Enterprise' | 'Admin'
export type RouteMode = 'public' | 'personal' | 'business' | 'merchant' | 'enterprise' | 'admin'

export type RouteEntry = {
  path: string
  name: string
  audience: RouteAudience
  mode: RouteMode
  description: string
  icon: LucideIcon
  keywords?: string[]
}

export const V151_ROUTE_MAP: RouteEntry[] = [
  { path: '/', name: 'Landing Page', audience: 'Public', mode: 'public', description: 'หน้าหลักของ PayMap และ redirect ไป dashboard อัตโนมัติถ้า login แล้ว', icon: Home, keywords: ['home', 'landing', 'marketing'] },
  { path: '/login', name: 'Login', audience: 'Public', mode: 'public', description: 'เข้าสู่ระบบ เลือก Personal, Business, Merchant พร้อม email/password หรือ Google SSO', icon: Lock, keywords: ['signin', 'auth'] },
  { path: '/register', name: 'Register', audience: 'Public', mode: 'public', description: 'สมัครสมาชิกโดยเลือก mode และกรอกข้อมูลเริ่มต้น', icon: User, keywords: ['signup', 'create account'] },
  { path: '/forgot-password', name: 'Forgot Password', audience: 'Public', mode: 'public', description: 'ขอ reset link ผ่าน email', icon: Lock, keywords: ['password', 'reset'] },
  { path: '/reset-password', name: 'Reset Password', audience: 'Public', mode: 'public', description: 'ตั้ง password ใหม่จากลิงก์ใน email', icon: ShieldCheck },
  { path: '/pricing', name: 'Pricing', audience: 'Public', mode: 'public', description: 'หน้าแพ็กเกจ ราคา และปุ่มสมัครใช้งาน', icon: CreditCard, keywords: ['plans', 'billing'] },
  { path: '/guide', name: 'User Guide', audience: 'Public', mode: 'public', description: 'คู่มือการใช้งาน PayMap แบบรวมทุก workflow สำคัญ', icon: BookOpen, keywords: ['manual', 'documentation'] },
  { path: '/help', name: 'Help Center', audience: 'Public', mode: 'public', description: 'FAQ และช่องทางติดต่อ support', icon: HelpCircle, keywords: ['faq', 'support'] },
  { path: '/status', name: 'System Status', audience: 'Public', mode: 'public', description: 'ดูสถานะ uptime และ readiness ของระบบ', icon: Activity, keywords: ['uptime', 'health'] },
  { path: '/download', name: 'Download App', audience: 'Public', mode: 'public', description: 'ช่องทางดาวน์โหลด web, PWA, Android, iOS', icon: Download, keywords: ['install', 'mobile'] },
  { path: '/pay/[slug]', name: 'Pay Profile', audience: 'Public', mode: 'public', description: 'หน้ารับเงิน PromptPay แบบสาธารณะสำหรับแชร์ลิงก์', icon: Receipt, keywords: ['promptpay', 'payment link'] },

  { path: '/dashboard', name: 'Personal Dashboard', audience: 'Personal', mode: 'personal', description: 'ภาพรวมการเงิน Wallet summary, activity feed, quick actions และ family tab', icon: LayoutGrid, keywords: ['overview', 'personal home'] },
  { path: '/wallets', name: 'Wallets', audience: 'Personal', mode: 'personal', description: 'เพิ่ม ลบ และดูยอดกระเป๋าเงินของแต่ละบัญชี', icon: Wallet },
  { path: '/reports', name: 'Reports', audience: 'Personal', mode: 'personal', description: 'รายงานรายรับรายจ่ายรายเดือนและรายปีพร้อม chart', icon: LineChart },
  { path: '/reports/financial', name: 'Financial Reports', audience: 'Personal', mode: 'personal', description: 'รายงานการเงินเชิงลึก เช่น balance sheet และ P&L', icon: FileText },
  { path: '/analytics', name: 'Analytics', audience: 'Personal', mode: 'personal', description: 'Realtime analytics dashboard ดู pattern การใช้จ่ายและ signal สำคัญ', icon: BarChart3, keywords: ['insights', 'patterns'] },
  { path: '/investments', name: 'Investments', audience: 'Personal', mode: 'personal', description: 'ติดตามหุ้น กองทุน crypto และ transaction รายตัว', icon: Landmark },
  { path: '/loans', name: 'Loans', audience: 'Personal', mode: 'personal', description: 'ติดตามเงินกู้ หนี้สิน และ schedule การผ่อน', icon: CreditCard },
  { path: '/installments', name: 'Installments', audience: 'Personal', mode: 'personal', description: 'จัดการผ่อนสินค้าและแจ้งเตือนครบกำหนดอัตโนมัติ', icon: Receipt },
  { path: '/networth', name: 'Net Worth', audience: 'Personal', mode: 'personal', description: 'คำนวณสินทรัพย์ลบหนี้สินและดู trend ของมูลค่าสุทธิ', icon: Sparkles },
  { path: '/tax', name: 'Tax Workspace', audience: 'Personal', mode: 'personal', description: 'จัดการภาษีส่วนบุคคลและประมาณการภาษีที่ต้องจ่าย', icon: FileText },
  { path: '/simulation', name: 'Financial Simulation', audience: 'Personal', mode: 'personal', description: 'จำลองสถานการณ์การเงิน เช่น ซื้อบ้าน เกษียณ และเปลี่ยน cashflow', icon: LineChart },
  { path: '/achievements', name: 'Achievements', audience: 'Personal', mode: 'personal', description: 'gamification badge และ milestone ทางการเงิน', icon: Sparkles },
  { path: '/planner', name: 'Financial Planner', audience: 'Personal', mode: 'personal', description: 'วางแผนการเงินระยะยาวและเพิ่ม entry ในแต่ละเดือน', icon: BookOpen },
  { path: '/profile', name: 'Profile', audience: 'Personal', mode: 'personal', description: 'แก้ไขชื่อ รูป และข้อมูลส่วนตัว', icon: User },
  { path: '/settings', name: 'Settings', audience: 'Personal', mode: 'personal', description: 'hub สำหรับ theme, currency, language, template และ notifications', icon: Settings },
  { path: '/settings/pay-profile', name: 'Pay Profile Settings', audience: 'Personal', mode: 'personal', description: 'ตั้งค่า PromptPay slug สำหรับรับเงิน', icon: Receipt },
  { path: '/settings/legal', name: 'Legal Settings', audience: 'Personal', mode: 'personal', description: 'จัดการ consent และการยอมรับ TOS', icon: ShieldCheck },
  { path: '/billing', name: 'Billing', audience: 'Personal', mode: 'personal', description: 'ดูแผนปัจจุบัน ประวัติ invoice และอัปเกรดแพ็กเกจ', icon: CreditCard },
  { path: '/onboarding', name: 'Onboarding', audience: 'Personal', mode: 'personal', description: 'wizard ตั้งค่าครั้งแรกหลังสมัคร', icon: Sparkles },
  { path: '/workspace/select', name: 'Workspace Select', audience: 'Personal', mode: 'personal', description: 'เลือกหรือสลับ workspace context ที่จะเข้าใช้งาน', icon: LayoutGrid },
  { path: '/workspace/new', name: 'New Workspace', audience: 'Personal', mode: 'personal', description: 'สร้าง workspace ใหม่ตามประเภทการใช้งาน', icon: Plus },

  { path: '/business', name: 'Business Dashboard', audience: 'Business', mode: 'business', description: 'ภาพรวม KPI, module grid และ consent panel สำหรับธุรกิจ', icon: Briefcase },
  { path: '/business/payroll', name: 'Payroll', audience: 'Business', mode: 'business', description: 'รัน payroll ดูประวัติการจ่ายและ workflow สิทธิ์ accountant ขึ้นไป', icon: Users },
  { path: '/business/invoices', name: 'Invoices', audience: 'Business', mode: 'business', description: 'สร้าง invoice ส่ง email และติดตามสถานะการจ่ายเงิน', icon: Receipt },
  { path: '/business/accounting', name: 'Business Accounting', audience: 'Business', mode: 'business', description: 'journal entries, chart of accounts และรายงานบัญชีครบ', icon: FileText },
  { path: '/business/reconciliation', name: 'Reconciliation', audience: 'Business', mode: 'business', description: 'กระทบยอด statement และอนุมัติรายการที่ match', icon: ShieldCheck },
  { path: '/business/calendar', name: 'Business Calendar', audience: 'Business', mode: 'business', description: 'ปฏิทินนัดหมาย งาน และ deadline ของธุรกิจ', icon: BookOpen },
  { path: '/business/os', name: 'Business OS', audience: 'Business', mode: 'business', description: 'หน้า operating system ของธุรกิจที่รวม ops สำคัญในหน้าเดียว', icon: Building2 },
  { path: '/w/[slug]', name: 'Workspace Detail', audience: 'Business', mode: 'business', description: 'รายละเอียด workspace เฉพาะองค์กร', icon: Building2 },
  { path: '/w/[slug]/dashboard', name: 'Workspace Dashboard', audience: 'Business', mode: 'business', description: 'dashboard ของ workspace นั้นพร้อม module ที่เกี่ยวข้อง', icon: LayoutGrid },
  { path: '/dashboard/admin', name: 'Admin Dashboard (shortcut)', audience: 'Business', mode: 'business', description: 'ทางเข้าลัดสู่ admin dashboard สำหรับ role ที่มีสิทธิ์', icon: ShieldCheck },

  { path: '/merchant', name: 'Merchant Dashboard', audience: 'Merchant', mode: 'merchant', description: 'ภาพรวมร้านค้า ยอดขาย และ KPI ของวันนี้', icon: Store },
  { path: '/merchant/pos', name: 'Point of Sale', audience: 'Merchant', mode: 'merchant', description: 'รับออเดอร์ scan สินค้า รับชำระเงิน และพิมพ์ใบเสร็จ', icon: ShoppingCart, keywords: ['checkout', 'cashier'] },
  { path: '/merchant/sales', name: 'Sales History', audience: 'Merchant', mode: 'merchant', description: 'ประวัติการขายทั้งหมดพร้อม filter และ export', icon: Receipt },
  { path: '/merchant/inventory', name: 'Inventory', audience: 'Merchant', mode: 'merchant', description: 'จัดการสต็อกสินค้าและแจ้งเตือนสินค้าใกล้หมด', icon: Store },
  { path: '/merchant/accounting', name: 'Merchant Accounting', audience: 'Merchant', mode: 'merchant', description: 'บัญชีร้านค้า VAT และรายงานภาษีขาย', icon: FileText },
  { path: '/merchant/reconciliation', name: 'Merchant Reconciliation', audience: 'Merchant', mode: 'merchant', description: 'กระทบยอด statement ของร้านค้า', icon: ShieldCheck },
  { path: '/merchant/reminders', name: 'Merchant Reminders', audience: 'Merchant', mode: 'merchant', description: 'แจ้งเตือนนัดหมาย ลูกค้า และ delivery', icon: LifeBuoy },

  { path: '/enterprise', name: 'Enterprise Dashboard', audience: 'Enterprise', mode: 'enterprise', description: 'ภาพรวม multi-org พนักงาน ใบลา และ payroll trend 6 เดือน', icon: Building2 },
  { path: '/enterprise/controls', name: 'Enterprise Controls', audience: 'Enterprise', mode: 'enterprise', description: 'ตั้งค่า policy, permission ระดับองค์กร และ audit controls', icon: ShieldCheck },
  { path: '/enterprise/reports', name: 'Enterprise Reports', audience: 'Enterprise', mode: 'enterprise', description: 'รายงาน aggregate ทุกองค์กร เช่น payroll, leave และ KPI', icon: BarChart3 },

  { path: '/admin', name: 'Admin Overview', audience: 'Admin', mode: 'admin', description: 'ภาพรวมระบบ จำนวนผู้ใช้ distribution ของแผน และระบบโดยรวม', icon: ShieldCheck },
  { path: '/admin/users', name: 'Admin Users', audience: 'Admin', mode: 'admin', description: 'จัดการผู้ใช้ทั้งหมด เปลี่ยน plan, ban และ impersonate', icon: Users },
  { path: '/admin/workspaces', name: 'Admin Workspaces', audience: 'Admin', mode: 'admin', description: 'จัดการ workspace ทั้งระบบ', icon: Building2 },
  { path: '/admin/audit', name: 'Audit Log', audience: 'Admin', mode: 'admin', description: 'audit trail ของ action สำคัญทั้งระบบ', icon: ShieldCheck },
  { path: '/admin/saas', name: 'SaaS Metrics', audience: 'Admin', mode: 'admin', description: 'MRR, churn, plan conversion และการ sync กับ Stripe', icon: Globe },
]


export const V151_ROUTE_MODE_LABELS: Record<RouteMode, string> = {
  public: 'Public',
  personal: 'Personal',
  business: 'Business',
  merchant: 'Merchant',
  enterprise: 'Enterprise',
  admin: 'Admin',
}

export function getRoutesByMode(mode: RouteMode) {
  return V151_ROUTE_MAP.filter((item) => item.mode === mode)
}

export function searchRoutes(query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return V151_ROUTE_MAP
  return V151_ROUTE_MAP.filter((item) => `${item.path} ${item.name} ${item.description} ${(item.keywords ?? []).join(' ')}`.toLowerCase().includes(q))
}
