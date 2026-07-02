import Link from "next/link"
import { Download, HardDrive, LayoutGrid, Settings, ShieldCheck, Wallet } from "lucide-react"
import { requireModePage } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { getCurrentPlan } from "@/lib/subscription/current-plan"
import CleanMoneyDashboard from "@/components/local-first/CleanMoneyDashboard"
import { LogoFull, LogoIcon } from "@/components/ui/Logo"
import LogoutButton from "@/components/auth/LogoutButton"
import QuickAdd from "@/components/ui/QuickAdd"
import DashboardRefreshOnQuickAdd from "@/components/local-first/DashboardRefreshOnQuickAdd"

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
  const formatRowMoney = (value: number, type: string) => {
    const formatted = new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(value)
    return type === "income" ? `+${formatted}` : `-${formatted}`
  }

  const rows = recent.map((item) => ({
    kind: (item.type === "income" ? "income" : "expense") as "income" | "expense",
    id: item.id,
    date: new Date(item.happenedAt).toLocaleDateString(),
    note: item.note ?? (item.type === "income" ? "รายรับ" : "รายจ่าย"),
    category: item.category?.name ?? "ไม่ระบุหมวด",
    status: "บันทึกแล้ว",
    amount: formatRowMoney(Number(item.amount ?? 0), item.type),
  }))
  const plan = String(getCurrentPlan(user, "personal"))

  return (
    <div className="local-dashboard-shell">
      <aside className="local-dashboard-sidebar">
        <Link href="/" className="local-dashboard-brand" aria-label="PayMap home">
          <LogoFull height={32} />
        </Link>

        <div className="local-dashboard-sidebar-card">
          <div className="local-dashboard-eyebrow">PayMap Local</div>
          <h2>แดชบอร์ดการเงินส่วนตัว</h2>
          <p>ข้อมูลอยู่ในเครื่องเป็นค่าเริ่มต้น และ Cloud Backup ปิดอยู่จนกว่าคุณจะเปิดเอง</p>
        </div>

        <nav className="local-dashboard-nav" aria-label="PayMap dashboard">
          <Link href="/dashboard" className="active"><LayoutGrid size={17} /> ภาพรวม</Link>
          <Link href="/wallets"><Wallet size={17} /> บัญชี</Link>
          <Link href="/settings?tab=data"><ShieldCheck size={17} /> ข้อมูล</Link>
          <Link href="/desktop"><Download size={17} /> แอป Windows</Link>
          <Link href="/settings"><Settings size={17} /> ตั้งค่า</Link>
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
            <span><LogoIcon size={18} /> PayMap Local</span>
            <h1>แดชบอร์ดการเงินของคุณ</h1>
            <p>ติดตามรายรับ รายจ่าย กระแสเงินสด และกำไรจริง ใช้บนเว็บได้ และเหมาะที่สุดบนแอป Windows</p>
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
            rows={rows}
            transactionCount={String(txCount)}
          />
        </main>
      </div>
      <QuickAdd />
      <DashboardRefreshOnQuickAdd />
    </div>
  )
}
