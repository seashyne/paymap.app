import type { ReactNode } from "react"

export function WorkbenchHero({
  eyebrow,
  title,
  subtitle,
  accent,
  actions,
}: {
  eyebrow: string
  title: string
  subtitle: string
  accent?: string
  actions?: ReactNode
}) {
  return (
    <section className="page-hero overflow-hidden min-w-0 rounded-[32px] border border-[var(--border)] bg-[linear-gradient(180deg,rgba(9,21,55,.92),rgba(5,14,37,.98))] px-6 py-7 shadow-[0_20px_70px_rgba(2,8,23,.35)] sm:px-7 lg:px-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 max-w-4xl space-y-3">
          <div className="inline-flex max-w-full items-center rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--text-3)]">
            {eyebrow}
          </div>
          <div className="space-y-2">
            <h1 className="max-w-4xl text-3xl font-black leading-tight tracking-[-0.03em] text-white sm:text-4xl">
              {title}
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-[var(--text-2)] sm:text-[15px]">
              {subtitle}
            </p>
          </div>
        </div>
        {actions ? <div className="min-w-0 shrink-0">{actions}</div> : null}
      </div>
      {accent ? <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-72 bg-[radial-gradient(circle_at_center,rgba(139,92,246,.18),transparent_68%)] lg:block" style={{ filter: `drop-shadow(0 0 40px ${accent})` }} /> : null}
    </section>
  )
}

export function KpiStrip({ items }: { items: { label: string; value: string; hint?: string }[] }) {
  return (
    <section className="content-grid-safe grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="min-w-0 overflow-hidden rounded-[26px] border border-[var(--border)] bg-[var(--card)]/95 p-5 shadow-sm">
          <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-3)]">{item.label}</div>
          <div className="mt-2 truncate text-2xl font-black tracking-[-0.03em] text-white sm:text-3xl">{item.value}</div>
          {item.hint ? <div className="mt-2 text-sm text-[var(--text-3)]">{item.hint}</div> : null}
        </div>
      ))}
    </section>
  )
}
