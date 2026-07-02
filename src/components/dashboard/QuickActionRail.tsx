import Link from "next/link"
import { ArrowRight, PlusCircle, Receipt, Settings2, Sparkles, Wallet } from "lucide-react"

const actions = [
  {
    href: "/planner",
    title: "Plan cash and tasks",
    description: "Open the planner and add your next action in one click.",
    icon: Sparkles,
    accent: "#8b5cf6",
  },
  {
    href: "/wallets",
    title: "Update balances",
    description: "Jump straight to wallets and keep balances accurate.",
    icon: Wallet,
    accent: "#14b8a6",
  },
  {
    href: "/billing",
    title: "Manage subscription",
    description: "Review plan, payment history, and billing settings.",
    icon: Receipt,
    accent: "#22c55e",
  },
  {
    href: "/settings",
    title: "Workspace settings",
    description: "Fine-tune language, profile, and workspace defaults.",
    icon: Settings2,
    accent: "#f59e0b",
  },
]

export default function QuickActionRail() {
  return (
    <section className="glass-card rounded-[30px] p-5 lg:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--text-3)]">Quick actions</div>
          <h2 className="mt-1 text-2xl font-black tracking-tight">Move faster on desktop</h2>
          <p className="mt-1 max-w-3xl text-sm leading-7 text-[var(--text-2)]">Start the most common workspace actions from one place instead of jumping across multiple screens.</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-xs font-semibold text-[var(--text-2)]">
          <PlusCircle size={14} className="text-[var(--primary)]" />
          Optimized for PC workflow
        </div>
      </div>
      <div className="mt-5 grid gap-3 xl:grid-cols-4 md:grid-cols-2">
        {actions.map((item) => {
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href} className="soft-panel group rounded-[24px] p-4 transition hover:-translate-y-0.5">
              <div className="flex items-start justify-between gap-3">
                <div className="rounded-2xl p-3" style={{ background: `${item.accent}18` }}>
                  <Icon size={18} style={{ color: item.accent }} />
                </div>
                <ArrowRight size={16} className="mt-1 text-[var(--text-3)] transition group-hover:translate-x-0.5" />
              </div>
              <div className="mt-4 text-base font-bold">{item.title}</div>
              <p className="mt-2 text-sm leading-6 text-[var(--text-2)]">{item.description}</p>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
