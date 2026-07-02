import AppFrame from "@/components/layout/AppFrame"
import { requireRolePage } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { DASHBOARD_VERSION_LABEL } from "@/lib/app-version"
import { BarChart3, CreditCard, Settings, ShieldCheck, Users, BellRing, Database, Gauge } from "lucide-react"

export const metadata = { title: "SaaS Admin — PayMap" }

export default async function SaaSAdminPage() {
  await requireRolePage("admin")
  const [users, active30d, activeSubs, payments, orgs, auditLogs, notifications] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { lastLoginAt: { gte: new Date(Date.now() - 30*24*60*60*1000) } } }),
    prisma.productSubscription.count({ where: { status: "active" } }),
    prisma.stripePayment.count(),
    prisma.organization.count(),
    prisma.auditLog.count(),
    prisma.notification.count({ where: { readAt: null } }),
  ])
  const nav = [
    { href: "/dashboard/admin", label: "Admin", icon: ShieldCheck, accent: "#f59e0b", active: false },
    { href: "/admin/saas", label: "SaaS", icon: BarChart3, accent: "#8b5cf6", active: true },
    { href: "/admin/audit", label: "Audit", icon: Gauge, accent: "#14b8a6", active: false },
    { href: "/settings", label: "Settings", icon: Settings, accent: "#f59e0b", active: false },
  ]
  const items = [
    ["Users", users, "Total customer accounts"],
    ["Active 30d", active30d, "Customers who returned in the last 30 days"],
    ["Active subscriptions", activeSubs, "Current paid or enabled subscriptions"],
    ["Payments", payments, "Recorded Stripe payments"],
    ["Organizations", orgs, "Business and merchant workspaces"],
    ["Audit events", auditLogs, "Security and product operations logs"],
    ["Unread notifications", notifications, "Alerts waiting for users to review"],
  ]
  return (
    <AppFrame brand="payMap Admin" icon="🧭" version={`${DASHBOARD_VERSION_LABEL} · Admin`} title="SaaS control center" subtitle="Monitor billing, alerts, queues, and platform activity from one production workspace." accent="#f59e0b" planLabel="Admin" nav={nav}>
      <div className="space-y-6 min-w-0">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 min-w-0">
          {items.map(([label, value, hint]) => (
            <div key={String(label)} className="rounded-[24px] border border-[var(--border)] bg-[var(--card)] p-5 min-w-0 overflow-hidden">
              <div className="text-sm text-[var(--text-3)]">{label}</div>
              <div className="mt-2 text-3xl font-black">{Number(value).toLocaleString("en-US")}</div>
              <div className="mt-2 text-sm text-[var(--text-2)]">{hint}</div>
            </div>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-3 min-w-0">
          <section className="rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-6 min-w-0 overflow-hidden">
            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-2)]"><BellRing size={16} /> Core system</div>
            <ul className="mt-4 grid gap-3 text-sm text-[var(--text-2)]">
              <li className="rounded-2xl bg-[var(--surface-2)] p-4">BullMQ-ready queue foundation with Redis fallback</li>
              <li className="rounded-2xl bg-[var(--surface-2)] p-4">Rate limiting on auth, billing, notifications, and realtime endpoints</li>
              <li className="rounded-2xl bg-[var(--surface-2)] p-4">Sentry-ready instrumentation hook for production error tracking</li>
            </ul>
          </section>
          <section className="rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-6 min-w-0 overflow-hidden">
            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-2)]"><Database size={16} /> Data layer</div>
            <ul className="mt-4 grid gap-3 text-sm text-[var(--text-2)]">
              <li className="rounded-2xl bg-[var(--surface-2)] p-4">CQRS-lite read model for personal dashboard aggregation</li>
              <li className="rounded-2xl bg-[var(--surface-2)] p-4">Cached dashboard summary with recent notifications and transactions</li>
              <li className="rounded-2xl bg-[var(--surface-2)] p-4">Usage limit cards ready for billing and upgrade nudges</li>
            </ul>
          </section>
          <section className="rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-6 min-w-0 overflow-hidden">
            <div className="text-sm font-semibold text-[var(--text-2)]">Quick actions</div>
            <div className="mt-4 grid gap-3">
              {[
                ["/billing", "Billing", "Review checkout, plan limits, and payment history"],
                ["/admin/audit", "Audit log UI", "Inspect authentication, billing, and workspace events"],
                ["/dashboard/admin", "System dashboard", "Review platform health and operations cards"],
              ].map(([href, title, desc]) => (
                <a key={href} href={href} className="rounded-2xl border border-[var(--border)] p-4 transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)]">
                  <div className="font-bold">{title}</div>
                  <div className="mt-1 text-sm text-[var(--text-2)]">{desc}</div>
                </a>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AppFrame>
  )
}
