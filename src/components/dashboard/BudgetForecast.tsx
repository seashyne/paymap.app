"use client"
// v1.8: Smart Budget Forecast — projected spend at end of month
import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown, AlertTriangle, Loader2, RefreshCw } from "lucide-react"

type BudgetForecast = {
  categoryId: string
  categoryName: string
  color: string
  limit: number
  spentSoFar: number
  projectedTotal: number
  remainingBudget: number
  pct: number
  projPct: number
  status: "ok" | "warning" | "over"
  histMonthlyAvg: number
}

type ForecastData = {
  period: { dayOfMonth: number; daysInMonth: number; daysLeft: number }
  current: { income: number; expense: number; balance: number }
  projected: { expense: number; balance: number; dailyRate: number }
  budgetForecasts: BudgetForecast[]
  insights: string[]
}

function fmt(n: number) {
  return "฿" + Math.round(n).toLocaleString("th-TH")
}

const STATUS_COLOR = {
  ok: "#22c55e",
  warning: "#f59e0b",
  over: "#f43f5e",
}

export default function BudgetForecast() {
  const [data, setData]     = useState<ForecastData | null>(null)
  const [loading, setLoad]  = useState(true)
  const [error, setErr]     = useState<string | null>(null)

  async function load() {
    setLoad(true); setErr(null)
    try {
      const res = await fetch("/api/ai/forecast")
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "โหลดไม่สำเร็จ")
      setData(json.data)
    } catch (e: any) {
      setErr(e.message)
    } finally {
      setLoad(false)
    }
  }

  useEffect(() => { load() }, [])

  if (loading) return (
    <div className="glass-card flex items-center justify-center rounded-[28px] p-8">
      <Loader2 size={20} className="animate-spin text-[var(--text-3)]" />
    </div>
  )

  if (error || !data) return (
    <div className="glass-card rounded-[28px] p-6 text-center">
      <p className="text-sm text-rose-400">{error ?? "ไม่มีข้อมูล"}</p>
      <button onClick={load} className="mt-2 text-xs text-[var(--text-3)] underline">ลองใหม่</button>
    </div>
  )

  const { period, current, projected, budgetForecasts, insights } = data
  const projBalance = projected.balance
  const projPositive = projBalance >= 0
  const warnCount = budgetForecasts.filter(f => f.status !== "ok").length

  return (
    <div className="glass-card rounded-[28px] p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-violet-500/15">
            <TrendingUp size={16} className="text-violet-400" />
          </div>
          <div>
            <div className="text-sm font-black">Budget Forecast</div>
            <div className="text-xs text-[var(--text-3)]">
              วันที่ {period.dayOfMonth}/{period.daysInMonth} · เหลืออีก {period.daysLeft} วัน
            </div>
          </div>
        </div>
        <button onClick={load} className="rounded-xl p-1.5 text-[var(--text-3)] transition-colors hover:bg-[var(--surface2)]">
          <RefreshCw size={13} />
        </button>
      </div>

      {/* Summary row */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="soft-panel rounded-2xl p-3">
          <div className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-3)]">ใช้ไปแล้ว</div>
          <div className="mt-1 text-base font-black">{fmt(current.expense)}</div>
          <div className="text-xs text-[var(--text-3)]">{fmt(projected.dailyRate)}/วัน</div>
        </div>
        <div className={`soft-panel rounded-2xl p-3 ${projPositive ? "border-emerald-500/20" : "border-rose-500/20"}`}>
          <div className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-3)]">คาดสิ้นเดือน</div>
          <div className={`mt-1 text-base font-black ${projPositive ? "text-emerald-400" : "text-rose-400"}`}>
            {projPositive ? "+" : ""}{fmt(projBalance)}
          </div>
          <div className="text-xs text-[var(--text-3)]">รายจ่าย ~{fmt(projected.expense)}</div>
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="mb-4 space-y-2">
          {insights.map((ins, i) => (
            <div key={i} className="rounded-2xl bg-[var(--surface2)] px-3 py-2 text-xs text-[var(--text-2)]">
              {ins}
            </div>
          ))}
        </div>
      )}

      {/* Budget forecast bars */}
      {budgetForecasts.length > 0 ? (
        <div className="space-y-3">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-3)]">
            การคาดการณ์ตาม Budget {warnCount > 0 && <span className="text-amber-400">({warnCount} รายการน่าจับตา)</span>}
          </div>
          {budgetForecasts.map(f => (
            <div key={f.categoryId}>
              <div className="mb-1 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {f.status !== "ok" && <AlertTriangle size={10} style={{ color: STATUS_COLOR[f.status] }} />}
                  <span className="text-xs font-semibold">{f.categoryName}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-[var(--text-3)]">
                    {fmt(f.spentSoFar)} → ~{fmt(f.projectedTotal)} / {fmt(f.limit)}
                  </span>
                </div>
              </div>
              {/* Dual bar: actual (solid) + forecast (dashed) */}
              <div className="relative h-1.5 overflow-hidden rounded-full bg-[var(--surface2)]">
                {/* Actual spent */}
                <div
                  className="absolute left-0 top-0 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(f.pct, 100)}%`, background: f.color }}
                />
                {/* Forecast overlay */}
                <div
                  className="absolute left-0 top-0 h-full rounded-full opacity-30"
                  style={{
                    width: `${Math.min(f.projPct, 100)}%`,
                    background: STATUS_COLOR[f.status],
                  }}
                />
              </div>
              {f.projPct > 100 && (
                <div className="mt-0.5 text-[9px]" style={{ color: STATUS_COLOR[f.status] }}>
                  คาดว่าจะเกิน {f.projPct - 100}%
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-xs text-[var(--text-3)]">ตั้ง budget เพื่อดู forecast</p>
      )}
    </div>
  )
}
