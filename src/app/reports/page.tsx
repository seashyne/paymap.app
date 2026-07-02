import AppFrame, { buildPrimaryNav } from "@/components/layout/AppFrame";
import { requireUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { AreaTrendChart, GroupedBarChart, RingLegendChart } from "@/components/ui/Charts";
import Link from "next/link";
import type { ReactNode } from "react";
import { Download, LineChart, Store, Building2, Wallet } from "lucide-react"
import { mergeUiPreferences } from "@/lib/ui-preferences"
import { getTemplatePageContent } from "@/lib/ui-template-content"
import { getTemplateModuleSurface } from "@/lib/ui-template-modules"
import { ProductHero, ProductQuickLinks, ProductSection } from "@/components/product/ProductMasterSurface"
import { TemplateModuleIntro, TemplateEmptyStateCard } from "@/components/ui/TemplateModuleSurface"
import PreferenceDisabledBlock from "@/components/ui/PreferenceDisabledBlock"
import TemplateRecommendedWidgets from "@/components/dashboard/TemplateRecommendedWidgets"
import ExportButton from "@/components/ui/ExportButton";
import { DASHBOARD_VERSION_LABEL } from "@/lib/app-version"
import { getCurrentPlan } from "@/lib/subscription/current-plan"

function monthLabel(date: Date) {
  return date.toLocaleDateString("th-TH", { month: "short" });
}

export default async function ReportsPage() {
  const user = await requireUser();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const sixMonthStarts = Array.from({ length: 6 }, (_, i) => new Date(now.getFullYear(), now.getMonth() - (5 - i), 1));

  const [transactions, categories, stores, organizations] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId: user.id, deletedAt: null, happenedAt: { gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) } },  // v1.9
      include: { category: { select: { name: true, color: true } } },
      orderBy: { happenedAt: "asc" },
    }),
    prisma.category.findMany({ where: { userId: user.id } }),
    prisma.store.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" }, take: 1 }),
    prisma.organization.findMany({ where: { ownerId: user.id }, orderBy: { createdAt: "asc" }, take: 1 }),
  ]);

  const personalTrend = sixMonthStarts.map((d) => {
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
    const monthItems = transactions.filter((tx) => new Date(tx.happenedAt) >= start && new Date(tx.happenedAt) <= end);
    const income = monthItems.filter((tx) => tx.type === "income").reduce((s, tx) => s + Number(tx.amount), 0);
    const expense = monthItems.filter((tx) => tx.type === "expense").reduce((s, tx) => s + Number(tx.amount), 0);
    return { label: monthLabel(d), value: income, value2: expense };
  });

  const expenseThisMonth = transactions.filter((tx) => tx.type === "expense" && new Date(tx.happenedAt) >= monthStart);
  const expenseByCategoryMap = new Map<string, { label: string; value: number; color: string }>();
  for (const tx of expenseThisMonth) {
    const key = tx.category?.name ?? "Uncategorized";
    const current = expenseByCategoryMap.get(key) ?? { label: key, value: 0, color: tx.category?.color ?? "#8b5cf6" };
    current.value += Number(tx.amount);
    expenseByCategoryMap.set(key, current);
  }
  const expenseBreakdown = Array.from(expenseByCategoryMap.values()).sort((a, b) => b.value - a.value).slice(0, 6);
  const expenseTotal = expenseBreakdown.reduce((s, item) => s + item.value, 0);

  let merchantSeries = [] as { label: string; value: number; value2: number }[];
  let merchantSummary = null as null | { salesCount: number; grossRevenue: number; vatCollected: number; stockItems: number };
  if (stores[0]) {
    const storeId = stores[0].id;
    const [orders, products] = await Promise.all([
      prisma.salesOrder.findMany({ where: { storeId, soldAt: { gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) } }, orderBy: { soldAt: "asc" } }),
      prisma.merchantProduct.findMany({ where: { storeId } }),
    ]);
    merchantSeries = sixMonthStarts.map((d) => {
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      const monthOrders = orders.filter((o) => new Date(o.soldAt) >= start && new Date(o.soldAt) <= end);
      return {
        label: monthLabel(d),
        value: monthOrders.reduce((s, o) => s + Number(o.totalAmount), 0),
        value2: monthOrders.reduce((s, o) => s + Number(o.vatAmount), 0),
      };
    });
    const monthOrders = orders.filter((o) => new Date(o.soldAt) >= monthStart);
    merchantSummary = {
      salesCount: monthOrders.length,
      grossRevenue: monthOrders.reduce((s, o) => s + Number(o.totalAmount), 0),
      vatCollected: monthOrders.reduce((s, o) => s + Number(o.vatAmount), 0),
      stockItems: products.length,
    };
  }

  let businessSeries = [] as { label: string; value: number; value2: number }[];
  let businessSummary = null as null | { headcount: number; laborCost: number; pendingLeaves: number; payrollRuns: number };
  if (organizations[0]) {
    const orgId = organizations[0].id;
    const [employees, payrollRuns, pendingLeaves] = await Promise.all([
      prisma.employee.findMany({ where: { organizationId: orgId } }),
      prisma.payrollRun.findMany({ where: { organizationId: orgId, year: now.getFullYear() }, orderBy: { month: "asc" } }),
      prisma.leaveRequest.count({ where: { organizationId: orgId, status: "pending" } }),
    ]);
    businessSeries = Array.from({ length: 12 }, (_, idx) => {
      const month = idx + 1;
      const run = payrollRuns.find((p) => p.month === month);
      return { label: String(month), value: run ? Number(run.totalGross) : 0, value2: run ? Number(run.totalNet) : 0 };
    }).slice(Math.max(0, now.getMonth() - 5), now.getMonth() + 1);
    businessSummary = {
      headcount: employees.length,
      laborCost: payrollRuns.reduce((s, run) => s + Number(run.totalGross) + Number(run.totalSso), 0),
      pendingLeaves,
      payrollRuns: payrollRuns.length,
    };
  }

  const currentPlan = getCurrentPlan(user, user.accountMode ?? "personal")
  const uiPreferences = mergeUiPreferences(user.uiPreferences ?? null)
  const pageContent = getTemplatePageContent(uiPreferences.template, "reports")
  const moduleSurface = getTemplateModuleSurface(uiPreferences.template, "reportsCenter")

  return (
    <AppFrame
      brand="payMap"
      icon="◎"
      version={`${DASHBOARD_VERSION_LABEL} · Reports`}
      title={pageContent.title}
      subtitle={pageContent.subtitle}
      accent="#14b8a6"
      planLabel={currentPlan}
        accountMode={(user.accountMode ?? "personal") as "personal" | "business" | "merchant"}
      nav={buildPrimaryNav("reports")}
    >
      <div className="space-y-6">
        <ProductHero
          eyebrow="Reports center"
          title={pageContent.title}
          description={`${pageContent.subtitle} · รวมมุมมอง personal, merchant และ business ใน layout ที่อ่านง่ายขึ้นบน desktop และยังเดินภาษาหน้าตาเดียวกับ personal cockpit`}
          badge="Unified workspace"
          accent="#14b8a6"
          stats={[
            { label: "Categories", value: String(categories.length), hint: "expense tracking" },
            { label: "Stores", value: String(stores.length), hint: "merchant linked" },
            { label: "Organizations", value: String(organizations.length), hint: "business linked" },
          ]}
        />
        <ProductQuickLinks
          links={[
            { href: "/dashboard", title: "Back to personal cockpit", description: "กลับไปหน้าหลักที่รวม net worth, spending trends และ upcoming obligations" },
            { href: "/merchant", title: "Merchant drill-down", description: "กระโดดไป workspace ร้านค้าเมื่ออยากดูยอดขายหรือ VAT เชิงลึก" },
            { href: "/business", title: "Business drill-down", description: "ต่อไปยัง payroll, accounting และ org operations ได้ทันที" },
          ]}
        />
        <TemplateModuleIntro surface={moduleSurface} />

        <section className="page-hero">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <div className="section-title mb-3">{moduleSurface.eyebrow}</div>
              <h1 className="text-3xl font-black md:text-4xl">{moduleSurface.title}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--text-2)] md:text-base">
                {moduleSurface.description}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 xl:w-[42%] xl:grid-cols-1">
              <Stat title="Categories" value={String(categories.length)} icon={<Wallet size={16} />} />
              <Stat title="Stores" value={String(stores.length)} icon={<Store size={16} />} />
              <Stat title="Organizations" value={String(organizations.length)} icon={<Building2 size={16} />} />
            </div>
          </div>
        </section>

        <TemplateRecommendedWidgets template={uiPreferences.template} />

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.18fr)_340px]">
          <section className="glass-card rounded-[30px] p-6">
            <div className="flex flex-wrap items-center gap-3">
              <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#14b8a6]">Reports cockpit</div>
              <div className="rounded-full bg-[rgba(20,184,166,.14)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#14b8a6]">Cross-workspace review</div>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <Metric label="6M income" value={personalTrend.reduce((sum, item) => sum + item.value, 0).toLocaleString("th-TH")} />
              <Metric label="6M expense" value={personalTrend.reduce((sum, item) => sum + item.value2, 0).toLocaleString("th-TH")} />
              <Metric label="Live exports" value="3" />
            </div>
            <div className="mt-5 text-sm leading-7 text-[var(--text-2)]">
              โซนนี้ทำหน้าที่เหมือน cockpit summary สำหรับเจ้าของระบบที่อยากอ่าน personal, merchant และ business ต่อเนื่องกันโดยไม่รู้สึกว่าเป็นคนละหน้าหรือคนละ product
            </div>
          </section>

          <section className="glass-card rounded-[30px] p-6">
            <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--text-3)]">Focus rail</div>
            <div className="mt-4 grid gap-3">
              <div className="soft-panel rounded-[22px] p-4">
                <div className="text-sm font-bold">Personal focus</div>
                <div className="mt-2 text-sm text-[var(--text-2)]">หมวดรายจ่ายหลักเดือนนี้คือ {expenseBreakdown[0]?.label ?? "ยังไม่มีข้อมูล"} และใช้ไป {expenseBreakdown[0]?.value.toLocaleString("th-TH") ?? "0"}</div>
              </div>
              <div className="soft-panel rounded-[22px] p-4">
                <div className="text-sm font-bold">Merchant focus</div>
                <div className="mt-2 text-sm text-[var(--text-2)]">{merchantSummary ? `ร้านค้ามี ${merchantSummary.salesCount} orders เดือนนี้ และเก็บ VAT ${merchantSummary.vatCollected.toLocaleString("th-TH")}` : "ยังไม่มี merchant workspace เชื่อมอยู่"}</div>
              </div>
              <div className="soft-panel rounded-[22px] p-4">
                <div className="text-sm font-bold">Business focus</div>
                <div className="mt-2 text-sm text-[var(--text-2)]">{businessSummary ? `pending leave ${businessSummary.pendingLeaves} รายการ และ payroll runs ${businessSummary.payrollRuns} รอบ` : "ยังไม่มี business workspace เชื่อมอยู่"}</div>
              </div>
            </div>
          </section>
        </section>

        <ProductSection title="Cross-workspace insights" description="กราฟ, breakdown และ comparison ถูกจัดเป็น blocks ที่อ่านต่อเนื่องขึ้นโดยไม่แตะ logic ของรายงานเดิม">
        <div className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
          <section className="glass-card rounded-[30px] p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black">Personal finance trend</h2>
                <p className="mt-1 text-sm text-[var(--text-3)]">เทียบรายรับและรายจ่ายย้อนหลัง 6 เดือน</p>
              </div>
              <Link href="/api/export?type=transactions&format=csv" className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--text-2)]">
                <Download size={15} /> Export CSV
              </Link>
            </div>
            {uiPreferences.showCharts ? <AreaTrendChart data={personalTrend} color="#8b5cf6" secondaryColor="#fb7185" /> : <PreferenceDisabledBlock compact title="Personal trend chart ถูกปิด" />}
          </section>

          <section className="glass-card rounded-[30px] p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black">Expense breakdown</h2>
                <p className="mt-1 text-sm text-[var(--text-3)]">หมวดรายจ่ายเดือนนี้</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--text-3)]">
                <LineChart size={14} /> เดือนปัจจุบัน
              </div>
            </div>
            {!uiPreferences.showCharts ? <PreferenceDisabledBlock compact title="Expense chart ถูกปิด" /> : expenseBreakdown.length ? <RingLegendChart data={expenseBreakdown} total={expenseTotal} /> : <EmptyBlock text="ยังไม่มีข้อมูลรายจ่ายสำหรับสร้างกราฟหมวดหมู่" />}
          </section>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <section className="glass-card rounded-[30px] p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black">Merchant sales report</h2>
                <p className="mt-1 text-sm text-[var(--text-3)]">เหมาะกับ owner ที่เปิดดูยอดขายบนเว็บทุกวัน</p>
              </div>
              <Link href="/merchant" className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--text-2)]">
                เปิด Merchant
              </Link>
            </div>
            {merchantSummary ? (
              <>
                <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <Metric label="Orders" value={merchantSummary.salesCount.toLocaleString()} />
                  <Metric label="Revenue" value={merchantSummary.grossRevenue.toLocaleString()} />
                  <Metric label="VAT" value={merchantSummary.vatCollected.toLocaleString()} />
                  <Metric label="SKUs" value={merchantSummary.stockItems.toLocaleString()} />
                </div>
                {uiPreferences.showCharts ? <GroupedBarChart data={merchantSeries} firstLabel="Revenue" secondLabel="VAT" firstColor="#22c55e" secondColor="#f59e0b" /> : <PreferenceDisabledBlock compact title="Merchant report chart ถูกปิด" />}
              </>
            ) : <TemplateEmptyStateCard title={moduleSurface.empty.title} description={moduleSurface.empty.description} actionHref={moduleSurface.empty.actionHref} actionLabel={moduleSurface.empty.actionLabel} />}
          </section>

          <section className="glass-card rounded-[30px] p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black">Business payroll report</h2>
                <p className="mt-1 text-sm text-[var(--text-3)]">สรุป payroll และแรงงานสำหรับฝั่ง business</p>
              </div>
              <Link href="/business" className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--text-2)]">
                เปิด Business
              </Link>
            </div>
            {businessSummary ? (
              <>
                <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <Metric label="Headcount" value={businessSummary.headcount.toLocaleString()} />
                  <Metric label="Labor cost" value={businessSummary.laborCost.toLocaleString()} />
                  <Metric label="Pending leave" value={businessSummary.pendingLeaves.toLocaleString()} />
                  <Metric label="Payroll runs" value={businessSummary.payrollRuns.toLocaleString()} />
                </div>
                {uiPreferences.showCharts ? <GroupedBarChart data={businessSeries} firstLabel="Gross" secondLabel="Net" firstColor="#38bdf8" secondColor="#8b5cf6" /> : <PreferenceDisabledBlock compact title="Business payroll chart ถูกปิด" />}
              </>
            ) : <TemplateEmptyStateCard title={moduleSurface.empty.title} description={moduleSurface.empty.description} actionHref={moduleSurface.empty.actionHref} actionLabel={moduleSurface.empty.actionLabel} />}
          </section>
        </div>

        <section className="glass-card rounded-[30px] p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black">Export center</h2>
              <p className="mt-1 text-sm text-[var(--text-3)]">รวมทางลัด export ที่ใช้บ่อยในการเปิดตัวเวอร์ชันเว็บ</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <ExportCard href="/api/export?type=transactions&format=csv" title="Transactions CSV" desc="ส่งออกธุรกรรมเพื่อใช้ใน Excel หรือบัญชี" />
            <ExportCard href="/api/export?type=transactions&format=json" title="Transactions JSON" desc="ใช้ต่อกับ API / BI tools หรืองาน data analysis" />
            <ExportCard href="/api/export?type=subscriptions&format=csv" title="Subscriptions CSV" desc="สรุป subscription และรอบบิลทั้งหมด" />
          </div>
        </section>
        </ProductSection>
      </div>
    </AppFrame>
  );
}

function Stat({ title, value, icon }: { title: string; value: string; icon: ReactNode }) {
  return (
    <div className="soft-panel rounded-[22px] p-4">
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--text-3)]">{title}</div>
        {icon}
      </div>
      <div className="mt-2 text-lg font-black">{value}</div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="soft-panel rounded-[22px] p-4">
      <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--text-3)]">{label}</div>
      <div className="mt-2 text-lg font-black">{value}</div>
    </div>
  )
}

function EmptyBlock({ text }: { text: string }) {
  return <div className="empty-state min-h-[220px]"><Download size={24} className="mb-3 text-[var(--text-3)]" /><div className="text-sm text-[var(--text-3)]">{text}</div></div>
}

function ExportCard({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <a href={href} className="soft-panel rounded-[24px] p-5 transition hover:-translate-y-0.5 hover:border-[var(--border2)]">
      <div className="mb-3 inline-flex rounded-2xl bg-white/5 p-3"><Download size={16} /></div>
      <div className="text-base font-black">{title}</div>
      <div className="mt-2 text-sm leading-6 text-[var(--text-3)]">{desc}</div>
    </a>
  )
}
