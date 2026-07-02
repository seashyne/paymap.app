"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import {
  Activity, AlertCircle, BarChart3, Building2, CheckCircle2,
  CreditCard, Database, FileText, Loader2, RefreshCw,
  Shield, ShoppingCart, TrendingUp, Users, Wallet, XCircle,
} from "lucide-react"

type AdminStats = {
  generatedAt: string
  db: "ok" | "error"
  users: {
    total: number; new30d: number; new7d: number
    active30d: number; active7d: number; active1d: number
    byPlan: Record<string, number>
    byMode: Record<string, number>
    byRole: Record<string, number>
  }
  workspace: { total: number; orgs: number }
  content: { transactions: number; wallets: number; payroll: number; invoices: number; salesOrders: number }
  billing: { activeSubs: number; totalSubs: number }
  audit: { total: number; recent: Array<{ id: string; action: string; createdAt: string; user: { email: string; name: string } | null }> }
}

type HealthData = { status: string; services?: { database: { status: string; latency: number }; redis: { status: string; latency: number } } }

function Num({ n, loading }: { n: number | undefined; loading: boolean }) {
  if (loading) return <span className="text-[var(--text-3)]">…</span>
  return <>{(n ?? 0).toLocaleString("th-TH")}</>
}

function StatusDot({ ok }: { ok: boolean }) {
  return ok ? <CheckCircle2 size={14} className="text-emerald-400" /> : <XCircle size={14} className="text-rose-400" />
}

const PLAN_COLORS: Record<string, string> = { free: "#64748b", pro: "#8b5cf6", family: "#ec4899", sme: "#0ea5e9", scale: "#14b8a6", enterprise: "#f59e0b", starter: "#f97316", growth: "#22c55e" }
const MODE_COLORS: Record<string, string> = { personal: "#8b5cf6", business: "#0ea5e9", merchant: "#f43f5e" }

export default function AdminOverviewClient() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [health, setHealth] = useState<HealthData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true)
    try {
      const [sRes, hRes] = await Promise.all([fetch("/api/admin/stats"), fetch("/api/health")])
      const [sData, hData] = await Promise.all([sRes.json(), hRes.json()])
      if (sData.ok) setStats(sData.data)
      setHealth(hData)
      setLastRefresh(new Date())
    } catch { }
    finally { setLoading(false); setRefreshing(false) }
  }, [])

  useEffect(() => { void load() }, [load])

  const L = loading
  const s = stats
  const dbOk = health?.services?.database?.status === "ok"
  const redisOk = health?.services?.redis?.status === "ok"
  const systemOk = health?.status === "ok"

  return (
    <div className="space-y-6">

      {/* Top bar */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-[var(--text-3)] mt-0.5">
            {lastRefresh ? `อัปเดต ${lastRefresh.toLocaleTimeString("th-TH")}` : "กำลังโหลด…"}
          </p>
        </div>
        <button onClick={() => void load(true)} disabled={refreshing || loading}
          className="flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2.5 text-sm font-semibold transition hover:bg-[var(--surface-3)] disabled:opacity-50">
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* System health */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Overall", icon: Activity, ok: systemOk, value: systemOk ? "Healthy" : "Degraded", sub: `DB ${health?.services?.database?.latency ?? "—"}ms` },
          { label: "Database (Neon)", icon: Database, ok: dbOk, value: dbOk ? "Connected" : "Error", sub: `${health?.services?.database?.latency ?? "—"}ms` },
          { label: "Redis / Cache", icon: Activity, ok: redisOk, value: redisOk ? "Connected" : "Fallback", sub: redisOk ? `${health?.services?.redis?.latency ?? "—"}ms` : "In-memory mode" },
        ].map(({ label, icon: Icon, ok, value, sub }) => (
          <div key={label} className="glass-card rounded-[20px] p-4 flex items-center gap-4">
            <div className={`rounded-2xl p-3 ${ok ? "bg-emerald-500/10" : "bg-rose-500/10"}`}>
              <Icon size={18} className={ok ? "text-emerald-400" : "text-rose-400"} />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--text-3)]">{label}</div>
              <div className="flex items-center gap-1.5 mt-0.5"><StatusDot ok={ok} /><span className="font-bold text-sm">{value}</span></div>
              <div className="text-xs text-[var(--text-3)] mt-0.5">{sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* User KPIs */}
      <div>
        <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--text-3)] mb-3">ผู้ใช้งาน</div>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 xl:grid-cols-6">
          {[
            { label: "ผู้ใช้ทั้งหมด", v: s?.users.total, color: "#8b5cf6", icon: Users },
            { label: "สมัครใหม่ 30 วัน", v: s?.users.new30d, color: "#0ea5e9", icon: TrendingUp },
            { label: "สมัครใหม่ 7 วัน", v: s?.users.new7d, color: "#14b8a6", icon: TrendingUp },
            { label: "Active วันนี้", v: s?.users.active1d, color: "#22c55e", icon: Activity },
            { label: "Active 7 วัน", v: s?.users.active7d, color: "#f59e0b", icon: Activity },
            { label: "Active 30 วัน", v: s?.users.active30d, color: "#f97316", icon: Activity },
          ].map(({ label, v, color, icon: Icon }) => (
            <div key={label} className="glass-card rounded-[20px] p-4">
              <div className="rounded-xl p-2 w-fit mb-3" style={{ background: `${color}18` }}>
                <Icon size={14} style={{ color }} />
              </div>
              <div className="text-2xl font-black"><Num n={v} loading={L} /></div>
              <div className="text-[10px] text-[var(--text-3)] mt-1 leading-4">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main grid */}
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">

          {/* Plan distribution */}
          <div className="glass-card rounded-[24px] p-5">
            <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--text-3)] mb-4">แผนการใช้งาน</div>
            {L ? <div className="text-sm text-[var(--text-3)]">Loading…</div> : (
              <div className="space-y-3">
                {Object.entries(s?.users.byPlan ?? {}).sort((a, b) => b[1] - a[1]).map(([plan, count]) => {
                  const pct = s?.users.total ? Math.round((count / s.users.total) * 100) : 0
                  const color = PLAN_COLORS[plan] ?? "#64748b"
                  return (
                    <div key={plan} className="flex items-center gap-3">
                      <div className="w-20 text-xs font-mono capitalize text-[var(--text-2)] flex-shrink-0">{plan}</div>
                      <div className="flex-1 h-2 rounded-full bg-[var(--surface-3)] overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.max(pct, 1)}%`, background: color }} />
                      </div>
                      <div className="w-12 text-right text-xs font-black">{count.toLocaleString()}</div>
                      <div className="w-8 text-right text-xs text-[var(--text-3)]">{pct}%</div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Mode + Content stats */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="glass-card rounded-[24px] p-5">
              <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--text-3)] mb-4">Workspace mode</div>
              <div className="space-y-3">
                {Object.entries(s?.users.byMode ?? {}).map(([mode, count]) => {
                  const pct = s?.users.total ? Math.round((count / s.users.total) * 100) : 0
                  const color = MODE_COLORS[mode] ?? "#64748b"
                  return (
                    <div key={mode} className="flex items-center gap-3">
                      <div className="w-20 text-xs font-mono capitalize text-[var(--text-2)] flex-shrink-0">{mode}</div>
                      <div className="flex-1 h-2 rounded-full bg-[var(--surface-3)] overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${Math.max(pct,1)}%`, background: color }} />
                      </div>
                      <div className="text-xs font-black w-8 text-right">{count}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="glass-card rounded-[24px] p-5">
              <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--text-3)] mb-4">Content stats</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Transactions", v: s?.content.transactions, icon: Activity },
                  { label: "Wallets", v: s?.content.wallets, icon: Wallet },
                  { label: "Invoices", v: s?.content.invoices, icon: FileText },
                  { label: "Sales orders", v: s?.content.salesOrders, icon: ShoppingCart },
                  { label: "Payroll runs", v: s?.content.payroll, icon: CreditCard },
                  { label: "Organizations", v: s?.workspace.orgs, icon: Building2 },
                ].map(({ label, v, icon: Icon }) => (
                  <div key={label} className="rounded-2xl bg-[var(--surface-2)] p-3">
                    <Icon size={12} className="text-[var(--text-3)] mb-1.5" />
                    <div className="text-lg font-black"><Num n={v} loading={L} /></div>
                    <div className="text-[10px] text-[var(--text-3)] mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick nav */}
          <div className="grid gap-3 sm:grid-cols-4">
            {[
              { href: "/admin/users", label: "Users", desc: "จัดการ role, plan", icon: Users, color: "#8b5cf6" },
              { href: "/admin/workspaces", label: "Workspaces", desc: "ดู tenant, owner", icon: Building2, color: "#0ea5e9" },
              { href: "/admin/audit", label: "Audit log", desc: "กิจกรรม & incident", icon: Shield, color: "#f59e0b" },
              { href: "/admin/saas", label: "SaaS metrics", desc: "Billing & growth", icon: BarChart3, color: "#22c55e" },
            ].map(({ href, label, desc, icon: Icon, color }) => (
              <Link key={href} href={href} className="glass-card rounded-[20px] p-4 transition hover:border-[var(--border-strong)] group">
                <div className="rounded-2xl p-2.5 w-fit mb-3" style={{ background: `${color}18` }}>
                  <Icon size={16} style={{ color }} />
                </div>
                <div className="font-bold text-sm group-hover:underline">{label}</div>
                <div className="text-xs text-[var(--text-3)] mt-0.5">{desc}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">

          {/* Billing */}
          <div className="glass-card rounded-[24px] p-5">
            <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--text-3)] mb-4">Billing</div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="rounded-2xl bg-[var(--surface-2)] p-4 text-center">
                <div className="text-2xl font-black text-emerald-400"><Num n={s?.billing.activeSubs} loading={L} /></div>
                <div className="text-xs text-[var(--text-3)] mt-1">Active subs</div>
              </div>
              <div className="rounded-2xl bg-[var(--surface-2)] p-4 text-center">
                <div className="text-2xl font-black"><Num n={s?.billing.totalSubs} loading={L} /></div>
                <div className="text-xs text-[var(--text-3)] mt-1">Total subs</div>
              </div>
            </div>
            <div className="rounded-2xl bg-[var(--surface-2)] p-3 flex items-center justify-between">
              <span className="text-xs text-[var(--text-3)]">Conversion rate</span>
              <span className="text-sm font-black">
                {L || !s ? "…" : s.billing.totalSubs > 0 ? `${Math.round((s.billing.activeSubs / s.billing.totalSubs) * 100)}%` : "—"}
              </span>
            </div>
          </div>

          {/* Audit feed */}
          <div className="glass-card rounded-[24px] p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--text-3)]">Audit feed</div>
              <Link href="/admin/audit" className="text-xs text-[var(--primary)] font-semibold hover:underline">ดูทั้งหมด →</Link>
            </div>
            {L ? (
              <div className="flex items-center gap-2 text-sm text-[var(--text-3)]"><Loader2 size={13} className="animate-spin" /> Loading…</div>
            ) : !s?.audit.recent.length ? (
              <div className="text-sm text-[var(--text-3)]">ยังไม่มี audit events</div>
            ) : (
              <div className="space-y-2">
                {s.audit.recent.map((log) => (
                  <div key={log.id} className="rounded-2xl bg-[var(--surface-2)] px-3 py-2.5">
                    <div className="text-xs font-mono text-[var(--primary)] truncate">{log.action}</div>
                    <div className="text-[10px] text-[var(--text-3)] mt-0.5 truncate">
                      {log.user?.email ?? "system"} · {new Date(log.createdAt).toLocaleString("th-TH", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Role breakdown */}
          <div className="glass-card rounded-[24px] p-5">
            <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--text-3)] mb-3">Role breakdown</div>
            <div className="space-y-2">
              {L ? <div className="text-sm text-[var(--text-3)]">Loading…</div> : Object.entries(s?.users.byRole ?? {}).map(([role, count]) => (
                <div key={role} className="flex items-center justify-between rounded-2xl bg-[var(--surface-2)] px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={12} className={role === "admin" ? "text-rose-400" : "text-[var(--text-3)]"} />
                    <span className="text-sm font-mono capitalize">{role}</span>
                  </div>
                  <span className="text-sm font-black">{count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
