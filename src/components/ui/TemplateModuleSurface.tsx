import Link from "next/link"
import type { ModuleSurface } from "@/lib/ui-template-modules"

export function TemplateModuleIntro({ surface }: { surface: ModuleSurface }) {
  return (
    <section className="glass-card rounded-[30px] p-6">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl">
          <div className="section-title mb-3">{surface.eyebrow}</div>
          <h2 className="text-2xl font-black md:text-3xl">{surface.title}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--text-2)] md:text-base">{surface.description}</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:w-[42%]">
          {surface.ctas.map((cta) => (
            <Link key={cta.href + cta.label} href={cta.href} className="soft-panel rounded-[24px] p-4 transition-transform hover:-translate-y-0.5">
              <div className="text-sm font-black">{cta.label}</div>
              <div className="mt-1 text-xs leading-6 text-[var(--text-3)]">{cta.description}</div>
            </Link>
          ))}
        </div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {surface.cards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.title} className="soft-panel rounded-[24px] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]">
                    <Icon size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-black">{card.title}</div>
                    <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--text-3)]">{card.tag}</div>
                  </div>
                </div>
              </div>
              <div className="mt-3 text-sm leading-6 text-[var(--text-2)]">{card.description}</div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export function TemplateEmptyStateCard({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string
  description: string
  actionHref?: string
  actionLabel?: string
}) {
  return (
    <div className="rounded-[26px] border border-dashed border-[var(--border)] bg-[var(--surface-2)] px-6 py-10 text-center">
      <div className="text-lg font-black">{title}</div>
      <div className="mx-auto mt-2 max-w-xl text-sm leading-7 text-[var(--text-3)]">{description}</div>
      {actionHref && actionLabel ? (
        <div className="mt-5">
          <Link href={actionHref} className="inline-flex items-center rounded-2xl bg-[var(--primary)] px-4 py-2.5 text-sm font-bold text-white">
            {actionLabel}
          </Link>
        </div>
      ) : null}
    </div>
  )
}
