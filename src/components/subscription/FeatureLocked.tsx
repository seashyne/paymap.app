import Link from "next/link"
import { Lock, ArrowRight, Sparkles } from "lucide-react"

export default function FeatureLocked({
  title,
  description,
  requirement,
  upgradeHref,
  children,
}: {
  title: string
  description: string
  requirement: string
  upgradeHref: string
  children?: React.ReactNode
}) {
  return (
    <section className="rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] text-amber-300">
            <Lock size={12} /> Feature locked
          </div>
          <h2 className="mt-4 text-2xl font-black">{title}</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--text-2)]">{description}</p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2 text-sm text-[var(--text-2)]">
            <Sparkles size={14} className="text-amber-300" /> ต้องใช้แพ็กเกจ <span className="font-bold text-[var(--text)]">{requirement}</span>
          </div>
          <div className="mt-5">
            <Link href={upgradeHref} className="inline-flex items-center gap-2 rounded-2xl bg-[var(--accent)] px-4 py-2.5 text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}>
              อัปเกรดแพ็กเกจ <ArrowRight size={14} />
            </Link>
          </div>
        </div>
        {children ? <div className="w-full max-w-xl">{children}</div> : null}
      </div>
    </section>
  )
}
