import PlannerPersistenceClient from "@/components/planner/PlannerPersistenceClient"
import { CalendarDays, CreditCard, Landmark, FileText, PiggyBank } from "lucide-react"
import { requireModePage } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { APP_VERSION, DASHBOARD_VERSION_LABEL } from "@/lib/app-version"
import AppFrame from "@/components/layout/AppFrame"
import { ProductHero, ProductQuickLinks, ProductSection } from "@/components/product/ProductMasterSurface"
import { PlannerEmpty, PlannerListCard, PlannerMetric } from "@/components/planner/PlannerSurface"
import { detectSiteLang } from "@/lib/i18n/site"
import { getAppMessages, getLocaleForLang } from "@/lib/i18n/app"

export default async function PlannerPage() {
  const user = await requireModePage("personal")
  const lang = detectSiteLang()
  const t = getAppMessages(lang)
  const locale = getLocaleForLang(lang)

  function formatCurrency(value: number, currency = "THB") {
    return new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0 }).format(value)
  }

  function formatDate(value: Date | string | null | undefined) {
    if (!value) return "—"
    return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(value))
  }
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  const [subscriptions, installments, loans, budgets, noteTransactions] = await Promise.all([
    prisma.subscription.findMany({
      where: { userId: user.id, status: "active" },
      orderBy: { nextBillingAt: "asc" },
      take: 6,
      select: { id: true, name: true, amount: true, currency: true, nextBillingAt: true, note: true },
    }),
    prisma.installment.findMany({
      where: { userId: user.id, status: "active" },
      orderBy: { nextDueDate: "asc" },
      take: 6,
      select: { id: true, name: true, monthlyAmount: true, currency: true, nextDueDate: true, note: true, paidMonths: true, totalMonths: true },
    }),
    prisma.loan.findMany({
      where: { userId: user.id, status: "active", dueDate: { not: null } },
      orderBy: { dueDate: "asc" },
      take: 6,
      select: { id: true, personName: true, direction: true, remaining: true, currency: true, dueDate: true, note: true },
    }),
    prisma.budget.findMany({
      where: { userId: user.id, year: now.getFullYear(), month: now.getMonth() + 1 },
      include: { category: { select: { name: true } } },
      orderBy: { limitAmount: "desc" },
      take: 6,
    }),
    prisma.transaction.findMany({
      where: { userId: user.id, deletedAt: null, note: { not: null }, happenedAt: { gte: monthStart, lt: monthEnd } },
      orderBy: { happenedAt: "desc" },
      take: 5,
      select: { id: true, note: true, amount: true, currency: true, happenedAt: true, type: true },
    }),
  ])

  const totalCommitted = subscriptions.reduce((sum, item) => sum + Number(item.amount), 0) + installments.reduce((sum, item) => sum + Number(item.monthlyAmount), 0)
  const dueThisWeek = [
    ...subscriptions.filter((item) => new Date(item.nextBillingAt).getTime() <= now.getTime() + 7 * 24 * 3600 * 1000),
    ...installments.filter((item) => new Date(item.nextDueDate).getTime() <= now.getTime() + 7 * 24 * 3600 * 1000),
    ...loans.filter((item) => item.dueDate && new Date(item.dueDate).getTime() <= now.getTime() + 7 * 24 * 3600 * 1000),
  ].length

  const nav = [
    { href: "/dashboard", label: t.nav.overview, icon: CalendarDays, accent: "#6366f1", active: false },
    { href: "/planner", label: t.nav.planner, icon: FileText, accent: "#0f766e", active: true },
    { href: "/wallets", label: t.nav.wallets, icon: CreditCard, accent: "#6366f1", active: false },
    { href: "/reports", label: t.nav.reports, icon: Landmark, accent: "#0f766e", active: false },
  ]

  return (
    <AppFrame
      brand="payMap"
      icon="✦"
      version={`${DASHBOARD_VERSION_LABEL} · ${t.planner.title}`}
      title={t.planner.title}
      subtitle={t.planner.subtitle}
      accent="#0f766e"
      planLabel={String(user.plan ?? "free")}
      accountMode={(user.accountMode ?? "personal") as "personal" | "business" | "merchant"}
      nav={nav}
    >
      <div className="space-y-6">
        <ProductHero
          eyebrow={t.planner.eyebrow}
          title={t.planner.title}
          description={t.planner.heroDescription}
          badge={t.common.launchReady}
          accent="#0f766e"
          stats={[
            { label: t.planner.stats.dueSoon, value: String(dueThisWeek), hint: "subscriptions + installments + loans" },
            { label: t.planner.stats.committed, value: formatCurrency(totalCommitted), hint: "fixed upcoming outflows" },
            { label: t.planner.stats.notes, value: String(noteTransactions.length), hint: t.common.thisMonth },
          ]}
        />

        <ProductQuickLinks
          links={[
            { href: "/dashboard", title: t.planner.quickLinks.dashboard[0], description: t.planner.quickLinks.dashboard[1] },
            { href: "/wallets", title: t.planner.quickLinks.wallets[0], description: t.planner.quickLinks.wallets[1] },
            { href: "/reports", title: t.planner.quickLinks.reports[0], description: t.planner.quickLinks.reports[1] },
          ]}
        />

        <ProductSection title={t.common.thisMonth} description={t.planner.subtitle}>
          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
            <PlannerMetric label="Subscriptions" value={String(subscriptions.length)} hint="services billed automatically" />
            <PlannerMetric label="Installments" value={String(installments.length)} hint="monthly installment plans" />
            <PlannerMetric label="Loans" value={String(loans.length)} hint="items with due dates" />
            <PlannerMetric label="Budgets" value={String(budgets.length)} hint={t.common.thisMonth} />
          </div>
        </ProductSection>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <PlannerListCard title={t.planner.sections.upcoming[0]} description={t.planner.sections.upcoming[1]} actionHref="/reports" actionLabel={t.nav.reports}>
            <div className="space-y-3">
              {subscriptions.length || installments.length || loans.length ? (
                [
                  ...subscriptions.map((item) => ({ key: item.id, name: item.name, amount: formatCurrency(Number(item.amount), item.currency), date: formatDate(item.nextBillingAt), sortDate: new Date(item.nextBillingAt).getTime(), note: item.note, meta: "Subscription" })),
                  ...installments.map((item) => ({ key: item.id, name: item.name, amount: formatCurrency(Number(item.monthlyAmount), item.currency), date: formatDate(item.nextDueDate), sortDate: new Date(item.nextDueDate).getTime(), note: item.note, meta: `Installment ${item.paidMonths}/${item.totalMonths}` })),
                  ...loans.map((item) => ({ key: item.id, name: item.personName, amount: formatCurrency(Number(item.remaining), item.currency), date: formatDate(item.dueDate), sortDate: item.dueDate ? new Date(item.dueDate).getTime() : Number.MAX_SAFE_INTEGER, note: item.note, meta: item.direction === "borrowed" ? "Need to repay" : "Expected back" })),
                ]
                  .sort((a, b) => a.sortDate - b.sortDate)
                  .slice(0, 8)
                  .map((item) => (
                    <div key={item.key} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-medium text-[var(--text-1)]">{item.name}</div>
                          <div className="mt-1 text-xs uppercase tracking-[0.14em] text-[var(--text-3)]">{item.meta}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-[var(--text-1)]">{item.amount}</div>
                          <div className="text-xs text-[var(--text-3)]">{item.date}</div>
                        </div>
                      </div>
                      {item.note ? <div className="mt-2 text-sm text-[var(--text-2)]">{item.note}</div> : null}
                    </div>
                  ))
              ) : (
                <PlannerEmpty title={t.planner.empty.noneDue[0]} description={t.planner.empty.noneDue[1]} />
              )}
            </div>
          </PlannerListCard>

          <PlannerListCard title={t.planner.sections.notes[0]} description={t.planner.sections.notes[1]}>
            <div className="space-y-3">
              {noteTransactions.length ? (
                noteTransactions.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-medium text-[var(--text-1)]">{item.type === "expense" ? "Expense note" : item.type === "income" ? "Income note" : "Transfer note"}</div>
                      <div className="text-xs text-[var(--text-3)]">{formatDate(item.happenedAt)}</div>
                    </div>
                    <div className="mt-2 text-sm text-[var(--text-2)]">{item.note}</div>
                    <div className="mt-2 text-xs font-medium text-[var(--text-3)]">{formatCurrency(Number(item.amount), item.currency)}</div>
                  </div>
                ))
              ) : (
                <PlannerEmpty title={t.planner.empty.noneNotes[0]} description={t.planner.empty.noneNotes[1]} />
              )}
            </div>
          </PlannerListCard>
        </div>

        <ProductSection title={t.planner.sections.budget[0]} description={t.planner.sections.budget[1]}>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {budgets.length ? (
              budgets.map((budget) => (
                <div key={budget.id} className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
                  <div className="text-sm font-medium text-[var(--text-1)]">{budget.category.name}</div>
                  <div className="mt-2 text-2xl font-semibold text-[var(--text-1)]">{formatCurrency(Number(budget.limitAmount), budget.currency)}</div>
                  <div className="mt-1 text-sm text-[var(--text-2)]">{t.planner.budgetLimitFor} {new Intl.DateTimeFormat(locale, { month: "long" }).format(now)}</div>
                </div>
              ))
            ) : (
              <div className="md:col-span-2 xl:col-span-3">
                <PlannerEmpty title={t.planner.empty.noneBudget[0]} description={t.planner.empty.noneBudget[1]} />
              </div>
            )}
          </div>
        </ProductSection>


        <ProductSection title={t.planner.sections.personal[0]} description={t.planner.sections.personal[1]}>
          <PlannerPersistenceClient workspace="personal" lang={lang} />
        </ProductSection>
      </div>
    </AppFrame>
  )
}
