"use client"
// PayMap v5.1 — Financial Statements Dashboard
// P&L · Balance Sheet · Cash Flow — in one page

import { useState, useEffect, useCallback } from "react"
import PreferenceDisabledBlock from "@/components/ui/PreferenceDisabledBlock"
import { DEFAULT_UI_PREFERENCES, mergeUiPreferences } from "@/lib/ui-preferences"
import type { DashboardTemplate } from "@/lib/ui-preferences"
import { getTemplateModuleSurface } from "@/lib/ui-template-modules"
import {
  TrendingUp, TrendingDown, Scale, Wallet, BarChart3,
  ChevronDown, ChevronRight, Download, RefreshCw, Calendar
} from "lucide-react"
import Link from "next/link"

// ── Types ────────────────────────────────────────────────────────────────────

interface AccountBalance {
  id: string; code: string; name: string; nameTH: string | null
  type: string; balance: number
}

interface PLStatement {
  period: { from: string; to: string }
  revenue:  { items: AccountBalance[]; total: number }
  expenses: { items: AccountBalance[]; total: number }
  grossProfit: number; netProfit: number; profitMargin: number
}

interface BalanceSheet {
  asOf: string
  assets:      { current: AccountBalance[]; nonCurrent: AccountBalance[]; total: number }
  liabilities: { current: AccountBalance[]; longTerm:   AccountBalance[]; total: number }
  equity:      { items: AccountBalance[];   total: number }
  balanced:    boolean
}

interface CashFlowItem  { description: string; amount: number; type: "inflow" | "outflow" }
interface CashFlowStatement {
  period: { from: string; to: string }
  operating: { items: CashFlowItem[]; total: number }
  investing:  { items: CashFlowItem[]; total: number }
  financing:  { items: CashFlowItem[]; total: number }
  netChange: number; openingBalance: number; closingBalance: number
}

type TabType = "pl" | "bs" | "cf"

// ── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", minimumFractionDigits: 2 }).format(n)

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })

function getMonthRange(offset = 0) {
  const d = new Date()
  const y = d.getFullYear(), m = d.getMonth() + offset
  const first = new Date(y, m, 1)
  const last  = new Date(y, m + 1, 0)
  return {
    from: first.toISOString().slice(0, 10),
    to:   last.toISOString().slice(0, 10),
  }
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Pill({ positive }: { positive: boolean }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600,
      padding: "2px 8px", borderRadius: 20,
      background: positive ? "var(--green-d)" : "var(--red-d)",
      color: positive ? "var(--green)" : "var(--red)",
    }}>
      {positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
      {positive ? "กำไร" : "ขาดทุน"}
    </span>
  )
}

function SectionHeader({ label, total, color = "var(--text)" }: { label: string; total: number; color?: string }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "10px 0 6px", borderBottom: "1px solid var(--border)",
      fontWeight: 700, fontSize: 13, color,
    }}>
      <span>{label}</span>
      <span>{fmt(total)}</span>
    </div>
  )
}

function AccountRow({ acc, indent = 0 }: { acc: AccountBalance; indent?: number }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "7px 0 7px", paddingLeft: 12 + indent * 12,
      borderBottom: "1px solid var(--border)", fontSize: 13,
    }}>
      <span style={{ color: "var(--text-2)" }}>
        <span style={{ color: "var(--text-3)", marginRight: 8, fontFamily: "monospace", fontSize: 11 }}>
          {acc.code}
        </span>
        {acc.nameTH ?? acc.name}
      </span>
      <span style={{
        fontWeight: 600, color: acc.balance >= 0 ? "var(--text)" : "var(--red)",
        minWidth: 110, textAlign: "right",
      }}>
        {fmt(Math.abs(acc.balance))}
        {acc.balance < 0 && <span style={{ color: "var(--red)", fontSize: 10, marginLeft: 4 }}>Dr</span>}
      </span>
    </div>
  )
}

function TotalRow({ label, amount, highlight = false }: { label: string; amount: number; highlight?: boolean }) {
  const positive = amount >= 0
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "10px 0", marginTop: 4,
      borderTop: "2px solid var(--border2)",
      fontWeight: 700, fontSize: highlight ? 15 : 13,
      background: highlight ? (positive ? "var(--green-d)" : "var(--red-d)") : "transparent",
      borderRadius: highlight ? 8 : 0, paddingLeft: highlight ? 12 : 0, paddingRight: highlight ? 12 : 0,
    }}>
      <span style={{ color: highlight ? (positive ? "var(--green)" : "var(--red)") : "var(--text)" }}>
        {label}
      </span>
      <span style={{ color: positive ? (highlight ? "var(--green)" : "var(--text)") : "var(--red)" }}>
        {fmt(amount)}
      </span>
    </div>
  )
}

// ── P&L Tab ───────────────────────────────────────────────────────────────────

function PLTab({ data, showCharts = true }: { data: PLStatement; showCharts?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* KPI Row */}
      {showCharts ? <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {[
          { label: "รายได้รวม", value: data.revenue.total, icon: <TrendingUp size={16} />, color: "var(--green)" },
          { label: "ค่าใช้จ่ายรวม", value: data.expenses.total, icon: <TrendingDown size={16} />, color: "var(--red)" },
          { label: "กำไรสุทธิ", value: data.netProfit, icon: <BarChart3 size={16} />, color: data.netProfit >= 0 ? "var(--green)" : "var(--red)" },
        ].map(k => (
          <div key={k.label} style={{
            background: "var(--card)", border: "1px solid var(--border)",
            borderRadius: 12, padding: "14px 16px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: k.color, marginBottom: 6 }}>
              {k.icon}
              <span style={{ fontSize: 11, fontWeight: 600 }}>{k.label}</span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: k.color }}>
              {fmt(k.value)}
            </div>
          </div>
        ))}
      </div> : <PreferenceDisabledBlock compact title="P&amp;L summary cards ถูกปิด" description="ตารางรายได้ ค่าใช้จ่าย และยอดรวมยังแสดงได้ตามปกติ" />}

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 13, color: "var(--text-3)" }}>Margin: </span>
        <span style={{ fontWeight: 700, color: data.profitMargin >= 0 ? "var(--green)" : "var(--red)" }}>
          {data.profitMargin.toFixed(1)}%
        </span>
        <Pill positive={data.netProfit >= 0} />
      </div>

      {/* Revenue */}
      <div>
        <SectionHeader label="รายได้ (Revenue)" total={data.revenue.total} color="var(--green)" />
        {data.revenue.items.map(acc => <AccountRow key={acc.id} acc={acc} />)}
        <TotalRow label="รายได้รวม" amount={data.revenue.total} />
      </div>

      {/* Expenses */}
      <div>
        <SectionHeader label="ค่าใช้จ่าย (Expenses)" total={data.expenses.total} color="var(--red)" />
        {data.expenses.items.map(acc => <AccountRow key={acc.id} acc={acc} />)}
        <TotalRow label="ค่าใช้จ่ายรวม" amount={data.expenses.total} />
      </div>

      <TotalRow label="กำไรขั้นต้น (Gross Profit)" amount={data.grossProfit} />
      <TotalRow label="กำไรสุทธิ (Net Profit)" amount={data.netProfit} highlight />
    </div>
  )
}

// ── Balance Sheet Tab ─────────────────────────────────────────────────────────

function BSTab({ data, showCharts = true }: { data: BalanceSheet; showCharts?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Balance indicator */}
      {showCharts ? <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 16px", borderRadius: 10,
        background: data.balanced ? "var(--green-d)" : "var(--red-d)",
        color: data.balanced ? "var(--green)" : "var(--red)",
        fontSize: 13, fontWeight: 600,
      }}>
        <Scale size={16} />
        {data.balanced ? "งบดุลสมดุล ✓" : "⚠️ งบดุลไม่สมดุล — กรุณาตรวจสอบรายการบัญชี"}
      </div> : <PreferenceDisabledBlock compact title="Balance indicator ถูกปิด" description="ตารางสินทรัพย์ หนี้สิน และทุนยังแสดงได้ตามปกติ" />}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

        {/* Assets */}
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: "var(--blue)", marginBottom: 12 }}>
            สินทรัพย์ (Assets)
          </div>
          <SectionHeader label="สินทรัพย์หมุนเวียน" total={data.assets.current.reduce((s,a)=>s+a.balance,0)} />
          {data.assets.current.map(acc => <AccountRow key={acc.id} acc={acc} indent={1} />)}

          {data.assets.nonCurrent.length > 0 && <>
            <SectionHeader label="สินทรัพย์ไม่หมุนเวียน" total={data.assets.nonCurrent.reduce((s,a)=>s+a.balance,0)} />
            {data.assets.nonCurrent.map(acc => <AccountRow key={acc.id} acc={acc} indent={1} />)}
          </>}

          <TotalRow label="สินทรัพย์รวม" amount={data.assets.total} highlight />
        </div>

        {/* Liabilities + Equity */}
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: "var(--amber)", marginBottom: 12 }}>
            หนี้สิน + ทุน (Liabilities + Equity)
          </div>
          <SectionHeader label="หนี้สินหมุนเวียน" total={data.liabilities.current.reduce((s,a)=>s+a.balance,0)} color="var(--red)" />
          {data.liabilities.current.map(acc => <AccountRow key={acc.id} acc={acc} indent={1} />)}

          {data.liabilities.longTerm.length > 0 && <>
            <SectionHeader label="หนี้สินระยะยาว" total={data.liabilities.longTerm.reduce((s,a)=>s+a.balance,0)} color="var(--red)" />
            {data.liabilities.longTerm.map(acc => <AccountRow key={acc.id} acc={acc} indent={1} />)}
          </>}

          <TotalRow label="หนี้สินรวม" amount={data.liabilities.total} />

          <div style={{ height: 16 }} />

          <SectionHeader label="ทุน (Equity)" total={data.equity.total} color="var(--primary)" />
          {data.equity.items.map(acc => <AccountRow key={acc.id} acc={acc} indent={1} />)}
          <TotalRow label="ทุนรวม" amount={data.equity.total} />

          <TotalRow
            label="หนี้สิน + ทุนรวม"
            amount={data.liabilities.total + data.equity.total}
            highlight
          />
        </div>

      </div>
    </div>
  )
}

// ── Cash Flow Tab ─────────────────────────────────────────────────────────────

function CFTab({ data, showCharts = true }: { data: CashFlowStatement; showCharts?: boolean }) {
  const sections = [
    { key: "operating", label: "กระแสเงินสดจากการดำเนินงาน", color: "var(--green)", data: data.operating },
    { key: "investing",  label: "กระแสเงินสดจากการลงทุน",    color: "var(--blue)",  data: data.investing  },
    { key: "financing",  label: "กระแสเงินสดจากการจัดหาเงิน", color: "var(--amber)", data: data.financing  },
  ]

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Summary bar */}
      {showCharts ? <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 }}>
        {[
          { label: "ยอดต้นงวด", value: data.openingBalance },
          { label: "เปลี่ยนแปลงสุทธิ", value: data.netChange },
          { label: "ยอดปลายงวด", value: data.closingBalance },
          { label: "Operating CF", value: data.operating.total },
        ].map(k => (
          <div key={k.label} style={{
            background: "var(--card)", border: "1px solid var(--border)",
            borderRadius: 10, padding: "12px 14px",
          }}>
            <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 4 }}>{k.label}</div>
            <div style={{
              fontSize: 16, fontWeight: 700,
              color: k.value >= 0 ? "var(--text)" : "var(--red)"
            }}>
              {fmt(k.value)}
            </div>
          </div>
        ))}
      </div> : <PreferenceDisabledBlock compact title="Cash flow summary cards ถูกปิด" description="รายการ cash flow และยอดสุทธิยังแสดงได้ตามปกติ" />}

      {sections.map(sec => (
        <div key={sec.key}>
          <SectionHeader label={sec.label} total={sec.data.total} color={sec.color} />
          {sec.data.items.length === 0 && (
            <div style={{ padding: "10px 0", fontSize: 12, color: "var(--text-3)" }}>ไม่มีรายการ</div>
          )}
          {sec.data.items.map((item, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "8px 0 8px 12px", borderBottom: "1px solid var(--border)", fontSize: 13,
            }}>
              <span style={{ color: "var(--text-2)" }}>{item.description}</span>
              <span style={{
                fontWeight: 600,
                color: item.type === "inflow" ? "var(--green)" : "var(--red)",
              }}>
                {item.type === "inflow" ? "+" : "-"}{fmt(Math.abs(item.amount))}
              </span>
            </div>
          ))}
          <TotalRow label={`รวม ${sec.label.split("จาก")[1] ?? ""}`} amount={sec.data.total} />
        </div>
      ))}

      <TotalRow label="เงินสดสุทธิเปลี่ยนแปลง (Net Change)" amount={data.netChange} highlight />
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function FinancialReportsPage() {
  const [tab, setTab]   = useState<TabType>("pl")
  const [range, setRange] = useState(getMonthRange(0))
  const [data, setData] = useState<{ pl?: PLStatement; bs?: BalanceSheet; cf?: CashFlowStatement }>({})
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [showCharts, setShowCharts] = useState(DEFAULT_UI_PREFERENCES.showCharts)
  const [template, setTemplate] = useState<DashboardTemplate>(DEFAULT_UI_PREFERENCES.template)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `/api/accounting/reports?type=all&from=${range.from}&to=${range.to}`,
        { cache: "no-store" }
      )
      const json = await res.json()
      if (json.success) setData(json.data)
      else setError(json.error ?? "โหลดข้อมูลไม่สำเร็จ")
    } catch {
      setError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้")
    } finally {
      setLoading(false)
    }
  }, [range])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    let cancelled = false
    fetch("/api/user/ui-preferences", { cache: "no-store" })
      .then((res) => res.ok ? res.json() : null)
      .then((json) => {
        if (!cancelled && json?.preferences) {
          const prefs = mergeUiPreferences(json.preferences)
          setShowCharts(prefs.showCharts)
          setTemplate(prefs.template)
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  const moduleSurface = getTemplateModuleSurface(template, "reportsFinancial")

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: "pl", label: "งบกำไร-ขาดทุน", icon: <TrendingUp size={14} /> },
    { id: "bs", label: "งบดุล",           icon: <Scale size={14} /> },
    { id: "cf", label: "กระแสเงินสด",    icon: <Wallet size={14} /> },
  ]

  return (
    <div style={{
      maxWidth: 960, margin: "0 auto", padding: "24px 20px",
      fontFamily: "var(--font-sans, 'DM Sans', 'Noto Sans Thai', sans-serif)",
    }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", margin: 0 }}>
            {moduleSurface.title}
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-3)", margin: "4px 0 0", maxWidth: 560 }}>
            {moduleSurface.description}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Date range */}
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "var(--card)", border: "1px solid var(--border)",
            borderRadius: 8, padding: "7px 12px", fontSize: 12,
          }}>
            <Calendar size={13} style={{ color: "var(--text-3)" }} />
            <input
              type="date" value={range.from} onChange={e => setRange(r => ({ ...r, from: e.target.value }))}
              style={{ background: "transparent", border: "none", color: "var(--text)", fontSize: 12, cursor: "pointer" }}
            />
            <span style={{ color: "var(--text-3)" }}>–</span>
            <input
              type="date" value={range.to} onChange={e => setRange(r => ({ ...r, to: e.target.value }))}
              style={{ background: "transparent", border: "none", color: "var(--text)", fontSize: 12, cursor: "pointer" }}
            />
          </div>
          {/* Quick months */}
          {[-1, 0].map(offset => {
            const r = getMonthRange(offset)
            const d = new Date(); d.setMonth(d.getMonth() + offset)
            const label = d.toLocaleDateString("th-TH", { month: "short" })
            return (
              <button key={offset} onClick={() => setRange(r)} style={{
                padding: "7px 10px", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer",
                background: range.from === r.from ? "var(--primary-soft)" : "var(--card)",
                color: range.from === r.from ? "var(--primary)" : "var(--text-3)",
                border: `1px solid ${range.from === r.from ? "var(--primary)" : "var(--border)"}`,
              }}>
                {label}
              </button>
            )
          })}
          <button onClick={load} disabled={loading} style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "7px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
            background: "var(--primary)", color: "#fff", border: "none",
            opacity: loading ? 0.6 : 1,
          }}>
            <RefreshCw size={13} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
            {loading ? "กำลังโหลด..." : "รีเฟรช"}
          </button>
        </div>
      </div>

      {/* Period label */}
      <div style={{
        fontSize: 12, color: "var(--text-3)", marginBottom: 20,
        padding: "6px 12px", background: "var(--surface-2)", borderRadius: 8, display: "inline-block"
      }}>
        งวด: {fmtDate(range.from + "T00:00:00")} — {fmtDate(range.to + "T00:00:00")}
      </div>

      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(2, minmax(0,1fr))", marginBottom: 20 }}>
        {moduleSurface.cards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.title} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--primary-soft)", color: "var(--primary)" }}><Icon size={18} /></div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{card.title}</div>
                  <div style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.12em" }}>{card.tag}</div>
                </div>
              </div>
              <div style={{ marginTop: 10, fontSize: 13, lineHeight: 1.7, color: "var(--text-2)" }}>{card.description}</div>
            </div>
          )
        })}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
        {moduleSurface.ctas.map((cta) => (
          <Link key={cta.href + cta.label} href={cta.href} style={{ display: "inline-flex", alignItems: "center", padding: "10px 14px", borderRadius: 12, background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
            {cta.label}
          </Link>
        ))}
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex", gap: 4, marginBottom: 24,
        background: "var(--card)", border: "1px solid var(--border)",
        borderRadius: 12, padding: 4,
      }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            padding: "10px 0", borderRadius: 9, fontSize: 13, fontWeight: 600,
            cursor: "pointer", transition: "all 0.15s", border: "none",
            background: tab === t.id ? "var(--primary)" : "transparent",
            color: tab === t.id ? "#fff" : "var(--text-3)",
          }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{
        background: "var(--card)", border: "1px solid var(--border)",
        borderRadius: 16, padding: "24px",
        minHeight: 320,
      }}>
        {error && (
          <div style={{
            background: "var(--red-d)", color: "var(--red)", padding: "14px 16px",
            borderRadius: 10, fontSize: 13, marginBottom: 16,
          }}>
            ⚠️ {error}
          </div>
        )}

        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-3)", fontSize: 14 }}>
            <RefreshCw size={24} style={{ animation: "spin 1s linear infinite", marginBottom: 12, display: "block", margin: "0 auto 12px" }} />
            กำลังคำนวณงบการเงิน...
          </div>
        )}

        {!loading && !error && (
          <>
            {tab === "pl" && data.pl && <PLTab data={data.pl} showCharts={showCharts} />}
            {tab === "bs" && data.bs && <BSTab data={data.bs} showCharts={showCharts} />}
            {tab === "cf" && data.cf && <CFTab data={data.cf} showCharts={showCharts} />}
            {tab === "pl" && !data.pl && <EmptyState message="ยังไม่มีข้อมูลบัญชี กรุณาตั้งค่า Chart of Accounts และบันทึกรายการก่อน" />}
            {tab === "bs" && !data.bs && <EmptyState message="ยังไม่มีข้อมูลงบดุล" />}
            {tab === "cf" && !data.cf && <EmptyState message="ยังไม่มีข้อมูลกระแสเงินสด" />}
          </>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-3)", fontSize: 14 }}>
      <BarChart3 size={40} style={{ display: "block", margin: "0 auto 12px", opacity: 0.3 }} />
      {message}
    </div>
  )
}
