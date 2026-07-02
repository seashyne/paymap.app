"use client"

import { Command, FilePlus2, Receipt, Wallet, Settings, ArrowRightLeft } from "lucide-react"

const actions = [
  { title: "Create planner item", description: "Open the planner to create a new item.", href: "/planner", icon: FilePlus2 },
  { title: "Review billing", description: "Manage subscription, invoices, and billing settings.", href: "/billing", icon: Receipt },
  { title: "Open wallets", description: "Check balances and edit wallet data.", href: "/wallets", icon: Wallet },
  { title: "Switch workspace", description: "Move between personal, business, and merchant workspaces.", href: "/settings", icon: ArrowRightLeft },
]

export default function CommandActionCenter() {
  return (
    <div className="glass-card rounded-[30px] p-5 lg:p-6">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--text-3)]">Command actions</div>
          <h2 className="mt-1 text-2xl font-black tracking-tight">Quick actions for desktop work</h2>
          <p className="mt-1 text-sm leading-7 text-[var(--text-2)]">Use Ctrl+K or choose a shortcut below to jump straight into your next task.</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-xs font-semibold text-[var(--text-2)]">
          <Command size={13} /> Ctrl+K
        </div>
      </div>
      <div className="grid gap-3 xl:grid-cols-2">
        {actions.map((item) => {
          const Icon = item.icon
          return (
            <a key={item.title} href={item.href} className="group rounded-[24px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-4 transition hover:border-[var(--border2)] hover:-translate-y-0.5">
              <div className="flex items-start gap-3">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]"><Icon size={18} /></div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-[var(--text)]">{item.title}</div>
                  <div className="mt-1 text-sm leading-6 text-[var(--text-2)]">{item.description}</div>
                </div>
              </div>
            </a>
          )
        })}
      </div>
    </div>
  )
}
