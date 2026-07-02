"use client"

import React, { useEffect, useMemo, useState } from "react"
import type { ComponentType } from "react"
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bot,
  Brain,
  Briefcase,
  Building2,
  CheckCircle2,
  Command,
  Cpu,
  CreditCard,
  DollarSign,
  Gauge,
  LayoutGrid,
  Package,
  Receipt,
  Search,
  Settings,
  Shield,
  ShoppingCart,
  Sparkles,
  Store,
  User,
  Wallet,
  Zap,
} from "lucide-react"
import { TableSystem } from "@/components/ui/TableSystem"

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ")
}

export function WorkspaceHero({ eyebrow, title, description, accent, meta }: { eyebrow: string; title: string; description: string; accent: string; meta: Array<{ label: string; value: string; hint?: string }> }) {
  return (
    <section className="rounded-[36px] border border-[var(--border)] p-6 lg:p-8" style={{ background: `radial-gradient(circle at top right, ${accent}24, transparent 24%), var(--card)` }}>
      <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-4xl">
          <div className="text-[11px] font-mono uppercase tracking-[0.18em]" style={{ color: accent }}>{eyebrow}</div>
          <h1 className="mt-2 text-3xl font-black tracking-tight lg:text-[40px]">{title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--text-2)] lg:text-[15px]">{description}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {meta.map((item) => (
            <div key={item.label} className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-4">
              <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--text-3)]">{item.label}</div>
              <div className="mt-2 text-2xl font-black">{item.value}</div>
              {item.hint ? <div className="mt-1 text-xs text-[var(--text-3)]">{item.hint}</div> : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function KpiGrid({ items }: { items: Array<{ label: string; value: string; change?: string; accent: string; icon?: ComponentType<any> }> }) {
  return (
    <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon ?? Gauge
        return (
          <div key={item.label} className="glass-card rounded-[28px] p-5 lg:p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-[20px]" style={{ background: `${item.accent}18`, color: item.accent }}><Icon size={20} /></div>
              {item.change ? <span className="rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ background: `${item.accent}18`, color: item.accent }}>{item.change}</span> : null}
            </div>
            <div className="mt-5 text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--text-3)]">{item.label}</div>
            <div className="mt-2 text-3xl font-black tracking-tight">{item.value}</div>
          </div>
        )
      })}
    </section>
  )
}

export function InsightRail({ title = "AI assist", items }: { title?: string; items: Array<{ title: string; body: string; tone?: string }> }) {
  return (
    <section className="glass-card rounded-[30px] p-5 lg:p-6">
      <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--text-3)]"><Bot size={14} /> {title}</div>
      <div className="mt-4 grid gap-3">
        {items.map((item) => (
          <div key={item.title} className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-2)] p-4">
            <div className="flex items-center gap-2 text-sm font-bold" style={{ color: item.tone ?? "var(--text)" }}><Sparkles size={14} /> {item.title}</div>
            <p className="mt-2 text-sm leading-6 text-[var(--text-2)]">{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export function AnalyticsSurface({ title, accent, series, rightTitle = "Signals" }: { title: string; accent: string; series: Array<{ label: string; value: number }>; rightTitle?: string }) {
  const max = Math.max(...series.map((item) => item.value), 1)
  return (
    <section className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.9fr)]">
      <div className="glass-card rounded-[30px] p-5 lg:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--text-3)]">Advanced analytics</div>
            <h3 className="mt-1 text-2xl font-black">{title}</h3>
          </div>
          <div className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: `${accent}18`, color: accent }}>Live-ready</div>
        </div>
        <div className="mt-6 grid h-[280px] grid-cols-12 items-end gap-3 rounded-[24px] border border-[var(--border)] bg-[linear-gradient(180deg,rgba(255,255,255,.02),transparent)] p-4">
          {series.map((item) => (
            <div key={item.label} className="flex h-full flex-col justify-end gap-3">
              <div className="rounded-t-[18px]" style={{ background: `linear-gradient(180deg, ${accent}, ${accent}66)`, height: `${Math.max(14, (item.value / max) * 100)}%` }} />
              <div className="text-center text-[11px] font-medium text-[var(--text-3)]">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="glass-card rounded-[30px] p-5 lg:p-6">
        <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--text-3)]">{rightTitle}</div>
        <div className="mt-4 grid gap-3">
          {([
            ["Forecast confidence", "92%", Brain],
            ["Anomaly check", "2 flags", Shield],
            ["Automation readiness", "Strong", Zap],
            ["Sync latency", "34ms", Cpu],
          ] as [string, string, React.ElementType][]).map(([label, value, Icon]) => (
              <div key={label} className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-2)] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-semibold"><Icon size={15} /> {label}</div>
                  <div className="text-sm font-black">{value}</div>
                </div>
              </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function ActionBoard({ actions }: { actions: Array<{ title: string; body: string; accent: string; icon?: ComponentType<any> }> }) {
  return (
    <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
      {actions.map((item) => {
        const Icon = item.icon ?? ArrowRight
        return (
          <button key={item.title} type="button" className="group rounded-[26px] border border-[var(--border)] bg-[var(--card)] p-5 text-left transition hover:-translate-y-0.5 hover:border-[var(--border-strong)]">
            <div className="flex h-11 w-11 items-center justify-center rounded-[18px]" style={{ background: `${item.accent}18`, color: item.accent }}><Icon size={18} /></div>
            <div className="mt-4 text-lg font-black tracking-tight">{item.title}</div>
            <div className="mt-1 text-sm leading-6 text-[var(--text-2)]">{item.body}</div>
          </button>
        )
      })}
    </section>
  )
}

export function PersonalWorkspace({ balance, wallets, income, expense, rows }: { balance: string; wallets: string; income: string; expense: string; rows: Array<Record<string, any>> }) {
  return (
    <div className="space-y-6">
      <WorkspaceHero eyebrow="Context · Personal" title="Personal finance cockpit" description="หน้า personal ถูกจัดใหม่ให้เป็น workspace เดียวสำหรับ balance, transaction review, wallet coverage, analytics และ AI assist โดยไม่ต้องกระโดดหลายหน้าเพื่อทำงานบน PC." accent="#8b5cf6" meta={[{ label: "Balance", value: balance, hint: "Across wallets" }, { label: "Wallets", value: wallets, hint: "Tracked accounts" }, { label: "Income vs Expense", value: `${income} / ${expense}`, hint: "This period" }]} />
      <KpiGrid items={[{ label: "Net worth", value: balance, change: "+8.4%", accent: "#8b5cf6", icon: Wallet }, { label: "Income run-rate", value: income, change: "+12%", accent: "#14b8a6", icon: DollarSign }, { label: "Expense control", value: expense, change: "-4%", accent: "#f59e0b", icon: Receipt }, { label: "Goals on track", value: "4 / 5", change: "80%", accent: "#22c55e", icon: CheckCircle2 }]} />
      <ActionBoard actions={[{ title: "Add transaction", body: "บันทึกรายรับรายจ่ายจาก keyboard ได้เร็วขึ้นผ่าน command palette และ quick create flow.", accent: "#8b5cf6", icon: Command }, { title: "Review subscriptions", body: "ดู recurring items และหาจุดลดรายจ่ายที่ AI แนะนำจาก pattern การใช้เงินจริง.", accent: "#0ea5e9", icon: CreditCard }, { title: "Open wallets", body: "ตรวจ coverage, transfers และ account health ใน layout แบบ desktop workbench.", accent: "#14b8a6", icon: Wallet }, { title: "Plan next month", body: "เชื่อม planner กับ finance เพื่อเปลี่ยน insight เป็น action ได้ทันที.", accent: "#f59e0b", icon: Sparkles }]} />
      <AnalyticsSurface title="Spending and savings trend" accent="#8b5cf6" series={[{ label: "Jan", value: 24 }, { label: "Feb", value: 28 }, { label: "Mar", value: 32 }, { label: "Apr", value: 29 }, { label: "May", value: 35 }, { label: "Jun", value: 40 }, { label: "Jul", value: 38 }, { label: "Aug", value: 44 }, { label: "Sep", value: 47 }, { label: "Oct", value: 45 }, { label: "Nov", value: 52 }, { label: "Dec", value: 58 }]} />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,.9fr)]">
        <TableSystem
          title="Transactions workbench"
          subtitle="มี search, sort และพื้นฐานสำหรับ filter พร้อมออกแบบให้แถวอ่านง่ายและเหมาะกับการไล่รายการบนจอใหญ่"
          columns={[
            { key: "date", label: "Date" },
            { key: "note", label: "Description" },
            { key: "category", label: "Category" },
            { key: "status", label: "Status", render: (row) => <span className="rounded-full px-2.5 py-1 text-xs font-bold" style={{ background: row.status === "posted" ? "rgba(34,197,94,.14)" : "rgba(245,158,11,.14)", color: row.status === "posted" ? "#22c55e" : "#f59e0b" }}>{row.status}</span> },
            { key: "amount", label: "Amount", align: "right", render: (row) => <span className="font-bold">{row.amount}</span> },
          ]}
          searchableKeys={["note", "category", "status", "date"]}
          rows={rows}
          initialSortKey="amount"
        />
        <InsightRail items={[{ title: "AI noticed cash leakage", body: "รายจ่ายหมวด subscription สูงขึ้นต่อเนื่อง 3 เดือนติด แนะนำรวม payment รอบเดียวหรือยกเลิก service ที่ใช้น้อยลง.", tone: "#8b5cf6" }, { title: "Savings window available", body: "ถ้ารักษาระดับรายจ่ายเดิมได้ อีก 27 วันจะย้ายเงินไป emergency fund เพิ่มได้โดยไม่กระทบ cash buffer.", tone: "#14b8a6" }, { title: "Next best action", body: "จัดหมวด 6 รายการล่าสุดให้ครบ แล้ว analytics และ AI assist จะให้ forecast ได้แม่นขึ้น.", tone: "#f59e0b" }]} />
      </div>
    </div>
  )
}

export function BusinessWorkspace({ revenue, profit, overdue, rows }: { revenue: string; profit: string; overdue: string; rows: Array<Record<string, any>> }) {
  return (
    <div className="space-y-6">
      <WorkspaceHero eyebrow="Context · Business" title="Business operating workspace" description="Business context ใช้ app shell เดียวกับ personal แต่เปลี่ยนข้อมูลและ workflow ให้เหมาะกับ invoice, cashflow, accounting readiness และทีมงาน โดยไม่ทำให้ mental model แตก." accent="#0ea5e9" meta={[{ label: "Revenue", value: revenue, hint: "Current month" }, { label: "Profit", value: profit, hint: "After expenses" }, { label: "Overdue", value: overdue, hint: "Needs follow-up" }]} />
      <KpiGrid items={[{ label: "Revenue", value: revenue, change: "+14%", accent: "#0ea5e9", icon: BarChart3 }, { label: "Gross margin", value: "41%", change: "+2.2%", accent: "#22c55e", icon: DollarSign }, { label: "Open invoices", value: overdue, change: "12 due", accent: "#f59e0b", icon: Receipt }, { label: "Payroll readiness", value: "Ready", change: "24 staff", accent: "#8b5cf6", icon: UsersShim }]} />
      <AnalyticsSurface title="Revenue quality and cashflow rhythm" accent="#0ea5e9" series={[{ label: "Jan", value: 30 }, { label: "Feb", value: 32 }, { label: "Mar", value: 36 }, { label: "Apr", value: 40 }, { label: "May", value: 44 }, { label: "Jun", value: 43 }, { label: "Jul", value: 46 }, { label: "Aug", value: 51 }, { label: "Sep", value: 50 }, { label: "Oct", value: 54 }, { label: "Nov", value: 58 }, { label: "Dec", value: 63 }]} rightTitle="Executive signals" />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,.9fr)]">
        <TableSystem
          title="Invoice and collection table"
          subtitle="ตารางหลักสำหรับฝ่ายการเงิน มีโครงสำหรับ status review, overdue follow-up และ export workflow"
          columns={[
            { key: "invoice", label: "Invoice" },
            { key: "customer", label: "Customer" },
            { key: "status", label: "Status", render: (row) => <span className="rounded-full px-2.5 py-1 text-xs font-bold" style={{ background: row.status === "paid" ? "rgba(34,197,94,.14)" : row.status === "overdue" ? "rgba(244,63,94,.14)" : "rgba(14,165,233,.14)", color: row.status === "paid" ? "#22c55e" : row.status === "overdue" ? "#f43f5e" : "#0ea5e9" }}>{row.status}</span> },
            { key: "owner", label: "Owner" },
            { key: "amount", label: "Amount", align: "right", render: (row) => <span className="font-bold">{row.amount}</span> },
          ]}
          searchableKeys={["invoice", "customer", "status", "owner"]}
          rows={rows}
          initialSortKey="amountRaw"
          toolbar={<><button className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm font-semibold">Add filter</button><button className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm font-semibold">Export all</button></>}
        />
        <InsightRail items={[{ title: "Collections risk", body: "มี invoice ที่เกินกำหนดเก็บเงิน 3 ใบ คิดเป็น 18% ของยอด AR ทั้งหมด ควร trigger follow-up อัตโนมัติวันนี้.", tone: "#f43f5e" }, { title: "Profit quality stable", body: "margin คงที่แม้ยอดขายเพิ่ม แปลว่าการเติบโตยังไม่ใช้ discount มากเกินไป.", tone: "#22c55e" }, { title: "Payroll close ready", body: "ข้อมูลพนักงาน active และรอบจ่ายเดือนนี้ครบพร้อม close หาก time entries ผ่านการอนุมัติทั้งหมด.", tone: "#0ea5e9" }]} />
      </div>
    </div>
  )
}

function UsersShim(props: any) { return <User {...props} /> }

export function MerchantWorkspace({ sales, orders, lowStock }: { sales: string; orders: string; lowStock: string }) {
  const categories = ["Featured", "Coffee", "Tea", "Food", "Dessert", "Retail"]
  const [selectedCategory, setSelectedCategory] = useState(categories[0])
  const [cart, setCart] = useState<Array<{ id: number; name: string; price: number; qty: number }>>([{ id: 1, name: "Yoga Mat", price: 30, qty: 1 }])
  const [query, setQuery] = useState("")
  const [latency, setLatency] = useState(38)

  const products = useMemo(() => [
    { id: 2, name: "Chicken Burger", price: 12, category: "Food" },
    { id: 3, name: "Latte", price: 6, category: "Coffee" },
    { id: 4, name: "Green Tea", price: 5, category: "Tea" },
    { id: 5, name: "Brownie", price: 7, category: "Dessert" },
    { id: 6, name: "Water Bottle", price: 14, category: "Retail" },
    { id: 7, name: "Protein Snack", price: 9, category: "Featured" },
    { id: 8, name: "Salad Bowl", price: 11, category: "Food" },
    { id: 9, name: "Espresso", price: 4, category: "Coffee" },
  ], [])

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Enter") setLatency((value) => Math.max(24, value - 1))
      if (event.key.toLowerCase() === "f") setQuery("")
      if (event.key === "Escape") setCart([])
      if (/^[1-9]$/.test(event.key)) {
        const next = products[Number(event.key) - 1]
        if (next) addToCart(next.name, next.price)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [products])

  function addToCart(name: string, price: number) {
    setCart((prev) => {
      const existing = prev.find((item) => item.name === name)
      if (existing) return prev.map((item) => item.name === name ? { ...item, qty: item.qty + 1 } : item)
      return [...prev, { id: Date.now(), name, price, qty: 1 }]
    })
    setLatency((value) => Math.max(21, value - 1))
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0)
  const filtered = products.filter((product) => (selectedCategory === "Featured" || product.category === selectedCategory) && product.name.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="space-y-6">
      <WorkspaceHero eyebrow="Context · Merchant" title="Merchant POS and store workspace" description="POS ถูกออกแบบใหม่ให้เหมาะกับ desktop counter และ touchscreen tablet พร้อมโฟลว์กดเร็ว, cart ชัด, ปุ่มใหญ่, latency feedback และ AI assist สำหรับร้านค้าจริง." accent="#fb7185" meta={[{ label: "Sales today", value: sales, hint: "Gross sales" }, { label: "Orders", value: orders, hint: "Tickets today" }, { label: "Low stock", value: lowStock, hint: "Needs reorder" }]} />
      <KpiGrid items={[{ label: "POS latency", value: `${latency}ms`, change: "Target <100ms", accent: "#22c55e", icon: Zap }, { label: "Orders today", value: orders, change: "+9%", accent: "#fb7185", icon: ShoppingCart }, { label: "Sales total", value: sales, change: "+12%", accent: "#0ea5e9", icon: DollarSign }, { label: "Low stock alerts", value: lowStock, change: "Auto reorder", accent: "#f59e0b", icon: Package }]} />
      <section className="grid gap-6 xl:grid-cols-[220px_minmax(0,1.15fr)_minmax(360px,.9fr)]">
        <aside className="glass-card rounded-[30px] p-4">
          <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--text-3)]">Sections</div>
          <div className="mt-4 grid gap-2">
            {categories.map((category) => (
              <button key={category} type="button" onClick={() => setSelectedCategory(category)} className="rounded-[18px] px-3 py-3 text-left text-sm font-semibold transition" style={selectedCategory === category ? { background: "rgba(59,130,246,.18)", color: "#60a5fa" } : { background: "var(--surface-2)", color: "var(--text)" }}>{category}</button>
            ))}
          </div>
          <div className="mt-6 rounded-[22px] border border-[var(--border)] bg-[var(--surface-2)] p-4">
            <div className="text-xs font-semibold text-[var(--text-2)]">Hotkeys</div>
            <div className="mt-2 space-y-2 text-xs leading-5 text-[var(--text-3)]">
              <div><b>1-9</b> add product</div>
              <div><b>Enter</b> faster checkout pulse</div>
              <div><b>Esc</b> clear cart</div>
              <div><b>F</b> focus product search</div>
            </div>
          </div>
        </aside>

        <div className="glass-card rounded-[30px] p-5 lg:p-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--text-3)]">POS catalog</div>
              <h3 className="mt-1 text-2xl font-black">Fast product surface</h3>
            </div>
            <div className="relative min-w-[260px]">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-3)]" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products" className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] py-2 pl-9 pr-3 text-sm outline-none" />
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((product, index) => (
              <button key={product.id} type="button" onClick={() => addToCart(product.name, product.price)} className="group rounded-[24px] border border-[var(--border)] bg-[var(--surface-2)] p-4 text-left transition hover:-translate-y-0.5 hover:border-[var(--border-strong)]">
                <div className="flex items-center justify-between gap-3">
                  <div className="rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white" style={{ background: "rgba(59,130,246,.85)" }}>#{index + 1}</div>
                  <div className="text-xs text-[var(--text-3)]">{product.category}</div>
                </div>
                <div className="mt-4 text-lg font-black tracking-tight">{product.name}</div>
                <div className="mt-1 text-sm text-[var(--text-2)]">Tap or press {index + 1} to add quickly</div>
                <div className="mt-4 text-xl font-black" style={{ color: "#60a5fa" }}>${product.price.toFixed(2)}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-[30px] p-5 lg:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--text-3)]">Cart</div>
              <h3 className="mt-1 text-2xl font-black">Checkout rail</h3>
            </div>
            <div className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: "rgba(34,197,94,.16)", color: "#22c55e" }}>{latency}ms latency</div>
          </div>
          <div className="mt-4 space-y-3">
            {cart.length ? cart.map((item) => (
              <div key={item.id} className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-2)] p-4">
                <div className="flex items-center justify-between gap-3"><div className="font-semibold">{item.name}</div><div className="text-sm font-bold">${(item.price * item.qty).toFixed(2)}</div></div>
                <div className="mt-1 text-xs text-[var(--text-3)]">Qty {item.qty} × ${item.price.toFixed(2)}</div>
              </div>
            )) : <div className="rounded-[22px] border border-dashed border-[var(--border)] px-4 py-10 text-center text-sm text-[var(--text-3)]">Cart is empty. Use the catalog or hotkeys to add products.</div>}
          </div>
          <div className="mt-5 grid gap-3 rounded-[24px] border border-[var(--border)] bg-[var(--surface-2)] p-4">
            <div className="flex items-center justify-between text-sm"><span className="text-[var(--text-3)]">Subtotal</span><span className="font-bold">${total.toFixed(2)}</span></div>
            <div className="flex items-center justify-between text-sm"><span className="text-[var(--text-3)]">Tax</span><span className="font-bold">${(total * 0.065).toFixed(2)}</span></div>
            <div className="flex items-center justify-between border-t border-[var(--border)] pt-3 text-lg font-black"><span>Total</span><span>${(total * 1.065).toFixed(2)}</span></div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button type="button" className="rounded-[20px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm font-bold">Hold order</button>
            <button type="button" className="rounded-[20px] bg-[#3b82f6] px-4 py-3 text-sm font-bold text-white">Checkout</button>
          </div>
        </div>
      </section>
      <InsightRail title="Store AI assist" items={[{ title: "Peak hour staffing", body: "ยอดคำสั่งซื้อหนาแน่นระหว่าง 11:30–13:00 ควรเพิ่มพนักงานรับออเดอร์หรือเปิด pre-batched items ในช่วงนี้.", tone: "#fb7185" }, { title: "Reorder warning", body: "มี 4 SKU ที่มีแนวโน้มหมดก่อนสุดสัปดาห์จาก velocity ปัจจุบัน แนะนำสั่งซื้อในรอบถัดไป.", tone: "#f59e0b" }, { title: "Basket growth idea", body: "จับคู่เมนูเครื่องดื่มกับของหวานในหน้า checkout เพื่อดัน average ticket จากการซื้อร่วม.", tone: "#22c55e" }]} />
    </div>
  )
}

export function AnalyticsWorkspace({ rows }: { rows: Array<Record<string, any>> }) {
  const watchRows = rows.filter((row) => row.status !== "Healthy")
  const strongestRow = [...rows].sort((a, b) => Number(b.score ?? 0) - Number(a.score ?? 0))[0]
  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.18fr)_340px]">
        <section className="rounded-[36px] border border-[var(--border)] p-6 lg:p-8" style={{ background: "radial-gradient(circle at top right, rgba(20,184,166,.16), transparent 24%), var(--card)" }}>
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#14b8a6]">Analytics center</div>
            <div className="rounded-full bg-[rgba(20,184,166,.14)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#14b8a6]">Executive cockpit</div>
          </div>
          <div className="mt-4 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div>
              <h2 className="text-3xl font-black tracking-tight lg:text-[42px]">Cross-workspace signal registry</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--text-2)] lg:text-[15px]">
                Analytics ถูกจัดใหม่ให้เป็นห้องอ่านสัญญาณของทั้ง personal, business และ merchant ในทรง cockpit เดียวกับหน้าหลักของ PayMap เพื่อให้เจ้าของระบบอ่าน trend, risk และ priority ได้จากจอเดียว
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-2)] p-4">
                  <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--text-3)]">Signals</div>
                  <div className="mt-2 text-2xl font-black">{rows.length}</div>
                  <div className="mt-1 text-xs text-[var(--text-3)]">curated metrics</div>
                </div>
                <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-2)] p-4">
                  <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--text-3)]">Needs review</div>
                  <div className="mt-2 text-2xl font-black">{watchRows.length}</div>
                  <div className="mt-1 text-xs text-[var(--text-3)]">watch or review state</div>
                </div>
                <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-2)] p-4">
                  <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--text-3)]">Top score</div>
                  <div className="mt-2 text-2xl font-black">{strongestRow?.score ?? "—"}</div>
                  <div className="mt-1 text-xs text-[var(--text-3)]">{strongestRow?.metric ?? "No signal yet"}</div>
                </div>
              </div>
            </div>
            <div className="grid gap-3">
              {rows.slice(0, 3).map((row) => (
                <div key={String(row.id)} className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-2)] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-bold">{row.metric}</div>
                    <div className="rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ background: row.status === "Healthy" ? "rgba(34,197,94,.12)" : row.status === "Watch" ? "rgba(245,158,11,.14)" : "rgba(244,63,94,.12)", color: row.status === "Healthy" ? "#22c55e" : row.status === "Watch" ? "#f59e0b" : "#f43f5e" }}>
                      {row.status}
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-[var(--text-2)]">{row.owner} · trend {row.trend}</div>
                  <div className="mt-3 text-2xl font-black">{row.score}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="glass-card rounded-[30px] p-5 lg:p-6">
          <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--text-3)]">Signal board</div>
          <div className="mt-4 grid gap-3">
            {[
              { label: "Realtime", value: "Enabled", hint: "streaming ready" },
              { label: "Forecast", value: "Strong", hint: "high confidence" },
              { label: "Anomaly window", value: "2 flags", hint: "needs follow-up" },
              { label: "Data trust", value: "Stable", hint: "source sync healthy" },
            ].map((item) => (
              <div key={item.label} className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-2)] p-4">
                <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--text-3)]">{item.label}</div>
                <div className="mt-2 text-xl font-black">{item.value}</div>
                <div className="mt-1 text-xs text-[var(--text-3)]">{item.hint}</div>
              </div>
            ))}
          </div>
        </section>
      </section>

      <KpiGrid items={[{ label: "ARR", value: "$2.4M", change: "+12.5%", accent: "#14b8a6", icon: DollarSign }, { label: "MRR growth", value: "15.2%", change: "+8.3%", accent: "#22c55e", icon: BarChart3 }, { label: "Churn watch", value: "2.1%", change: "Healthy", accent: "#0ea5e9", icon: Shield }, { label: "Anomalies", value: String(watchRows.length), change: "Actionable", accent: "#f59e0b", icon: Activity }]} />
      <AnalyticsSurface title="Growth signal dashboard" accent="#14b8a6" series={[{ label: "Jan", value: 18 }, { label: "Feb", value: 22 }, { label: "Mar", value: 25 }, { label: "Apr", value: 28 }, { label: "May", value: 31 }, { label: "Jun", value: 35 }, { label: "Jul", value: 34 }, { label: "Aug", value: 39 }, { label: "Sep", value: 43 }, { label: "Oct", value: 47 }, { label: "Nov", value: 51 }, { label: "Dec", value: 56 }]} />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,.9fr)]">
        <TableSystem title="Signal registry" subtitle="รวมตัวชี้วัดหลักที่ใช้อ่าน health ของ product, finance และ operations ในหน้าเดียว" searchableKeys={["metric", "owner", "status"]} initialSortKey="score" rows={rows} columns={[
          { key: "metric", label: "Metric" },
          { key: "owner", label: "Owner" },
          { key: "status", label: "Status" },
          { key: "trend", label: "Trend" },
          { key: "score", label: "Score", align: "right" },
        ]} />
        <div className="space-y-6">
          <section className="glass-card rounded-[30px] p-5 lg:p-6">
            <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--text-3)]">Focus queue</div>
            <div className="mt-4 space-y-3">
              {rows.slice(0, 4).map((row) => (
                <div key={`focus-${row.id}`} className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-2)] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-bold">{row.metric}</div>
                    <div className="text-sm font-black">{row.trend}</div>
                  </div>
                  <div className="mt-1 text-xs text-[var(--text-3)]">{row.owner} · score {row.score}</div>
                </div>
              ))}
            </div>
          </section>
          <InsightRail items={[{ title: "Revenue efficiency improving", body: "growth ในช่วงล่าสุดไม่ได้มาจากส่วนลดหนัก แต่เกิดจาก retention และ expansion ภายใน account เดิมมากขึ้น.", tone: "#22c55e" }, { title: "Watch acquisition spike", body: "traffic เพิ่มแรงแต่ activation โตไม่ทัน ควรตรวจ onboarding funnel เพิ่มก่อนสรุป campaign success.", tone: "#f59e0b" }, { title: "AI assist ready", body: "analytics layer มีข้อมูลเพียงพอสำหรับสรุปรายวันหรือใช้เป็นฐานให้ copilots ให้คำแนะนำเชิงธุรกิจต่อได้.", tone: "#14b8a6" }]} />
        </div>
      </div>
    </div>
  )
}

export function SettingsWorkspace() {
  return (
    <div className="space-y-6">
      <WorkspaceHero eyebrow="Settings hub" title="Workspace control and preferences" description="Settings ถูกยกใหม่เป็น hub แบบ desktop ที่แบ่งเรื่อง account, appearance, workflow, billing, security และ AI assist ชัดเจน พร้อมคำอธิบายผลกระทบทุกจุด." accent="#f59e0b" meta={[{ label: "Sections", value: "6", hint: "Core hubs" }, { label: "Appearance", value: "Synced", hint: "Desktop-first" }, { label: "Security", value: "Healthy", hint: "2 items to review" }]} />
      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {([
          ["Profile & identity", "แก้ชื่อ รูป avatar รายละเอียดธุรกิจ และข้อมูลที่ใช้บนเอกสารกับ customer touchpoints.", "#8b5cf6", User],
          ["Appearance & shell", "ธีม, accent, density, data surfaces และ desktop shell behavior ถูกคุมจาก hub เดียว.", "#0ea5e9", LayoutGrid],
          ["Billing & plans", "จัดการ package, invoice, payment method และสิทธิ์ของ workspace แต่ละ context.", "#22c55e", CreditCard],
          ["Security", "password, sign-in method, consent, audit และ policy controls สำหรับ production use.", "#f59e0b", Shield],
          ["AI assist", "กำหนดระดับการช่วยเหลือของระบบ, summaries และ action suggestions ในแต่ละ mode.", "#14b8a6", Bot],
          ["Integrations", "เชื่อม webhook, exports, และ external systems ที่จำเป็นกับการทำงานจริง.", "#fb7185", Cpu],
        ] as [string, string, string, React.ElementType][]).map(([title, body, accent, Icon]) => (
            <div key={String(title)} className="glass-card rounded-[28px] p-5 lg:p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-[20px]" style={{ background: `${accent}18`, color: accent as string }}><Icon size={20} /></div>
              <div className="mt-4 text-xl font-black tracking-tight">{title}</div>
              <p className="mt-2 text-sm leading-6 text-[var(--text-2)]">{body}</p>
              <button type="button" className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm font-semibold">Open <ArrowRight size={14} /></button>
            </div>
          ))}
      </section>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,.95fr)]">
        <TableSystem title="Settings checklist" subtitle="ใช้เป็น runbook ตรวจความพร้อมก่อนขึ้น production หรือก่อน onboard ผู้ใช้งานจริง" searchableKeys={["item", "owner", "status"]} initialSortKey="score" rows={[
          { id: 1, item: "Profile completeness", owner: "Workspace owner", status: "Ready", score: 98 },
          { id: 2, item: "Consent version", owner: "Compliance", status: "Review", score: 87 },
          { id: 3, item: "Theme & shell", owner: "Design system", status: "Ready", score: 94 },
          { id: 4, item: "Billing method", owner: "Finance", status: "Pending", score: 76 },
          { id: 5, item: "AI defaults", owner: "Operations", status: "Ready", score: 90 },
        ]} columns={[
          { key: "item", label: "Item" },
          { key: "owner", label: "Owner" },
          { key: "status", label: "Status" },
          { key: "score", label: "Score", align: "right" },
        ]} />
        <InsightRail title="Settings guidance" items={[{ title: "Keep one shell, many contexts", body: "ผู้ใช้ควรเรียนรู้ navigation เดียว แล้วเปลี่ยน context ตามงาน แทนการสลับ mode ที่หน้าตาเปลี่ยนไปทั้งระบบ.", tone: "#0ea5e9" }, { title: "Explain impact", body: "ทุก setting ที่มีผลกับการทำงานจริงควรอธิบายว่าเปลี่ยนแล้วอะไรจะเกิดขึ้น ลดความกลัวในการกดของผู้ใช้.", tone: "#f59e0b" }, { title: "Default for desktop work", body: "density, panels, tables และ right rail ควรตั้งค่าเริ่มต้นให้เหมาะกับจอ PC ซึ่งเป็นแพลตฟอร์มหลักของ PayMap v15.", tone: "#8b5cf6" }]} />
      </div>
    </div>
  )
}
