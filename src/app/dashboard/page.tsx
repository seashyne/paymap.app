import Link from "next/link"
import { Download, HardDrive, LayoutGrid, Settings, ShieldCheck, Wallet } from "lucide-react"
import { requireModePage } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { getCurrentPlan } from "@/lib/subscription/current-plan"
import CleanMoneyDashboard from "@/components/local-first/CleanMoneyDashboard"
import { LogoFull, LogoIcon } from "@/components/ui/Logo"
import LogoutButton from "@/components/auth/LogoutButton"

export default async function DashboardPage() {
  const user = await requireModePage("personal")
  const [walletCount, txCount, incomeAgg, expenseAgg, recent] = await Promise.all([
    prisma.wallet.count({ where: { userId: user.id } }),
    prisma.transaction.count({ where: { userId: user.id, deletedAt: null } }),
    prisma.transaction.aggregate({ where: { userId: user.id, type: "income", deletedAt: null }, _sum: { amount: true } }),
    prisma.transaction.aggregate({ where: { userId: user.id, type: "expense", deletedAt: null }, _sum: { amount: true } }),
    prisma.transaction.findMany({ where: { userId: user.id, deletedAt: null }, orderBy: { happenedAt: "desc" }, take: 12, include: { category: true } }),
  ])

  const income = Number(incomeAgg._sum.amount ?? 0)
  const expense = Number(expenseAgg._sum.amount ?? 0)
  const balance = income - expense
  const currency = user.currency ?? "THB"
  const formatMoney = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(value)

  const rows = recent.map((item) => ({
    id: item.id,
    date: new Date(item.happenedAt).toLocaleDateString(),
    note: item.note ?? item.type,
    category: item.category?.name ?? "Uncategorized",
    status: "posted",
    amount: new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(Number(item.amount ?? 0)),
  }))
  const demoRows = [
    { id: "demo-rent", date: "Today", note: "Rent reserve moved", category: "Bills", status: "planned", amount: formatMoney(12000) },
    { id: "demo-income", date: "Yesterday", note: "Salary received", category: "Income", status: "posted", amount: formatMoney(48000) },
    { id: "demo-grocery", date: "Mon", note: "Groceries and household", category: "Daily spend", status: "posted", amount: formatMoney(1850) },
    { id: "demo-sub", date: "Jun 25", note: "Cloud subscription", category: "Subscriptions", status: "review", amount: formatMoney(420) },
  ]

  const plan = String(getCurrentPlan(user, "personal"))

  return (
    <div className="local-dashboard-shell">
      <aside className="local-dashboard-sidebar">
        <Link href="/" className="local-dashboard-brand" aria-label="PayMap home">
          <LogoFull height={32} />
        </Link>

        <div className="local-dashboard-sidebar-card">
          <div className="local-dashboard-eyebrow">PayMap Local</div>
          <h2>Private money dashboard</h2>
          <p>ข้อมูลอยู่ในเครื่องเป็นค่าเริ่มต้น และ Cloud Backup ปิดอยู่จนกว่าคุณจะเปิดเอง</p>
        </div>

        <nav className="local-dashboard-nav" aria-label="PayMap dashboard">
          <Link href="/dashboard" className="active"><LayoutGrid size={17} /> Dashboard</Link>
          <Link href="/wallets"><Wallet size={17} /> Wallets</Link>
          <Link href="/settings?tab=data"><ShieldCheck size={17} /> Privacy & Data</Link>
          <Link href="/desktop"><Download size={17} /> Windows app</Link>
          <Link href="/settings"><Settings size={17} /> Settings</Link>
        </nav>

        <div className="local-dashboard-sidebar-footer">
          <div>
            <div className="local-dashboard-eyebrow">Plan</div>
            <strong>{plan}</strong>
          </div>
          <LogoutButton />
        </div>
      </aside>

      <div className="local-dashboard-workspace">
        <header className="local-dashboard-topbar">
          <div className="local-dashboard-title">
            <span><LogoIcon size={18} /> Local-first money dashboard</span>
            <h1>Your private money dashboard</h1>
            <p>Track income, expenses, cash flow, and real profit. Best on Windows, usable on web.</p>
          </div>
          <div className="local-dashboard-status">
            <span><HardDrive size={14} /> Local Only</span>
            <span>Cloud Backup Off</span>
          </div>
        </header>

        <main className="local-dashboard-content">
          <CleanMoneyDashboard
            userName={user.name ?? "Curator"}
            totalBalance={formatMoney(balance)}
            walletCount={String(walletCount)}
            income={formatMoney(income)}
            expense={formatMoney(expense)}
            rows={rows.length ? rows : demoRows}
            isDemo={!rows.length}
          />
        </main>
      </div>
    </div>
  )
}
