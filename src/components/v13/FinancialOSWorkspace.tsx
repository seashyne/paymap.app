import Link from "next/link"
import { AlertTriangle, ArrowRight, BarChart3, Briefcase, Calculator, CreditCard, Landmark, Package2, ShieldCheck, TrendingUp, Users } from "lucide-react"
import { WorkbenchHero, KpiStrip } from "@/components/workbench/WorkbenchPageShell"
import type { V13FinancialForecast, V13FinancialOsSummary, V13InsightItem } from "@/lib/v13/types"

function fmt(value: number) {
  return `฿${Math.round(value).toLocaleString("th-TH")}`
}

function EmptyFlowBlock({ title, body, primaryHref, primaryLabel }: { title: string; body: string; primaryHref: string; primaryLabel: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] p-4">
      <div className="text-sm font-semibold text-white">{title}</div>
      <p className="mt-2 text-sm leading-6 text-[var(--text-2)]">{body}</p>
      <Link href={primaryHref} className="mt-3 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white">
        {primaryLabel}
        <ArrowRight size={14} />
      </Link>
    </div>
  )
}

export default function FinancialOSWorkspace({
  summary,
  forecast,
  insights,
}: {
  summary: V13FinancialOsSummary
  forecast: V13FinancialForecast
  insights: V13InsightItem[]
}) {
  const modules = [
    { href: "/business/accounting", title: "Accounting Engine", body: "Double-entry, ledger, journal และ month-end close", icon: Landmark, accent: "#14b8a6" },
    { href: "/business/payroll", title: "Payroll + Tax Auto", body: "คำนวณเงินเดือน ภาษีหัก ณ ที่จ่าย และ flow จ่ายเงินจริง", icon: CreditCard, accent: "#38bdf8" },
    { href: "/merchant/pos", title: "Merchant / POS", body: "รับเงินหน้าร้าน สรุปยอด และโพสต์เข้าบัญชี", icon: Briefcase, accent: "#fb7185" },
    { href: "/merchant/inventory", title: "Inventory Lite", body: "สินค้า สต็อก ต้นทุน และ low-stock alert", icon: Package2, accent: "#8b5cf6" },
    { href: "/business/os#insights", title: "Business Insight AI", body: "แนะนำลดภาษี ลด cost และวิเคราะห์กำไรจากข้อมูลจริง", icon: TrendingUp, accent: "#22c55e" },
    { href: "/settings", title: "Multi-user + RBAC", body: "Owner / Admin / Staff พร้อมสิทธิ์ที่ต่างกันตามงาน", icon: ShieldCheck, accent: "#f59e0b" },
  ]

  return (
    <div className="space-y-6">
      <WorkbenchHero
        eyebrow="PayMap v13.1"
        title="Financial OS + Business OS สำหรับ SME"
        subtitle="มุมมองกลางสำหรับเจ้าของกิจการบน PC: ดูเงินสด กำไร ภาษี เงินเดือน หน้าร้าน และสต็อกจากพื้นที่ทำงานเดียว"
        accent="#38bdf8"
        actions={
          <div className="flex flex-wrap gap-3">
            <Link href="/business/accounting" className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white">เปิด Accounting</Link>
            <Link href="/merchant/pos" className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100">เปิด POS</Link>
          </div>
        }
      />

      <KpiStrip items={[
        { label: "Cash in", value: fmt(summary.totals.invoiceCollected + summary.totals.salesTotal), hint: "เงินเข้าเดือนนี้" },
        { label: "Net profit", value: fmt(summary.totals.netProfit), hint: `${summary.totals.margin.toFixed(1)}% margin` },
        { label: "Tax impact", value: fmt(summary.totals.taxExposure), hint: "VAT + payroll withholding" },
        { label: "Payroll", value: fmt(summary.totals.payrollGross), hint: `${summary.totals.employeeCount} active employees` },
      ]} />

      <section className="grid gap-4 xl:grid-cols-[1.45fr_.95fr]">
        <div className="rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-3)]">Financial dashboard</div>
              <h2 className="mt-2 text-2xl font-black text-white">Realtime cashflow + P/L + tax impact</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--text-2)]">สรุปจาก invoice, payroll, sales และ inventory ในเดือนปัจจุบัน</p>
            </div>
            <BarChart3 className="text-cyan-300" />
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {[
              ["Invoice issued", fmt(summary.totals.invoiceIssued), "ยอดใบแจ้งหนี้ที่ออกในเดือนนี้"],
              ["Sales total", fmt(summary.totals.salesTotal), `${summary.totals.orderCount} orders`],
              ["Gross profit", fmt(summary.totals.grossProfit), "กำไรขั้นต้นของงานขายสินค้า"],
              ["Journal posted", `${summary.totals.journalCount}`, `${summary.totals.chartCount} accounts`],
            ].map(([label, value, hint]) => (
              <div key={label} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-[var(--text-3)]">{label}</div>
                <div className="mt-2 text-2xl font-black text-white">{value}</div>
                <div className="mt-2 text-sm text-[var(--text-3)]">{hint}</div>
              </div>
            ))}
          </div>
          {!summary.org || !summary.store ? (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {!summary.org ? <EmptyFlowBlock title="ยังไม่ตั้งค่า organization" body="สร้าง business workspace ก่อนเพื่อให้ payroll, invoices และ accounting ทำงานครบ flow" primaryHref="/business" primaryLabel="ไปหน้า Business" /> : null}
              {!summary.store ? <EmptyFlowBlock title="ยังไม่ตั้งค่า store" body="สร้างร้านค้าก่อนเพื่อเริ่ม POS, inventory และ sync ยอดขายเข้าสู่บัญชี" primaryHref="/merchant" primaryLabel="ไปหน้า Merchant" /> : null}
            </div>
          ) : null}
        </div>

        <div className="rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-3)]">Forecast AI</div>
              <h2 className="mt-2 text-xl font-black text-white">3 เดือนข้างหน้า</h2>
            </div>
            <Calculator className="text-emerald-300" />
          </div>
          <div className="mt-4 space-y-3">
            {forecast.forecast.map((item) => (
              <div key={item.monthOffset} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                <div className="flex items-center justify-between text-sm text-[var(--text-2)]">
                  <span>Month +{item.monthOffset}</span>
                  <span>{fmt(item.projectedNet)}</span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                  <div className="rounded-xl bg-black/10 px-3 py-2"><div className="text-[var(--text-3)]">Cash in</div><div className="mt-1 font-bold text-white">{fmt(item.projectedCashIn)}</div></div>
                  <div className="rounded-xl bg-black/10 px-3 py-2"><div className="text-[var(--text-3)]">Payroll</div><div className="mt-1 font-bold text-white">{fmt(item.projectedPayroll)}</div></div>
                  <div className="rounded-xl bg-black/10 px-3 py-2"><div className="text-[var(--text-3)]">Tax</div><div className="mt-1 font-bold text-white">{fmt(item.projectedTax)}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {modules.map((item) => {
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href} className="group rounded-[26px] border border-[var(--border)] bg-[var(--card)] p-5 transition-transform hover:-translate-y-0.5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: `${item.accent}16`, color: item.accent, border: `1px solid ${item.accent}33` }}>
                  <Icon size={18} />
                </div>
                <ArrowRight size={16} className="text-[var(--text-3)] transition-transform group-hover:translate-x-0.5" />
              </div>
              <div className="mt-4 text-lg font-bold text-white">{item.title}</div>
              <p className="mt-2 text-sm leading-6 text-[var(--text-2)]">{item.body}</p>
            </Link>
          )
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_.9fr]" id="insights">
        <div className="rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-3)]">Business Insight AI</div>
              <h2 className="mt-2 text-2xl font-black text-white">แนะนำลดภาษี ลด cost และดูสัญญาณกำไร</h2>
            </div>
            <TrendingUp className="text-emerald-300" />
          </div>
          <div className="mt-4 space-y-3">
            {insights.map((insight) => (
              <div key={`${insight.tone}-${insight.title}`} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  {insight.tone === "critical" ? <AlertTriangle size={16} className="text-rose-300" /> : <TrendingUp size={16} className={insight.tone === "good" ? "text-emerald-300" : "text-amber-300"} />}
                  {insight.title}
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--text-2)]">{insight.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-3)]">Operations watchlist</div>
              <h2 className="mt-2 text-2xl font-black text-white">Payroll + stock + latest orders</h2>
            </div>
            <Users className="text-sky-300" />
          </div>
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
              <div className="text-sm font-semibold text-white">Payroll preview</div>
              <div className="mt-2 space-y-2 text-sm text-[var(--text-2)]">
                {summary.employees.length ? summary.employees.slice(0, 4).map((employee) => (
                  <div key={employee.id} className="flex items-center justify-between gap-3">
                    <span className="truncate">{employee.name}</span>
                    <span className="font-semibold text-white">{fmt(employee.payrollPreview.netSalary)}</span>
                  </div>
                )) : <div>ยังไม่มีพนักงานในองค์กร</div>}
              </div>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
              <div className="text-sm font-semibold text-white">Low stock</div>
              <div className="mt-2 space-y-2 text-sm text-[var(--text-2)]">
                {summary.inventory.length ? summary.inventory.slice(0, 4).map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3">
                    <span className="truncate">{item.name}</span>
                    <span className="font-semibold text-white">{item.stockQty}/{item.minStockQty}</span>
                  </div>
                )) : <div>ยังไม่มีสินค้าที่ต่ำกว่า minimum</div>}
              </div>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
              <div className="text-sm font-semibold text-white">Recent orders</div>
              <div className="mt-2 space-y-2 text-sm text-[var(--text-2)]">
                {summary.recentOrders.length ? summary.recentOrders.slice(0, 4).map((order) => (
                  <div key={order.id} className="flex items-center justify-between gap-3">
                    <span className="truncate">{order.orderNo}</span>
                    <span className="font-semibold text-white">{fmt(order.totalAmount)}</span>
                  </div>
                )) : <div>ยังไม่มีออเดอร์ล่าสุด</div>}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
