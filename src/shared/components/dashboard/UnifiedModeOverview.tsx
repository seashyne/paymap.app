import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { ArrowRight, Sparkles } from "lucide-react"

export type UnifiedStat = {
  label: string
  value: string
  hint?: string
}

export type UnifiedLink = {
  href: string
  label: string
  description: string
  icon: LucideIcon
  accent?: string
}

export type UnifiedChecklistItem = {
  title: string
  description: string
}

export default function UnifiedModeOverview({
  badge,
  title,
  description,
  stats,
  links,
  checklist,
}: {
  badge: string
  title: string
  description: string
  stats: UnifiedStat[]
  links: UnifiedLink[]
  checklist: UnifiedChecklistItem[]
}) {
  return (
    <div className="space-y-6">
      <section className="glass-card rounded-[30px] p-6 lg:p-8">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] xl:items-start">
          <div className="min-w-0 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--text-3)]">
              <Sparkles size={14} className="text-[var(--amber)]" />
              {badge}
            </div>
            <h2 className="mt-4 max-w-[16ch] text-[clamp(2rem,4vw,3rem)] font-black tracking-tight leading-[1.06] text-balance">{title}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--text-2)]">{description}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-3">
            {stats.map((item) => (
              <div key={item.label} className="soft-panel min-w-0 rounded-[22px] px-4 py-4">
                <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--text-3)]">{item.label}</div>
                <div className="mt-2 text-[clamp(1.6rem,2.4vw,2.4rem)] font-black leading-[0.98] tracking-tight text-[var(--text)] break-words [font-variant-numeric:tabular-nums]">{item.value}</div>
                {item.hint ? <div className="mt-2 text-sm leading-6 text-[var(--text-2)]">{item.hint}</div> : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.55fr,1fr]">
        <div className="glass-card rounded-[28px] p-5 lg:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--text-3)]">Workspace tools</div>
              <div className="mt-1 text-xl font-black">Core tools available in this workspace</div>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {links.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.href + item.label} href={item.href} className="soft-panel group rounded-[22px] p-4 transition hover:translate-y-[-1px]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="rounded-2xl p-3" style={{ background: `${item.accent ?? "#8b5cf6"}18` }}>
                      <Icon size={18} style={{ color: item.accent ?? "#8b5cf6" }} />
                    </div>
                    <ArrowRight size={16} className="mt-1 text-[var(--text-3)] transition group-hover:translate-x-0.5" />
                  </div>
                  <div className="mt-4 text-base font-bold">{item.label}</div>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-2)]">{item.description}</p>
                </Link>
              )
            })}
          </div>
        </div>

        <div className="glass-card rounded-[28px] p-5 lg:p-6">
          <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--text-3)]">Launch readiness</div>
          <div className="mt-1 text-xl font-black">Why this workspace feels easier to use</div>
          <div className="mt-5 space-y-3">
            {checklist.map((item, index) => (
              <div key={item.title} className="soft-panel rounded-[22px] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--card)] text-xs font-black text-[var(--amber)]">
                    {index + 1}
                  </div>
                  <div className="text-sm font-bold">{item.title}</div>
                </div>
                <p className="mt-2 pl-10 text-sm leading-6 text-[var(--text-2)]">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
