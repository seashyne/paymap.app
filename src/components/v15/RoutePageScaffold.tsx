import type { ReactNode } from 'react'
import { WorkbenchHero, KpiStrip } from '@/components/workbench/WorkbenchPageShell'
import { TableSystem } from '@/components/ui/TableSystem'

export type RouteMetric = { label: string; value: string; hint?: string }

export function RoutePageScaffold({
  eyebrow,
  title,
  subtitle,
  accent,
  metrics,
  primary,
  secondary,
  table,
  aside,
}: {
  eyebrow: string
  title: string
  subtitle: string
  accent?: string
  metrics?: RouteMetric[]
  primary?: ReactNode
  secondary?: ReactNode
  table?: {
    title: string
    subtitle?: string
    columns: { key: string; label: string; align?: 'left' | 'right' | 'center'; render?: (row: Record<string, any>) => ReactNode }[]
    rows: Record<string, any>[]
    searchableKeys: string[]
    initialSortKey?: string
  }
  aside?: ReactNode
}) {
  return (
    <div className="space-y-6">
      <WorkbenchHero eyebrow={eyebrow} title={title} subtitle={subtitle} accent={accent} />
      {metrics?.length ? <KpiStrip items={metrics} /> : null}
      {(primary || aside) ? (
        <section className={`grid gap-6 ${aside ? 'xl:grid-cols-[minmax(0,1.2fr)_380px]' : ''}`}>
          {primary ? <div className="space-y-6">{primary}</div> : null}
          {aside ? <div className="space-y-6">{aside}</div> : null}
        </section>
      ) : null}
      {secondary ? <section className="space-y-6">{secondary}</section> : null}
      {table ? <TableSystem {...table} /> : null}
    </div>
  )
}

export function InfoCard({ title, body, footer }: { title: string; body: string; footer?: ReactNode }) {
  return (
    <div className="glass-card rounded-[28px] p-5 lg:p-6">
      <div className="text-lg font-black tracking-tight">{title}</div>
      <p className="mt-3 text-sm leading-7 text-[var(--text-2)]">{body}</p>
      {footer ? <div className="mt-4">{footer}</div> : null}
    </div>
  )
}

export function BulletListCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="glass-card rounded-[28px] p-5 lg:p-6">
      <div className="text-lg font-black tracking-tight">{title}</div>
      <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--text-2)]">
        {items.map((item) => <li key={item} className="rounded-[18px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3">{item}</li>)}
      </ul>
    </div>
  )
}
