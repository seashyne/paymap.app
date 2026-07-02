import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { getTemplateQuickActions } from "@/lib/ui-template-content"
import type { DashboardTemplate } from "@/lib/ui-preferences"

export default function QuickActions({ aiLocked, template = "personal" }: { aiLocked: boolean; template?: DashboardTemplate }) {
  const items = getTemplateQuickActions(template, aiLocked)

  return (
    <section className="glass-card rounded-[30px] p-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--text-3)]">Quick actions</div>
          <h2 className="mt-1 text-2xl font-black">{template === "business" ? "เริ่มงานผู้บริหารได้ทันที" : template === "merchant" ? "ปุ่มที่ใช้กับงานร้านจริงทุกวัน" : template === "family" ? "ทางลัดสำหรับงานที่ใช้ร่วมกันในบ้าน" : "เริ่มงานสำคัญได้ทันที"}</h2>
          <p className="mt-1 text-sm text-[var(--text-2)]">
            {template === "business"
              ? "ลดการกระโดดหลายหน้า โดยดัน payroll, accounting และ board reports ขึ้นมาก่อน"
              : template === "merchant"
              ? "เน้นทางลัดยอดขาย สต็อก และเงินเข้า เพื่อให้ใช้ได้ไวในหน้างาน"
              : template === "family"
              ? "รวมงานที่เหมาะกับการใช้งานหลายคน เช่น family hub, wallets และรายงานครอบครัว"
              : "ลดการหาฟีเจอร์จากหลายหน้า ให้กดเข้าจุดที่ใช้จริงได้เลย"}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href + item.label}
              href={item.href}
              className="group soft-panel min-w-0 rounded-[24px] p-4 transition-transform hover:-translate-y-0.5"
              style={{ borderColor: `${item.accent}22` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl" style={{ background: `${item.accent}18`, color: item.accent }}>
                  <Icon size={18} />
                </div>
                <ArrowRight size={16} className="shrink-0 text-[var(--text-3)] transition-transform group-hover:translate-x-0.5" />
              </div>
              <div className="mt-4 text-base font-black">{item.label}</div>
              <div className="mt-1 text-sm leading-6 text-[var(--text-2)]">{item.description}</div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
