import type { DashboardTemplate } from "@/lib/ui-preferences"
import { BarChart3, CreditCard, Landmark, Palette, Settings, Users, Wallet, ShoppingCart, PiggyBank, type LucideIcon } from "lucide-react"

export type ModuleKey =
  | "wallets"
  | "billing"
  | "settings"
  | "reportsCenter"
  | "reportsFinancial"

export type ModuleAction = {
  href: string
  label: string
  description: string
}

export type ModuleCard = {
  title: string
  description: string
  tag: string
  icon: LucideIcon
}

export type ModuleEmptyState = {
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
}

export type ModuleSurface = {
  eyebrow: string
  title: string
  description: string
  ctas: ModuleAction[]
  cards: ModuleCard[]
  empty: ModuleEmptyState
  actions?: {
    primary: string
    secondary: string
  }
}

const MODULES: Record<DashboardTemplate, Record<ModuleKey, ModuleSurface>> = {
  personal: {
    wallets: {
      eyebrow: "Personal money map",
      title: "Wallets ที่ช่วยให้เห็นเงินทั้งหมดในมุมเดียว",
      description: "จัดเงินสด ธนาคาร บัตรเครดิต และ e-Wallet ให้เป็นระบบเดียวกัน พร้อม action ที่เหมาะกับการใช้งานส่วนตัวทุกวัน",
      ctas: [
        { href: "/reports", label: "ดู spending report", description: "เช็กว่าเงินออกจาก wallet ไหนมากที่สุด" },
        { href: "/settings", label: "ปรับ layout", description: "เปลี่ยน template สี และทางลัดให้เข้ากับ workflow ของคุณ" },
      ],
      cards: [
        { title: "Focus cash visibility", description: "ดันยอดรวมและจำนวน wallet ขึ้นก่อนเพื่ออ่านสถานะเงินได้ทันที", tag: "Overview", icon: Wallet },
        { title: "Fast transfer flow", description: "เหมาะกับการย้ายเงินระหว่างบัญชีหลักกับบัญชีออมอย่างรวดเร็ว", tag: "Action", icon: CreditCard },
      ],
      empty: { title: "เริ่มจาก wallet แรกของคุณ", description: "เพิ่มบัญชีหลักหรือกระเป๋าเงินสดก่อน แล้วค่อยต่อยอดด้วย transfer และ report", actionLabel: "ไปดูรายงาน", actionHref: "/reports" },
      actions: { primary: "เพิ่ม wallet", secondary: "โอนเงิน" },
    },
    billing: {
      eyebrow: "Personal plan control",
      title: "Billing สำหรับผู้ใช้ส่วนตัวที่อยากอัปเกรดแบบพอดี",
      description: "ดูแผนที่ใช้ สิทธิ์ AI และประวัติการชำระเงินโดยไม่ต้องไล่หลายหน้า เหมาะกับการตัดสินใจอัปเกรดทีละขั้น",
      ctas: [
        { href: "/pricing", label: "เทียบแผนทั้งหมด", description: "ดูความต่างของ Free, Pro และ Family แบบรวม" },
        { href: "/reports", label: "เปิด reports", description: "ดูว่าฟีเจอร์รายงานที่มีอยู่ตอบโจทย์การใช้งานแค่ไหน" },
      ],
      cards: [
        { title: "Upgrade only when needed", description: "เน้นอ่านสิทธิ์ที่กระทบชีวิตประจำวัน เช่น AI, reports และ export", tag: "Fit", icon: PiggyBank },
        { title: "History in one place", description: "ตรวจ invoice และรอบบิลล่าสุดจากหน้าเดียว", tag: "Billing", icon: CreditCard },
      ],
      empty: { title: "ยังไม่มี subscription แบบเสียเงิน", description: "คุณยังใช้แผนฟรีได้ต่อ และอัปเกรดเมื่ออยากได้ AI หรือ limits ที่สูงขึ้น", actionLabel: "ดูราคา", actionHref: "/pricing" },
    },
    settings: {
      eyebrow: "Personal preferences",
      title: "Settings ที่เน้นความเรียบง่ายและปรับตามคนใช้จริง",
      description: "รวมโปรไฟล์ ภูมิภาค ความปลอดภัย และ appearance เพื่อให้ระบบรู้สึกเป็นของคุณมากขึ้นทุกวัน",
      ctas: [
        { href: "/settings/pay-profile", label: "เปิด Pay Profile", description: "ตั้งค่าหน้ารับเงินหรือลิงก์แชร์ของคุณ" },
        { href: "/billing", label: "ดูสิทธิ์ปัจจุบัน", description: "เช็กว่า plan ที่ใช้มีอะไรและขาดอะไรอยู่" },
      ],
      cards: [
        { title: "Theme + layout sync", description: "บันทึก appearance ลงบัญชีและซิงก์ข้ามเครื่อง", tag: "Sync", icon: Palette },
        { title: "Profile first", description: "โปรไฟล์ การตั้งภูมิภาค และความปลอดภัยอยู่ใน flow ที่อ่านง่ายกว่าเดิม", tag: "Profile", icon: Settings },
      ],
      empty: { title: "เริ่มจาก appearance ก่อนก็ได้", description: "เลือก template และ default page ให้ตรงกับวิธีใช้งานก่อน แล้วค่อยปรับข้อมูลอื่นต่อ" },
    },
    reportsCenter: {
      eyebrow: "Insight center",
      title: "Reports ที่ช่วยตัดสินใจเรื่องเงินส่วนตัวเร็วขึ้น",
      description: "ย่อข้อมูลสำคัญให้เข้าใจง่าย เน้น spending, trend และ export ที่ใช้ได้จริงสำหรับผู้ใช้ส่วนตัว",
      ctas: [
        { href: "/reports/financial", label: "เปิด financial statements", description: "ดู P&L, balance sheet และ cash flow จากข้อมูลบัญชี" },
        { href: "/wallets", label: "กลับไปจัด wallets", description: "ถ้าอยากทำรายงานให้แม่นขึ้น เริ่มจากโครงสร้าง wallet ก่อน" },
      ],
      cards: [
        { title: "Spending first", description: "ดันรายงานรายจ่ายและ trend ก่อนเพื่อช่วยตัดสินใจเร็ว", tag: "Core", icon: BarChart3 },
        { title: "Export ready", description: "มีทางลัดสำหรับส่งออกข้อมูลทันทีเมื่ออยากเก็บต่อหรือแชร์", tag: "Export", icon: Landmark },
      ],
      empty: { title: "ยังไม่มีข้อมูลมากพอสำหรับรายงาน", description: "เริ่มบันทึกรายการหรือเพิ่ม wallet ก่อน แล้ว report center จะเริ่มมีประโยชน์ทันที", actionLabel: "เพิ่ม wallet", actionHref: "/wallets" },
    },
    reportsFinancial: {
      eyebrow: "Financial statements",
      title: "อ่านงบการเงินในมุมที่ใช้งานส่วนตัวได้ง่ายขึ้น",
      description: "แม้จะเป็นงบแบบบัญชีเต็มรูป แต่เราจัดคำอธิบายและการนำทางให้คนทั่วไปอ่านได้ง่ายกว่าเดิม",
      ctas: [
        { href: "/reports", label: "กลับ report center", description: "ดูรายงานสรุปอื่นก่อนหรือหลังอ่านงบ" },
        { href: "/wallets", label: "จัดข้อมูลต้นทาง", description: "เพิ่ม wallet และรายการเพื่อให้ตัวเลขในงบครบขึ้น" },
      ],
      cards: [
        { title: "Explain before density", description: "เพิ่มข้อความนำและลำดับการอ่านให้งบไม่ดูหนักเกินไป", tag: "Readable", icon: PiggyBank },
        { title: "Same data, clearer flow", description: "ไม่ลดรายละเอียด แต่จัดทางเข้ากับ tab ให้เข้าใจง่ายขึ้น", tag: "Flow", icon: BarChart3 },
      ],
      empty: { title: "ยังไม่มีข้อมูลบัญชีพอสำหรับสร้างงบ", description: "เพิ่มรายการหรือ journal ก่อน แล้วค่อยกลับมาดู financial statements" },
    },
  },
  business: {
    wallets: {
      eyebrow: "Treasury view",
      title: "Wallets สำหรับมุมมอง cash position ของธุรกิจ",
      description: "จัด wallets ให้รองรับการอ่านเงินสดหมุนเวียน บัญชีหลัก และช่องทางชำระเงินขององค์กรในมุมที่ผู้บริหารเข้าใจเร็ว",
      ctas: [
        { href: "/business/accounting", label: "เปิด accounting", description: "เชื่อม wallet visibility เข้ากับ journal และ ledger" },
        { href: "/reports/financial", label: "ดู board reports", description: "ใช้ wallet structure เป็นต้นทางของรายงานการเงิน" },
      ],
      cards: [
        { title: "Treasury first", description: "ดันการมองยอดรวมและกระเป๋าหลักขึ้นก่อนสำหรับ owner และ finance lead", tag: "Exec", icon: Wallet },
        { title: "Cash movement", description: "ปุ่มโอนเงินยังอยู่ แต่ภาษาถูกปรับให้เหมาะกับ treasury flow มากขึ้น", tag: "Flow", icon: CreditCard },
      ],
      empty: { title: "ยังไม่มี treasury wallets", description: "เริ่มจากบัญชีหลักของบริษัทก่อน แล้วค่อยแตกกระเป๋าตามทีม หรือตาม use case การจ่ายเงิน", actionLabel: "ไปหน้า Accounting", actionHref: "/business/accounting" },
      actions: { primary: "เพิ่ม treasury wallet", secondary: "บันทึก transfer" },
    },
    billing: {
      eyebrow: "Business subscription control",
      title: "Billing ที่ช่วยตัดสินใจเรื่องแผนของทีมและการเงินองค์กร",
      description: "แยกเรื่องแผนธุรกิจ สิทธิ์ payroll/accounting และประวัติการชำระเงินออกมาให้อ่านแบบผู้บริหารได้ง่ายขึ้น",
      ctas: [
        { href: "/business", label: "กลับ Executive Console", description: "ดูผลลัพธ์ของ plan ที่ใช้กับทีมและ workflow จริง" },
        { href: "/pricing?product=business", label: "ดูแผน Business", description: "เปรียบเทียบ limits ที่กระทบ accounting, payroll และ reconciliation" },
      ],
      cards: [
        { title: "Plan impacts modules", description: "บอกให้ชัดว่าแผนไหนปลดล็อก payroll, accounting และ close flow อะไรบ้าง", tag: "Scope", icon: CreditCard },
        { title: "Renewal visibility", description: "ดึงรอบบิลและสถานะการต่ออายุขึ้นก่อนสำหรับทีมการเงิน", tag: "Control", icon: Landmark },
      ],
      empty: { title: "ยังไม่มี business subscription ที่ active", description: "เริ่มด้วย free workflow ก่อน แล้วค่อยอัปเกรดเมื่อทีมเริ่มใช้ payroll หรือ accounting จริง", actionLabel: "ดูแผน Business", actionHref: "/pricing?product=business" },
    },
    settings: {
      eyebrow: "Operations preferences",
      title: "Settings สำหรับทีมที่ต้องคุมทั้งภาพลักษณ์และ workflow",
      description: "Appearance, profile, legal และสิทธิ์ใช้งานถูกรวมไว้เพื่อให้ทีมปรับสภาพแวดล้อมการทำงานได้จากจุดเดียว",
      ctas: [
        { href: "/settings/legal", label: "เปิด Legal Center", description: "ตรวจ consent และ policy version ที่กระทบ production" },
        { href: "/billing?product=business", label: "เช็ก business plan", description: "ยืนยันสิทธิ์ของโมดูล accounting/reconciliation" },
      ],
      cards: [
        { title: "Executive template aware", description: "ข้อความและ preset ถูกปรับให้เข้ากับทีมธุรกิจมากกว่าการใช้งานส่วนตัว", tag: "Preset", icon: Palette },
        { title: "Compliance nearby", description: "Legal และ billing อยู่ใกล้กันขึ้นสำหรับคนดูแลระบบองค์กร", tag: "Ops", icon: Users },
      ],
      empty: { title: "เริ่มจาก Executive preset ได้ทันที", description: "ถ้ายังไม่แน่ใจว่าจะตั้งค่าอย่างไร ให้ใช้ Business preset แล้วค่อยปรับละเอียดต่อ" },
    },
    reportsCenter: {
      eyebrow: "Board & operations reporting",
      title: "Report center สำหรับ owner, finance และ operations",
      description: "รวม personal, business และ merchant reporting แต่ดัน payroll, labor cost และ board pack ขึ้นมาก่อนตามบริบทธุรกิจ",
      ctas: [
        { href: "/reports/financial", label: "เปิด board pack", description: "ไปดูงบการเงินและโครงสร้างงบแบบลึกขึ้น" },
        { href: "/business/payroll", label: "เปิด payroll", description: "เช็กต้นทางของ labor metrics และ pending work" },
      ],
      cards: [
        { title: "Decision-ready summaries", description: "สรุปที่เหมาะกับการ review ก่อนประชุมหรือปิดงวด", tag: "Exec", icon: BarChart3 },
        { title: "Cross-workspace visibility", description: "ดู personal, business และ merchant จากศูนย์กลางเดียวกันได้ง่ายขึ้น", tag: "Center", icon: Users },
      ],
      empty: { title: "ยังไม่มีข้อมูลธุรกิจพอสำหรับ report center", description: "เริ่มจาก payroll, accounting หรือ merchant sales ก่อน แล้วรายงานจะเริ่มมีน้ำหนักมากขึ้น", actionLabel: "เปิด Business", actionHref: "/business" },
    },
    reportsFinancial: {
      eyebrow: "Board pack financials",
      title: "Financial statements ที่พร้อมใช้คุยกับทีมและผู้บริหาร",
      description: "จัดหัวข้อและข้อความนำใหม่ให้อ่านในบริบทธุรกิจง่ายขึ้น โดยยังคงความละเอียดของงบไว้ครบ",
      ctas: [
        { href: "/business/accounting", label: "กลับ accounting", description: "ตรวจ journal และ ledger ก่อนปิดงวดหรือรีวิวงบ" },
        { href: "/reports", label: "กลับ report center", description: "กลับไปดูภาพรวมก่อนเจาะงบแบบเต็ม" },
      ],
      cards: [
        { title: "Close-friendly layout", description: "เหมาะกับทีมที่ต้องตรวจงบเป็นประจำและคุยตัวเลขต่อในทีม", tag: "Close", icon: Landmark },
        { title: "Executive readability", description: "คำอธิบายบนหน้าเน้นการ review มากกว่าการใช้งานเดี่ยวแบบ technical", tag: "Exec", icon: BarChart3 },
      ],
      empty: { title: "ยังไม่มีข้อมูล accounting เพียงพอ", description: "เพิ่ม journal และ account balances ก่อน แล้ว financial statements จะเริ่มสะท้อนภาพธุรกิจชัดขึ้น" },
    },
  },
  merchant: {
    wallets: {
      eyebrow: "Store cash lanes",
      title: "Wallets สำหรับร้านที่ต้องรู้ว่าเงินเข้าช่องไหนบ้าง",
      description: "เน้นช่องทางรับเงิน กระแสเงินสด และการโอนภายในร้าน ให้คนเปิดร้านอ่านแล้วทำงานต่อได้เร็วขึ้น",
      ctas: [
        { href: "/merchant/sales", label: "เปิด Sales flow", description: "ดู order และยอดเงินเข้าที่เชื่อมกับ wallet" },
        { href: "/merchant/inventory", label: "เปิด Inventory", description: "ถ้ายอดขายเปลี่ยน ให้ดู stock ต่อได้ทันที" },
      ],
      cards: [
        { title: "Payment channel clarity", description: "กระเป๋าแต่ละใบควรถูกมองเป็นช่องทางรับเงินของร้านมากกว่าบัญชีทั่วไป", tag: "Store", icon: Wallet },
        { title: "Fast money movement", description: "เหมาะกับการโอนยอดขายจากกระเป๋ารับเงินไปบัญชีเก็บหรือบัญชีจ่ายต้นทุน", tag: "Daily", icon: CreditCard },
      ],
      empty: { title: "ยังไม่มีช่องทางรับเงินของร้าน", description: "เริ่มจาก wallet ที่ใช้รับยอดขายจริงก่อน เช่น ธนาคารหลักหรือ e-Wallet หน้าร้าน", actionLabel: "เปิด Sales", actionHref: "/merchant/sales" },
      actions: { primary: "เพิ่มช่องรับเงิน", secondary: "โอนยอดขาย" },
    },
    billing: {
      eyebrow: "Store plan management",
      title: "Billing ที่ผูกกับยอดขาย หน้าร้าน และการเติบโตของร้าน",
      description: "ช่วยให้ร้านเห็นว่า plan ไหนตอบโจทย์ sales, inventory, VAT และ reporting โดยไม่ต้องแปลภาษาทางเทคนิคเอง",
      ctas: [
        { href: "/merchant", label: "กลับ Merchant Center", description: "ดูภาพรวมของร้านก่อนตัดสินใจอัปเกรดแผน" },
        { href: "/pricing?product=merchant", label: "ดูแผน Merchant", description: "เช็ก limits ของ orders, SKUs และ reporting" },
      ],
      cards: [
        { title: "Growth-aware plans", description: "ภาษาบนหน้า billing ถูกจัดให้ owner ร้านอ่านแล้วเลือกแผนได้ง่ายขึ้น", tag: "Growth", icon: ShoppingCart },
        { title: "Renewal + access", description: "ดูสถานะและแผนที่ปลดล็อก inventory/accounting ของร้านได้ชัดขึ้น", tag: "Control", icon: CreditCard },
      ],
      empty: { title: "ร้านยังใช้แผนฟรีอยู่", description: "เริ่มขายและเก็บข้อมูลก่อน แล้วค่อยอัปเกรดเมื่อ order, inventory หรือ VAT เริ่มซับซ้อนขึ้น", actionLabel: "ดูแผน Merchant", actionHref: "/pricing?product=merchant" },
    },
    settings: {
      eyebrow: "Store setup & look",
      title: "Settings สำหรับร้านที่ต้องการทั้งความเร็วและความคุ้นมือ",
      description: "Appearance, profile และสิทธิ์ต่าง ๆ ถูกจัดให้อ่านเร็วและเหมาะกับการเปิดใช้หน้างานทุกวัน",
      ctas: [
        { href: "/settings/pay-profile", label: "ตั้งค่าหน้ารับเงิน", description: "เหมาะกับการแชร์ลิงก์หรือรับเงินผ่าน public page" },
        { href: "/merchant/accounting", label: "เปิด Merchant Accounting", description: "เช็ก VAT, journal และ statement ของร้าน" },
      ],
      cards: [
        { title: "Store-ready appearance", description: "template และ bottom nav เหมาะกับการเปิดบนมือถือหรือแท็บเล็ตมากขึ้น", tag: "Surface", icon: Palette },
        { title: "Operational defaults", description: "หน้า default และปุ่มลัดถูกออกแบบให้ owner ร้านเข้าหน้าที่ใช้บ่อยได้ไว", tag: "Flow", icon: Settings },
      ],
      empty: { title: "เริ่มจาก Merchant preset", description: "ถ้าร้านยังไม่เคยตั้งค่า appearance มาก่อน ให้ใช้ Merchant preset แล้วค่อยจูนทีหลัง" },
    },
    reportsCenter: {
      eyebrow: "Sales & margin reporting",
      title: "Reports ที่จัดลำดับเพื่อการดูยอดขายและกำไรของร้าน",
      description: "ดันยอดขาย สต็อก และรายงานที่ owner ร้านใช้ทุกวันขึ้นก่อน เพื่อให้รายงานอ่านแล้วทำงานต่อได้จริง",
      ctas: [
        { href: "/reports/financial", label: "เปิดงบการเงิน", description: "ดูภาพงบที่ลึกขึ้นเมื่อร้านเริ่มใช้ accounting เต็ม" },
        { href: "/merchant/inventory", label: "เปิด inventory", description: "กลับไปเช็ก SKU ที่กระทบตัวเลขในรายงาน" },
      ],
      cards: [
        { title: "Sales pulse first", description: "รายงานยอดขายและหมวดที่ owner ใช้ประจำถูกดันขึ้นมาก่อน", tag: "Daily", icon: ShoppingCart },
        { title: "Margin context", description: "คง report ทางการเงินไว้ แต่ใส่บริบทของหน้าร้านให้มากขึ้น", tag: "Profit", icon: BarChart3 },
      ],
      empty: { title: "ยังไม่มีข้อมูลยอดขายพอสำหรับรายงานร้าน", description: "เริ่มจากบันทึก order และสินค้า แล้ว report center จะช่วยดูแนวโน้มและ margin ได้มากขึ้น", actionLabel: "เปิด Sales", actionHref: "/merchant/sales" },
    },
    reportsFinancial: {
      eyebrow: "Store financials",
      title: "อ่านงบในมุมของ owner ร้านได้ง่ายขึ้น",
      description: "เน้นว่าตัวเลขในงบเชื่อมกับยอดขาย สต็อก และกระแสเงินสดอย่างไร เพื่อให้ร้านใช้ต่อได้จริง",
      ctas: [
        { href: "/merchant/accounting", label: "กลับ Merchant Accounting", description: "ตรวจ VAT และรายการทางบัญชีก่อนหรือหลังอ่านงบ" },
        { href: "/reports", label: "กลับ report center", description: "ดูรายงานยอดขายและ margin เพิ่มเติม" },
      ],
      cards: [
        { title: "Retail context", description: "จัดคำอธิบายให้โยงกับหน้าร้านและยอดขายมากกว่าภาษาบัญชีล้วน", tag: "Retail", icon: ShoppingCart },
        { title: "Cash reality", description: "ช่วยให้ owner ร้านอ่านกระแสเงินสดและกำไรขาดทุนแบบเชื่อมกับงานจริง", tag: "Owner", icon: Wallet },
      ],
      empty: { title: "ยังไม่มีข้อมูลบัญชีของร้านพอ", description: "เริ่มจาก sales, VAT หรือ journal ก่อน แล้วงบจะเริ่มสะท้อนภาพร้านได้ชัดขึ้น" },
    },
  },
  family: {
    wallets: {
      eyebrow: "Shared family money",
      title: "Wallets สำหรับบ้านที่ใช้เงินร่วมกัน",
      description: "ช่วยแยกกระเป๋าส่วนกลาง กระเป๋าส่วนตัว และกระเป๋าเป้าหมายของบ้านให้ดูง่ายขึ้น โดยยังใช้งานไม่ซับซ้อนเกินไป",
      ctas: [
        { href: "/dashboard?tab=family", label: "เปิด Family Hub", description: "กลับไปดูภาพรวมสมาชิกและงบร่วมของบ้าน" },
        { href: "/reports", label: "ดูรายงานครอบครัว", description: "เช็กว่าค่าใช้จ่ายบ้านกระจุกตัวอยู่ตรงไหน" },
      ],
      cards: [
        { title: "Shared visibility", description: "ทำให้เห็นทั้งกระเป๋าส่วนตัวและกระเป๋าร่วมใน flow ที่เป็นมิตรกับคนในบ้าน", tag: "Shared", icon: Wallet },
        { title: "Household transfers", description: "เหมาะกับการย้ายเงินระหว่างบัญชีบ้าน เงินออม และค่าใช้จ่ายประจำ", tag: "Home", icon: CreditCard },
      ],
      empty: { title: "เริ่มจากกระเป๋าเงินของบ้านใบแรก", description: "เพิ่มบัญชีหลักของบ้านหรือกระเป๋าค่าใช้จ่ายร่วมก่อน แล้วค่อยแบ่งเป้าหมายตามหมวดของครอบครัว", actionLabel: "เปิด Family reports", actionHref: "/reports" },
      actions: { primary: "เพิ่ม shared wallet", secondary: "ย้ายเงินในบ้าน" },
    },
    billing: {
      eyebrow: "Family access & plan",
      title: "Billing ที่อธิบายสิทธิ์ใช้งานสำหรับหลายคนในบ้านได้ชัดขึ้น",
      description: "ช่วยให้ครอบครัวดูแผนที่รองรับการใช้ร่วมกัน เห็นประวัติการชำระเงิน และเข้าใจว่าฟีเจอร์ไหนเหมาะกับการใช้หลายคน",
      ctas: [
        { href: "/pricing", label: "ดูแผนทั้งหมด", description: "เทียบว่า Family หรือ plan อื่นตอบโจทย์การใช้ร่วมกันมากกว่า" },
        { href: "/settings", label: "ปรับ shared appearance", description: "ทำให้หน้าตาระบบเหมาะกับคนในบ้านทุกคนมากขึ้น" },
      ],
      cards: [
        { title: "Share-ready explanation", description: "ภาษาบนหน้า billing เน้นให้คนในบ้านคุยกันเรื่อง plan ได้ง่ายกว่าเดิม", tag: "Family", icon: Users },
        { title: "Simple renewal view", description: "ดูสถานะ รอบบิล และประวัติการชำระเงินได้จากจุดเดียว", tag: "Billing", icon: CreditCard },
      ],
      empty: { title: "ตอนนี้ยังใช้แผนฟรีอยู่", description: "เริ่มใช้งานร่วมกันก่อน แล้วค่อยอัปเกรดเมื่ออยากเพิ่มสิทธิ์สำหรับครอบครัวหรือ workspace หลายคน", actionLabel: "ดูราคา", actionHref: "/pricing" },
    },
    settings: {
      eyebrow: "Shared preferences",
      title: "Settings ที่เหมาะกับการใช้ร่วมกันในบ้าน",
      description: "เน้น appearance ที่อ่อนโยน อ่านง่าย และมีจุดตั้งค่าสำหรับคนที่ไม่ใช่สายตัวเลขมากนัก แต่ยังอยากเห็นภาพรวมร่วมกัน",
      ctas: [
        { href: "/settings/pay-profile", label: "ตั้งค่าหน้ารับเงินร่วม", description: "ใช้สำหรับกิจกรรมในบ้านหรือการรับเงินของสมาชิก" },
        { href: "/reports", label: "ดู Family reports", description: "เปิดรายงานที่อธิบายตัวเลขให้คุยกันง่ายขึ้น" },
      ],
      cards: [
        { title: "Shared readability", description: "ค่าสี ตัวอักษร และ radius ถูกออกแบบให้ใช้งานร่วมกันได้สบายตา", tag: "Comfort", icon: Palette },
        { title: "Household defaults", description: "หน้าเริ่มต้นและปุ่มลัดถูกจัดให้เหมาะกับครอบครัวมากขึ้น", tag: "Home", icon: Settings },
      ],
      empty: { title: "ใช้ Family preset เป็นจุดเริ่มต้นได้เลย", description: "จากนั้นค่อยปรับสี ตัวอักษร และ bottom nav ให้เข้ากับการใช้ร่วมกันของบ้าน" },
    },
    reportsCenter: {
      eyebrow: "Family planning reports",
      title: "Reports ที่ช่วยให้คุยเรื่องเงินในบ้านได้ง่ายขึ้น",
      description: "ลดความแข็งของภาษาทางการเงิน และจัดลำดับรายงานให้เหมาะกับการคุยแผนใช้เงินร่วมกันในครอบครัว",
      ctas: [
        { href: "/reports/financial", label: "เปิด financial statements", description: "ดูงบแบบละเอียดเมื่อต้องการภาพลึกขึ้น" },
        { href: "/wallets", label: "จัด shared wallets", description: "ถ้ารายงานยังไม่ชัด เริ่มจากแยกกระเป๋าของบ้านก่อน" },
      ],
      cards: [
        { title: "Less intimidating", description: "เน้นคำอธิบายที่ชวนคุยต่อได้ ไม่ใช่แค่โยนตัวเลขดิบใส่ผู้ใช้", tag: "Talk", icon: Users },
        { title: "Goal-friendly", description: "รายงานบางส่วนจะช่วยให้คุยเรื่องเป้าหมาย ค่าใช้จ่าย และการออมได้ง่ายขึ้น", tag: "Plan", icon: PiggyBank },
      ],
      empty: { title: "ยังไม่มีข้อมูลครอบครัวพอสำหรับรายงาน", description: "เริ่มจากเพิ่มกระเป๋าหรือบันทึกรายการร่วมของบ้านก่อน แล้ว reports จะมีบริบทมากขึ้น", actionLabel: "เปิด Wallets", actionHref: "/wallets" },
    },
    reportsFinancial: {
      eyebrow: "Family financial view",
      title: "Financial statements ที่อธิบายตัวเลขให้ครอบครัวอ่านร่วมกันง่ายขึ้น",
      description: "คงโครงสร้างงบเดิมไว้ แต่ทำคำอธิบายและทางเข้าหน้าให้เป็นมิตรมากขึ้นสำหรับผู้ใช้หลายคนในบ้าน",
      ctas: [
        { href: "/reports", label: "กลับ Family reports", description: "ดูรายงานที่ย่อยง่ายกว่าเดิมก่อนเจาะงบแบบเต็ม" },
        { href: "/wallets", label: "กลับ shared wallets", description: "จัดต้นทางข้อมูลของบ้านให้ชัดขึ้น" },
      ],
      cards: [
        { title: "Shared understanding", description: "ทำให้งบกลายเป็นหน้าที่อธิบายได้ ไม่ใช่แค่หน้าเทคนิค", tag: "Family", icon: Users },
        { title: "Gentle onboarding", description: "เหมาะกับการค่อย ๆ เริ่มอ่านงบแม้ผู้ใช้จะไม่ใช่สายบัญชี", tag: "Readable", icon: PiggyBank },
      ],
      empty: { title: "ยังไม่มีข้อมูลเพียงพอสำหรับงบของบ้าน", description: "เริ่มจากบันทึกรายการหรือแยกกระเป๋าร่วมก่อน แล้วค่อยกลับมาดู financial view" },
    },
  },
}


export function getTemplateModuleSurface(template: DashboardTemplate, moduleKey: ModuleKey): ModuleSurface {
  return MODULES[template]?.[moduleKey] ?? MODULES.personal[moduleKey]
}
