import Link from "next/link"
import {
  ArrowRight,
  ArrowUpRight,
  Banknote,
  Bell,
  Briefcase,
  Building2,
  CalendarDays,
  CreditCard,
  FileSpreadsheet,
  Flag,
  ListChecks,
  PlusCircle,
  Package,
  Receipt,
  Search,
  ShoppingCart,
  Sparkles,
  Store,
  TrendingUp,
  Wallet,
} from "lucide-react"

type PersonalRow = {
  id: string
  date: string
  note: string
  category: string
  status: string
  amount: string
}

type BusinessRow = {
  id: string
  invoice: string
  customer: string
  status: string
  owner: string
  amount: string
}

type MerchantProduct = {
  id: string
  name: string
  price: string
  stockLabel: string
  tone: "normal" | "alert"
}

const statusTone: Record<string, string> = {
  paid: "bg-[rgba(0,107,99,.12)] text-[#006b63]",
  posted: "bg-[rgba(0,107,99,.12)] text-[#006b63]",
  pending: "bg-[rgba(15,23,42,.08)] text-[var(--text-2)]",
  draft: "bg-[rgba(91,71,211,.1)] text-[#5b47d3]",
  planned: "bg-[rgba(91,71,211,.1)] text-[#5b47d3]",
  review: "bg-[rgba(245,158,11,.14)] text-[#a16207]",
  overdue: "bg-[rgba(172,49,73,.12)] text-[#ac3149]",
  failed: "bg-[rgba(172,49,73,.12)] text-[#ac3149]",
}

function SectionCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-[2rem] bg-[var(--card)] p-6 shadow-[var(--shadow-soft)] ${className}`}>{children}</div>
}

function MoneyPill({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className={`rounded-[1.4rem] px-4 py-3 ${tone ?? "bg-[var(--surface-2)]"}`}>
      <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--text-3)]">{label}</div>
      <div className="mt-2 text-2xl font-black tracking-[-0.04em] text-[var(--text)]">{value}</div>
    </div>
  )
}

function SectionHeader({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--primary)]">{eyebrow}</div>
        <h2 className="mt-2 text-4xl font-black tracking-[-0.04em] text-[var(--text)]">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--text-3)]">{description}</p>
      </div>
      {actions}
    </div>
  )
}

export function PersonalCuratorSurface({
  userName,
  totalBalance,
  walletCount,
  income,
  expense,
  rows,
  isDemo = false,
}: {
  userName: string
  totalBalance: string
  walletCount: string
  income: string
  expense: string
  rows: PersonalRow[]
  isDemo?: boolean
}) {
  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Money overview"
        title="Personal money cockpit"
        description={`Welcome back, ${userName}. This is your clearest view of what you have, what changed, and what needs attention so you can stay in control of your money day to day.`}
        actions={
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--surface-2)] text-[var(--text-2)]">
              <Bell size={18} />
            </div>
            <Link href="/wallets" className="inline-flex items-center gap-2 rounded-2xl bg-[var(--primary)] px-5 py-3 text-sm font-bold text-white shadow-[0_18px_40px_rgba(91,71,211,.24)]">
              <Wallet size={16} /> Open wallets
            </Link>
          </div>
        }
      />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.28fr)_minmax(320px,.72fr)]">
        <div className="rounded-[2.2rem] bg-[var(--card)] px-6 py-6 shadow-[var(--shadow-soft)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-3)]">Money you can see</div>
              <div className="mt-3 flex items-end gap-2">
                <div className="text-5xl font-black tracking-[-0.06em] text-[var(--text)] md:text-6xl">{totalBalance}</div>
              </div>
            </div>
            <div className="flex flex-col items-start gap-2 lg:items-end">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#b9f3ec] px-3 py-1.5 text-sm font-bold text-[#006b63]">
                <ArrowUpRight size={15} /> +12.4%
              </span>
              <span className="text-[11px] font-medium text-[var(--text-3)]">Updated a few minutes ago</span>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_280px]">
            <div className="rounded-[1.7rem] bg-[var(--surface-2)] px-4 py-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-3)]">Savings goal: Emergency buffer</span>
                <span className="text-xs font-bold text-[var(--primary)]">65% complete</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white">
                <div className="h-full rounded-full bg-[var(--primary)]" style={{ width: "65%" }} />
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-xs text-[var(--text-3)]">Steady progress this quarter</span>
                <span className="text-right">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-3)]">Remaining</span>
                  <span className="text-lg font-black text-[var(--text)]">$14,200</span>
                </span>
              </div>
            </div>
            <div className="rounded-[1.7rem] bg-[#c3f0ee] px-4 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0b8a80] text-white">
                  <Wallet size={18} />
                </span>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#006b63]">Monthly saved</div>
                  <div className="mt-1 text-2xl font-black tracking-[-0.04em] text-[#03504b]">{walletCount === "0" ? income : income}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <MoneyPill label="Liquid cash" value={income} />
          <MoneyPill label="Monthly outflow" value={expense} />
          <div className="rounded-[1.8rem] bg-[linear-gradient(135deg,#5b47d3,#6a56e6)] p-5 text-white shadow-[0_18px_40px_rgba(91,71,211,.24)]">
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">Wallet coverage</div>
            <div className="mt-2 text-4xl font-black tracking-[-0.04em]">{walletCount}</div>
            <div className="mt-2 text-sm text-white/75">Tracked wallets live and ready for transfers.</div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(300px,.85fr)]">
        <SectionCard className="rounded-[2.2rem]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-black tracking-[-0.03em] text-[var(--text)]">Spending trends</h3>
              <p className="mt-1 text-sm text-[var(--text-3)]">A quick view of how your spending is moving over time</p>
            </div>
            <div className="flex gap-2 rounded-2xl bg-[var(--surface-2)] p-1">
              <button className="rounded-xl bg-white px-4 py-2 text-xs font-bold text-[var(--primary)] shadow-sm">6M</button>
              <button className="rounded-xl px-4 py-2 text-xs font-bold text-[var(--text-3)]">1Y</button>
              <button className="rounded-xl px-4 py-2 text-xs font-bold text-[var(--text-3)]">ALL</button>
            </div>
          </div>

          <div className="relative mt-8 h-[300px] overflow-hidden rounded-[1.8rem] bg-[linear-gradient(180deg,rgba(91,71,211,.08),transparent_78%)]">
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1000 320" preserveAspectRatio="none">
              <defs>
                <linearGradient id="personalArea" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#c8c1fb" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#c8c1fb" stopOpacity="0.15" />
                </linearGradient>
              </defs>
              <path d="M0,250 C120,200 220,125 330,165 C440,205 560,250 650,160 C750,60 840,55 1000,215 L1000,320 L0,320 Z" fill="url(#personalArea)" />
            </svg>
            <div className="absolute inset-x-6 bottom-4 grid grid-cols-6 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-3)]">
              {["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((label) => <div key={label}>{label}</div>)}
            </div>
          </div>
        </SectionCard>

        <div className="grid gap-6">
          <SectionCard className="rounded-[2.2rem] bg-[linear-gradient(135deg,#5b47d3,#6a56e6)] text-white shadow-[0_22px_50px_rgba(91,71,211,.28)]">
            <h3 className="text-2xl font-black tracking-[-0.03em]">Next actions</h3>
            <p className="mt-2 text-sm leading-6 text-white/75">Start with the one job that makes today's money clearer.</p>
            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                { href: "/wallets", label: "Add wallet", icon: PlusCircle, tone: "bg-[#c1b9ff] text-[#4126b9]" },
                { href: "/planner", label: "Plan goal", icon: Flag, tone: "bg-white/10 text-white" },
                { href: "/reports", label: "Review", icon: ListChecks, tone: "bg-white/10 text-white" },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <Link key={item.label} href={item.href} className={`rounded-[1.6rem] p-4 text-center transition hover:-translate-y-0.5 ${item.tone}`}>
                    <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20"><Icon size={18} /></span>
                    <div className="mt-3 text-[11px] font-bold uppercase tracking-[0.16em]">{item.label}</div>
                  </Link>
                )
              })}
            </div>
          </SectionCard>

          <SectionCard className="rounded-[2.2rem] bg-[#88ebe3]">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0b8a80] text-white">
                <Sparkles size={18} />
              </span>
            <div className="text-xl font-black tracking-[-0.03em] text-[#0b4d47]">Money insights</div>
            </div>
            <p className="mt-4 text-sm leading-7 text-[#14514c]">
              You spent 12% less on discretionary dining this month. Moving that gap into a named goal could push your savings plan forward sooner.
            </p>
            <Link href="/reports" className="mt-5 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#0b5e57]">
              View analysis <ArrowRight size={14} />
            </Link>
          </SectionCard>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,.92fr)_minmax(0,1.08fr)]">
        <SectionCard className="rounded-[2.2rem]">
          <h3 className="text-2xl font-black tracking-[-0.03em] text-[var(--text)]">Where your money is sitting</h3>
          <div className="mt-6 space-y-5">
            {[
              { title: "Cash reserves", value: income, width: "72%", tone: "#5b47d3", icon: Wallet },
              { title: "Budget envelopes", value: expense, width: "54%", tone: "#006b63", icon: CreditCard },
              { title: "Goal buckets", value: walletCount, width: "34%", tone: "#7a7f87", icon: Flag },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.title} className="flex items-center gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${item.tone}16`, color: item.tone }}>
                    <Icon size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <span className="text-sm font-bold text-[var(--text)]">{item.title}</span>
                      <span className="text-sm font-semibold text-[var(--text-2)]">{item.value}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-2)]">
                      <div className="h-full rounded-full" style={{ width: item.width, background: item.tone }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </SectionCard>

        <SectionCard className="rounded-[2.2rem] bg-[var(--surface-2)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-black tracking-[-0.03em] text-[var(--text)]">Upcoming bills and obligations</h3>
            </div>
            <Link href="/billing" className="text-xs font-black uppercase tracking-[0.18em] text-[var(--primary)]">Manage all</Link>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              { month: "Mar", day: "24", title: "Capital mortgage", note: "Auto-pay enabled", amount: "$2,450.00", tone: "bg-[rgba(172,49,73,.1)] text-[#ac3149]" },
              { month: "Apr", day: "02", title: "Cloud infrastructure", note: "Billed monthly", amount: "$124.99", tone: "bg-[rgba(91,71,211,.1)] text-[#5b47d3]" },
              { month: "Apr", day: "15", title: "Vehicle installment", note: "Loan #9482", amount: "$580.00", tone: "bg-[rgba(15,23,42,.08)] text-[var(--text-3)]" },
            ].map((item) => (
              <div key={item.title} className="rounded-[1.6rem] bg-white p-4">
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 flex-col items-center justify-center rounded-full ${item.tone}`}>
                    <span className="text-[10px] font-bold uppercase leading-tight">{item.month}</span>
                    <span className="text-lg font-black leading-tight">{item.day}</span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[var(--text)]">{item.title}</div>
                    <div className="text-[11px] text-[var(--text-3)]">{item.note}</div>
                    <div className="mt-1 text-sm font-black text-[var(--text)]">{item.amount}</div>
                  </div>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-center rounded-[1.6rem] border border-dashed border-[var(--border)] bg-white p-4 text-xs font-bold uppercase tracking-[0.16em] text-[var(--text-3)]">
              + New installment
            </div>
          </div>
        </SectionCard>
      </section>

      <SectionCard className="rounded-[2.2rem]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-black tracking-[-0.03em] text-[var(--text)]">Recent ledger</h3>
              {isDemo ? (
                <span className="rounded-full bg-[rgba(91,71,211,.1)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#5b47d3]">Demo data</span>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-[var(--text-3)]">
              {isDemo
                ? "A realistic starter view so you can understand the flow before importing or adding your own entries."
                : "Your latest money activity, arranged to scan quickly instead of making you dig through spreadsheets."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/wallets" className="inline-flex items-center gap-2 rounded-xl bg-[var(--surface-2)] px-3 py-2 text-sm font-bold text-[var(--text-2)]">
              <PlusCircle size={15} /> Add entry
            </Link>
            <Link href="/reports" className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary-soft)] px-3 py-2 text-sm font-bold text-[var(--primary)]">
              <FileSpreadsheet size={15} /> Reports
            </Link>
          </div>
        </div>
        <div className="mt-6 overflow-hidden rounded-[1.5rem] bg-[var(--surface-2)]">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-3)]">
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Entry</th>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 6).map((row) => (
                <tr key={row.id} className="border-t border-black/5">
                  <td className="px-5 py-4 text-sm text-[var(--text-3)]">{row.date}</td>
                  <td className="px-5 py-4 text-sm font-bold text-[var(--text)]">{row.note}</td>
                  <td className="px-5 py-4 text-sm text-[var(--text-2)]">{row.category}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ${statusTone[row.status] ?? statusTone.pending}`}>{row.status}</span>
                  </td>
                  <td className="px-5 py-4 text-right text-sm font-black text-[var(--text)]">{row.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  )
}

export function BusinessCuratorSurface({
  revenue,
  paid,
  overdueCount,
  rows,
  isDemo = false,
}: {
  revenue: string
  paid: string
  overdueCount: number
  rows: BusinessRow[]
  isDemo?: boolean
}) {
  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow={isDemo ? "Demo business flow" : "Business overview"}
        title="Know what to collect next"
        description="Track cashflow, invoices, receivables, and ledger health in one place so the next finance task is obvious."
        actions={
          <div className="flex flex-wrap gap-3">
            <Link href="/business/invoices" className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-[var(--text)] shadow-sm">Create invoice</Link>
            <Link href="/business/reconciliation" className="rounded-2xl bg-[var(--primary)] px-5 py-3 text-sm font-bold text-white shadow-[0_18px_40px_rgba(91,71,211,.22)]">Match payments</Link>
          </div>
        }
      />

      <section>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="text-5xl font-black tracking-[-0.06em] text-[var(--text)] md:text-6xl">{revenue}</div>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#84f5e8] px-4 py-2 text-sm font-bold text-[#005c55]">
              <TrendingUp size={15} /> Monthly operating revenue
            </div>
          </div>
          <div className="rounded-[1.75rem] bg-[rgba(14,165,233,.08)] px-5 py-4 shadow-[var(--shadow-soft)]">
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-3)]">Collected</div>
            <div className="mt-2 text-2xl font-black text-[var(--text)]">{paid}</div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        {[
          { title: "Gross margin", value: "64.2%", icon: TrendingUp, note: "Efficiency up by 2.1% this quarter", tone: "bg-[rgba(91,71,211,.1)] text-[#5b47d3]" },
          { title: "Receivables", value: paid, icon: Wallet, note: `${overdueCount} invoices need attention`, tone: "bg-[rgba(0,107,99,.1)] text-[#006b63]" },
          { title: "OpEx ratio", value: "22.8%", icon: Briefcase, note: "Beneath industry average", tone: "bg-[rgba(0,107,100,.1)] text-[#006b64]" },
        ].map((item) => {
          const Icon = item.icon
          return (
            <SectionCard key={item.title}>
              <div className="flex items-start justify-between gap-3">
                <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.tone}`}><Icon size={20} /></span>
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-3)]">{item.title}</span>
              </div>
              <div className="mt-8 text-4xl font-black tracking-[-0.04em] text-[var(--text)]">{item.value}</div>
              <div className="mt-4 text-sm text-[var(--text-3)]">{item.note}</div>
            </SectionCard>
          )
        })}
      </section>

      <SectionCard className="rounded-[2.2rem]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-black tracking-[-0.03em] text-[var(--text)]">Revenue quality spectrum</h3>
            <p className="mt-1 text-sm text-[var(--text-3)]">A quick read on whether money is arriving predictably or needs follow-up.</p>
          </div>
          <div className="flex gap-2 rounded-2xl bg-[var(--surface-2)] p-1">
            <button className="rounded-xl bg-white px-4 py-2 text-xs font-bold text-[var(--primary)] shadow-sm">Monthly</button>
            <button className="rounded-xl px-4 py-2 text-xs font-bold text-[var(--text-3)]">Quarterly</button>
            <button className="rounded-xl px-4 py-2 text-xs font-bold text-[var(--text-3)]">Yearly</button>
          </div>
        </div>
        <div className="relative mt-10 h-72 overflow-hidden rounded-[1.75rem] bg-[linear-gradient(180deg,rgba(91,71,211,.12),rgba(91,71,211,0)_70%)]">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1000 320" preserveAspectRatio="none">
            <defs>
              <linearGradient id="curatorBusinessArea" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#5b47d3" stopOpacity="0.24" />
                <stop offset="100%" stopColor="#5b47d3" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0,250 C120,220 210,285 320,175 C450,60 540,150 650,110 C760,70 850,210 1000,145 L1000,320 L0,320 Z" fill="url(#curatorBusinessArea)" />
            <path d="M0,250 C120,220 210,285 320,175 C450,60 540,150 650,110 C760,70 850,210 1000,145" fill="none" stroke="#5b47d3" strokeWidth="5" strokeLinecap="round" />
          </svg>
          <div className="absolute bottom-0 left-0 right-0 grid grid-cols-6 border-t border-black/5 px-4 py-4 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-3)]">
            {["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((label) => <div key={label}>{label}</div>)}
          </div>
        </div>
      </SectionCard>

      <section className="grid gap-6 xl:grid-cols-2">
        <SectionCard>
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-xl font-black tracking-[-0.03em] text-[var(--text)]">Action signals</h3>
            <Link href="/reports/financial" className="text-sm font-bold text-[var(--primary)]">View history</Link>
          </div>
          <div className="mt-6 space-y-4">
            {[
              ["Invoice ready to send", "One draft can be issued before end of day.", "09:41 AM", "SEND", "secondary"],
              ["Payment needs follow-up", "An overdue invoice should be checked today.", "Yesterday", "ACTION", "error"],
              ["Tax prep on track", "Document collection is 85% complete.", "Jun 22", "READY", "primary"],
            ].map(([title, body, stamp, chip, tone]) => (
              <div key={title} className="flex items-center justify-between gap-4 rounded-[1.5rem] bg-[var(--surface-2)] p-5">
                <div>
                  <div className="text-sm font-bold text-[var(--text)]">{title}</div>
                  <div className="mt-1 text-sm text-[var(--text-3)]">{body}</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--text-3)]">{stamp}</div>
                  <div className={`mt-2 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${tone === "error" ? "bg-[rgba(172,49,73,.12)] text-[#ac3149]" : tone === "secondary" ? "bg-[rgba(0,107,99,.12)] text-[#006b63]" : "bg-[rgba(91,71,211,.12)] text-[#5b47d3]"}`}>{chip}</div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard>
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-black tracking-[-0.03em] text-[var(--text)]">Active invoices</h3>
              {isDemo ? <span className="rounded-full bg-[rgba(91,71,211,.1)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#5b47d3]">Demo data</span> : null}
            </div>
            <Link href="/business/invoices" className="text-sm font-bold text-[var(--primary)]">Open invoices</Link>
          </div>
          <div className="mt-6 overflow-hidden rounded-[1.5rem] bg-[var(--surface-2)]">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-3)]">
                  <th className="px-5 py-4">Client</th>
                  <th className="px-5 py-4">Invoice</th>
                  <th className="px-5 py-4">Workspace</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-t border-black/5">
                    <td className="px-5 py-4 text-sm font-bold text-[var(--text)]">{row.customer}</td>
                    <td className="px-5 py-4 text-sm text-[var(--text-2)]">{row.invoice}</td>
                    <td className="px-5 py-4 text-sm text-[var(--text-3)]">{row.owner}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ${statusTone[row.status] ?? statusTone.pending}`}>{row.status}</span>
                    </td>
                    <td className="px-5 py-4 text-right text-sm font-black text-[var(--text)]">{row.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </section>
    </div>
  )
}

export function MerchantCuratorSurface({
  sales,
  orders,
  lowStock,
  products,
  isDemo = false,
}: {
  sales: string
  orders: string
  lowStock: string
  products: MerchantProduct[]
  isDemo?: boolean
}) {
  const checkoutItems = products.slice(0, 2)

  return (
    <div className="grid gap-8 xl:grid-cols-[1.15fr_.85fr]">
      <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--primary)]">{isDemo ? "Demo store flow" : "Storefront overview"}</div>
            <h2 className="mt-2 text-4xl font-black tracking-[-0.04em] text-[var(--text)]">Know what the shop needs next</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--text-3)]">Sales, current orders, stock risk, and checkout actions are grouped so counter work stays fast.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/merchant/pos" className="rounded-2xl border border-[var(--border)] bg-white px-5 py-3 text-sm font-bold text-[var(--text)] shadow-sm">Open POS</Link>
            <Link href="/merchant/inventory" className="rounded-2xl bg-[var(--primary)] px-5 py-3 text-sm font-bold text-white shadow-[0_18px_40px_rgba(91,71,211,.22)]">Check stock</Link>
          </div>
        </div>

        <section className="grid gap-6 xl:grid-cols-12">
          <SectionCard className="relative overflow-hidden xl:col-span-7">
            <div className="absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-[rgba(91,71,211,.08)] blur-3xl" />
            <div className="relative">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-3)]">Daily revenue</div>
              <div className="mt-3 flex items-end gap-4">
                <div className="text-5xl font-black tracking-[-0.05em] text-[var(--text)]">{sales}</div>
                <span className="rounded-full bg-[#84f5e8] px-3 py-1 text-xs font-bold text-[#005c55]">+12.4%</span>
              </div>
              <p className="mt-4 max-w-md text-sm leading-7 text-[var(--text-3)]">Your storefront is holding a strong pace with a clean transaction rail and clear POS focus.</p>
            </div>
          </SectionCard>
          <SectionCard className="xl:col-span-2 bg-[rgba(251,113,133,.08)]">
            <ShoppingCart size={26} className="text-[var(--primary)]" />
            <div className="mt-10 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-3)]">Orders</div>
            <div className="mt-2 text-4xl font-black tracking-[-0.04em] text-[var(--text)]">{orders}</div>
          </SectionCard>
          <SectionCard className="border border-[rgba(172,49,73,.18)] bg-[rgba(247,106,128,.08)] xl:col-span-3">
            <Package size={26} className="text-[#ac3149]" />
            <div className="mt-10 text-[11px] font-bold uppercase tracking-[0.18em] text-[#ac3149]">Inventory alerts</div>
            <div className="mt-2 text-4xl font-black tracking-[-0.04em] text-[var(--text)]">{lowStock} items</div>
          </SectionCard>
        </section>

        <section>
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-2xl font-black tracking-[-0.03em] text-[var(--text)]">Fast inventory</h3>
            <div className="flex gap-2">
              <button className="rounded-full bg-[var(--primary-soft)] px-4 py-2 text-xs font-bold text-[var(--primary)]">All items</button>
              <button className="rounded-full px-4 py-2 text-xs font-bold text-[var(--text-3)]">Tech</button>
              <button className="rounded-full px-4 py-2 text-xs font-bold text-[var(--text-3)]">Apparel</button>
            </div>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {products.map((product, index) => (
              <SectionCard key={product.id} className="p-4">
                <div className="aspect-square rounded-[1.5rem] bg-[linear-gradient(135deg,#f8f9fd,#eceff5)]" />
                <div className={`mt-4 inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${product.tone === "alert" ? "bg-[rgba(172,49,73,.12)] text-[#ac3149]" : "bg-[rgba(0,107,99,.12)] text-[#006b63]"}`}>{product.stockLabel}</div>
                <div className="mt-4 text-base font-black text-[var(--text)]">{product.name}</div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-lg font-black text-[var(--primary)]">{product.price}</div>
                  <button className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--surface-2)] text-[var(--text-3)] transition hover:bg-[var(--primary)] hover:text-white">
                    <ArrowRight size={16} />
                  </button>
                </div>
              </SectionCard>
            ))}
          </div>
        </section>
      </div>

      <div className="space-y-6">
        <SectionCard className="flex min-h-[720px] flex-col rounded-[2.25rem]">
          <div className="border-b border-black/5 pb-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-black tracking-[-0.03em] text-[var(--text)]">Current order</h3>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-3)]">Terminal ID: #TR-8829</p>
              </div>
              <button className="text-[var(--text-3)]">
                <Receipt size={18} />
              </button>
            </div>
          </div>
          <div className="flex-1 space-y-6 py-6">
            {checkoutItems.map((item, index) => (
              <div key={item.id} className="flex gap-4">
                <div className="h-16 w-16 rounded-2xl bg-[var(--surface-2)]" />
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-sm font-bold text-[var(--text)]">{item.name}</div>
                    <div className="text-sm font-black text-[var(--text)]">{item.price}</div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--surface-2)] text-[var(--text-3)]">-</span>
                      <span className="text-sm font-bold text-[var(--text)]">{index + 1}</span>
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--surface-2)] text-[var(--text-3)]">+</span>
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-3)]">Live cart</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-[1.75rem] bg-[var(--surface-2)] p-6">
            <div className="flex items-center justify-between text-sm text-[var(--text-3)]"><span>Subtotal</span><span>{sales}</span></div>
            <div className="mt-2 flex items-center justify-between text-sm text-[var(--text-3)]"><span>Tax</span><span>$58.32</span></div>
            <div className="mt-6 flex items-end justify-between">
              <span className="text-xl font-black text-[var(--text)]">Total</span>
              <span className="text-4xl font-black tracking-[-0.05em] text-[var(--primary)]">$787.30</span>
            </div>
            <Link href="/merchant/pos" className="mt-8 flex items-center justify-center gap-3 rounded-[1.35rem] bg-[var(--primary)] px-5 py-5 text-lg font-black text-white shadow-[0_22px_50px_rgba(91,71,211,.24)]">
              Complete payment <ArrowRight size={18} />
            </Link>
          </div>
        </SectionCard>

        <SectionCard className="bg-[#006b63] text-white">
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">Connected hardware</div>
          <div className="mt-2 text-2xl font-black">Aura Reader Pro</div>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-white/80">
            <Store size={13} /> Active
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
