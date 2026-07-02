import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function PlannerMetric({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
      <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--text-3)]">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-[var(--text-1)]">{value}</div>
      {hint ? <div className="mt-1 text-sm text-[var(--text-2)]">{hint}</div> : null}
    </div>
  )
}

export function PlannerListCard({
  title,
  description,
  actionHref,
  actionLabel,
  children,
}: {
  title: string
  description?: string
  actionHref?: string
  actionLabel?: string
  children: ReactNode
}) {
  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-[var(--text-1)]">{title}</h3>
          {description ? <p className="mt-1 text-sm leading-6 text-[var(--text-2)]">{description}</p> : null}
        </div>
        {actionHref && actionLabel ? (
          <Link href={actionHref} className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--text-2)] hover:bg-[var(--surface-2)]">
            {actionLabel} <ArrowRight size={14} />
          </Link>
        ) : null}
      </div>
      {children}
    </div>
  )
}

export function PlannerEmpty({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] px-4 py-6 text-center">
      <div className="text-sm font-medium text-[var(--text-1)]">{title}</div>
      <div className="mt-1 text-sm text-[var(--text-2)]">{description}</div>
    </div>
  )
}
