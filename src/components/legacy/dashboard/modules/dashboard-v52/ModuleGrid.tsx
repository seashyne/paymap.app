import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { ArrowRight } from "lucide-react"

export type ModuleCardItem = {
  href: string
  label: string
  description: string
  icon: LucideIcon
  accent: string
  stats?: { label: string; value: string }[]
}

export default function ModuleGrid({
  title,
  subtitle,
  items,
}: {
  title: string
  subtitle?: string
  items: ModuleCardItem[]
}) {
  return (
    <section className="space-y-4">
      <div>
        <div className="text-xs font-mono uppercase tracking-[0.18em] text-[var(--text-3)]">v5.3 module wiring</div>
        <h2 className="mt-1 text-2xl font-black">{title}</h2>
        {subtitle && <p className="mt-2 text-sm text-[var(--text-2)]">{subtitle}</p>}
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href + item.label}
              href={item.href}
              className="group rounded-[24px] border border-[var(--border)] bg-[var(--card)] p-5 transition-transform hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-2xl"
                  style={{ background: `${item.accent}16`, color: item.accent, border: `1px solid ${item.accent}33` }}
                >
                  <Icon size={18} />
                </div>
                <ArrowRight size={16} className="mt-1 text-[var(--text-3)] transition-transform group-hover:translate-x-0.5" />
              </div>
              <div className="mt-4 text-lg font-bold">{item.label}</div>
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
            </Link>
          )
        })}
      </div>
    </section>
  )
}
