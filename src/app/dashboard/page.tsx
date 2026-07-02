import AppFrame from "@/components/layout/AppFrame"
import { BarChart3, CreditCard, LayoutGrid, Settings, Wallet } from "lucide-react"
import { requireModePage } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { getCurrentPlan } from "@/lib/subscription/current-plan"
import { PersonalCuratorSurface } from "@/components/curator/MainSurfaces"
import CleanMoneyDashboard from "@/components/local-first/CleanMoneyDashboard"

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

  return (
    <AppFrame
      brand="PayMap"
      icon="◈"
      version="PayMap 15 · Personal"
      title="Your money cockpit"
      subtitle="See your money clearly, spot what changed, and stay in control from one personal workspace"
      accent="#8b5cf6"
      planLabel={String(getCurrentPlan(user, "personal"))}
      accountMode="personal"
      nav={[
        { href: "/dashboard", label: "Overview", icon: LayoutGrid, accent: "#8b5cf6", active: true },
        { href: "/wallets", label: "Wallets", icon: Wallet, accent: "#8b5cf6", active: false },
        { href: "/analytics", label: "Analytics", icon: BarChart3, accent: "#14b8a6", active: false },
        { href: "/billing", label: "Billing", icon: CreditCard, accent: "#22c55e", active: false },
        { href: "/settings", label: "Settings", icon: Settings, accent: "#f59e0b", active: false },
      ]}
    >
      <CleanMoneyDashboard
        userName={user.name ?? "Curator"}
        totalBalance={formatMoney(balance)}
        walletCount={String(walletCount)}
        income={formatMoney(income)}
        expense={formatMoney(expense)}
        rows={rows.length ? rows : demoRows}
        isDemo={!rows.length}
      />
    </AppFrame>
  )
}
