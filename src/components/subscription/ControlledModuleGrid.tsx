import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { ArrowRight, Lock } from "lucide-react"

export type ControlledModuleCard = {
  href: string
  label: string
  description: string
  icon: LucideIcon
  accent: string
  stats?: { label: string; value: string }[]
  locked?: boolean
  upgradeHref?: string
  requirement?: string
}

export default function ControlledModuleGrid({ title, subtitle, items }: { title: string; subtitle?: string; items: ControlledModuleCard[] }) {
  return (
    <section className="space-y-4">
      <div>
        <div className="text-xs font-mono uppercase tracking-[0.18em] text-[var(--text-3)]">v5.5 subscription control</div>
        <h2 className="mt-1 text-2xl font-black">{title}</h2>
        {subtitle ? <p className="mt-2 text-sm text-[var(--text-2)]">{subtitle}</p> : null}
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          const Icon = item.icon
          const Container: any = item.locked ? "div" : Link
          const props = item.locked ? {} : { href: item.href }
          return (
            <Container key={item.href + item.label} {...props} className={`group rounded-[24px] border p-5 transition-transform ${item.locked ? "border-amber-400/20 bg-amber-400/5" : "border-[var(--border)] bg-[var(--card)] hover:-translate-y-0.5"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: `${item.accent}16`, color: item.accent, border: `1px solid ${item.accent}33` }}>
                  <Icon size={18} />
                </div>
                {item.locked ? <Lock size={16} className="mt-1 text-amber-300" /> : <ArrowRight size={16} className="mt-1 text-[var(--text-3)] transition-transform group-hover:translate-x-0.5" />}
              </div>
              <div className="mt-4 flex items-center gap-2 text-lg font-bold">
                <span>{item.label}</span>
                {item.locked ? <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-300">locked</span> : null}
              </div>
              <p className="mt-2 text-sm leading-6 text-[var(--text-2)]">{item.description}</p>
              {item.stats?.length ? (
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  {item.stats.map((s) => (
                    <div key={s.label} className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2">
                      <div className="text-[var(--text-3)]">{s.label}</div>
                      <div className="mt-1 font-bold text-[var(--text)]">{s.value}</div>
                    </div>
                  ))}
                </div>
              ) : null}
              {item.locked ? (
                <div className="mt-4 rounded-2xl border border-amber-400/20 bg-black/20 p-3">
                  <div className="text-xs font-semibold text-amber-200">ต้องใช้แพ็กเกจ {item.requirement}</div>
                  {item.upgradeHref ? <Link href={item.upgradeHref} className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-amber-300">อัปเกรด <ArrowRight size={14} /></Link> : null}
                </div>
              ) : null}
            </Container>
          )
        })}
      </div>
    </section>
  )
}
