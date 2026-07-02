import Link from "next/link"
import { CheckCircle2, CreditCard, ImageIcon, ShieldCheck, UserCircle2 } from "lucide-react"
import type { DashboardTemplate } from "@/lib/ui-preferences"

type SetupProps = {
  profileReady: boolean
  paymentReady: boolean
  consentReady: boolean
  avatarReady: boolean
  template?: DashboardTemplate
}

export default function RecommendedSetup({ profileReady, paymentReady, consentReady, avatarReady, template = "personal" }: SetupProps) {
  const items = template === "business"
    ? [
        { ready: profileReady, title: "ตั้งค่า Business identity", description: "ทำข้อมูลองค์กรและ workspace ให้พร้อมสำหรับทีม", href: "/settings", icon: UserCircle2 },
        { ready: paymentReady, title: "เชื่อมช่องทางรับจ่าย", description: "เตรียมปลายทางรับเงินและบัญชีที่ใช้กับงานธุรกิจ", href: "/wallets", icon: CreditCard },
        { ready: avatarReady, title: "ใส่โลโก้/รูปโปรไฟล์", description: "เพิ่มความน่าเชื่อถือให้หน้าธุรกิจและเอกสาร", href: "/settings", icon: ImageIcon },
        { ready: consentReady, title: "ตรวจ consent และ legal", description: "เช็ก Terms, Privacy และสถานะพร้อมใช้งานจริง", href: "/settings/legal", icon: ShieldCheck },
      ]
    : template === "merchant"
    ? [
        { ready: profileReady, title: "ตั้งค่าหน้าร้าน", description: "ทำข้อมูลร้านและหน้าแชร์ให้พร้อม", href: "/settings", icon: UserCircle2 },
        { ready: paymentReady, title: "เพิ่มช่องทางรับเงิน", description: "ให้ลูกค้าจ่ายได้ไวผ่าน PromptPay หรือบัญชีธนาคาร", href: "/settings/pay-profile", icon: CreditCard },
        { ready: avatarReady, title: "เพิ่มภาพร้าน/แบรนด์", description: "ทำให้หน้าใช้งานและลิงก์รับเงินดูน่าเชื่อถือขึ้น", href: "/settings", icon: ImageIcon },
        { ready: consentReady, title: "ตรวจนโยบายร้าน", description: "เช็กสถานะกฎหมายก่อนใช้งาน production", href: "/settings/legal", icon: ShieldCheck },
      ]
    : template === "family"
    ? [
        { ready: profileReady, title: "ตั้งค่าโปรไฟล์ครอบครัว", description: "ทำหน้ารับเงินหรือหน้าแชร์สำหรับบ้านให้พร้อม", href: "/settings/pay-profile", icon: UserCircle2 },
        { ready: paymentReady, title: "เพิ่มบัญชีที่ใช้ร่วมกัน", description: "แยกกระเป๋าเงินและปลายทางรับจ่ายของบ้าน", href: "/wallets", icon: CreditCard },
        { ready: avatarReady, title: "ใส่รูปบ้าน/กลุ่ม", description: "ช่วยให้พื้นที่ใช้งานร่วมกันดูชัดเจนขึ้น", href: "/settings", icon: ImageIcon },
        { ready: consentReady, title: "เช็กกติกาและความเป็นส่วนตัว", description: "ตรวจ Terms และ Privacy สำหรับการใช้งานร่วมกัน", href: "/settings/legal", icon: ShieldCheck },
      ]
    : [
        { ready: profileReady, title: "สร้าง Pay Profile", description: "ทำหน้ารับเงินและลิงก์แชร์ให้พร้อมใช้งาน", href: "/settings/pay-profile", icon: UserCircle2 },
        { ready: paymentReady, title: "เพิ่ม PromptPay หรือบัญชีธนาคาร", description: "เพื่อให้ลูกค้าโอนเงินได้ทันที", href: "/settings/pay-profile", icon: CreditCard },
        { ready: avatarReady, title: "ใส่รูปโปรไฟล์", description: "ทำให้หน้ารับเงินดูน่าเชื่อถือขึ้น", href: "/settings", icon: ImageIcon },
        { ready: consentReady, title: "ตรวจ Terms และ Privacy", description: "เช็กสถานะกฎหมายก่อนใช้งานเต็มรูปแบบ", href: "/settings/legal", icon: ShieldCheck },
      ]

  return (
    <section className="glass-card rounded-[30px] p-6">
      <div>
        <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--text-3)]">Recommended setup</div>
        <h2 className="mt-1 text-2xl font-black">{template === "business" ? "เก็บงานที่ทำให้ธุรกิจพร้อมใช้งานจริง" : template === "merchant" ? "เช็กงานที่ร้านควรพร้อมก่อนขายจริง" : template === "family" ? "เช็กสิ่งที่ควรพร้อมก่อนใช้ร่วมกัน" : "เก็บงานที่ควรทำก่อนใช้งานจริง"}</h2>
      </div>
      <div className="mt-5 space-y-3">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <Link key={item.title} href={item.href} className="flex items-center gap-4 rounded-[22px] border border-[var(--border)] bg-[var(--surface-2)] p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--card)] text-[var(--primary)]"><Icon size={18} /></div>
              <div className="min-w-0 flex-1">
                <div className="font-bold">{item.title}</div>
                <div className="text-sm leading-6 text-[var(--text-2)]">{item.description}</div>
              </div>
              <div className="shrink-0">
                <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ background: item.ready ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)', color: item.ready ? '#10b981' : '#f59e0b' }}>
                  <CheckCircle2 size={12} /> {item.ready ? 'พร้อม' : 'แนะนำ'}
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
