import Link from "next/link"
import { getTemplateRecommendedWidgets } from "@/lib/ui-template-content"
import type { DashboardTemplate } from "@/lib/ui-preferences"

export default function TemplateRecommendedWidgets({ template }: { template: DashboardTemplate }) {
  const items = getTemplateRecommendedWidgets(template)

  return (
    <section className="glass-card rounded-[30px] p-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--text-3)]">Recommended widgets</div>
          <h2 className="mt-1 text-2xl font-black">{template === "business" ? "Widget ที่เหมาะกับทีมผู้บริหาร" : template === "merchant" ? "Widget ที่เหมาะกับคนเปิดร้านจริง" : template === "family" ? "Widget ที่เหมาะกับการใช้งานร่วมกัน" : "Widget ที่ควรปักหมุดไว้ดูบ่อย"}</h2>
        </div>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <Link key={item.href + item.title} href={item.href} className="soft-panel rounded-[24px] p-4 transition-transform hover:-translate-y-0.5" style={{ borderColor: `${item.accent}22` }}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: `${item.accent}18`, color: item.accent }}><Icon size={18} /></div>
                <span className="rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ background: `${item.accent}12`, color: item.accent }}>{item.tag}</span>
              </div>
              <div className="mt-4 text-base font-black">{item.title}</div>
              <div className="mt-1 text-sm leading-6 text-[var(--text-2)]">{item.description}</div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
