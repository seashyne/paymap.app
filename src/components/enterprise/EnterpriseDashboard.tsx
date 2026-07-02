"use client"

import PreferenceDisabledBlock from "@/components/ui/PreferenceDisabledBlock"
// v1.4: Enterprise Dashboard — real data, multi-org executive view
import { useState, useEffect, useCallback } from "react"
import { Building2, Users, Clock, CheckSquare, TrendingUp, Plus, ChevronRight, Loader2, BarChart3, Star, AlertCircle } from "lucide-react"

type OrgSummary = {
  id: string; name: string; slug: string; plan: string; myRole: string;
  members: number; teams: number; employees: number;
  recentMembers: { id: string; name: string; image: string | null }[];
}

type PayrollHistory = { label: string; gross: number; net: number; headcount: number; status: string }

type OrgReport = {
  employees: number; pendingLeaves: number; pendingApprovals: number; teams: number;
  latestPayroll: { month: number; year: number; totalGross: number; totalNet: number; totalWht: number; totalSso: number; status: string } | null;
  payrollHistory: PayrollHistory[];
  teamList: { id: string; name: string }[];
}

function fmt(n: number, currency = "THB") {
  return new Intl.NumberFormat("th-TH", { style: "currency", currency, maximumFractionDigits: 0 }).format(n)
}

const MONTH_TH = ["","ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."]

export default function EnterpriseDashboard({ showCharts = true }: { showCharts?: boolean }) {
  const [orgs, setOrgs]     = useState<OrgSummary[]>([])
  const [activeOrg, setActiveOrg] = useState<OrgSummary | null>(null)
  const [report, setReport] = useState<OrgReport | null>(null)
  const [loading, setLoading]   = useState(true)
  const [repLoading, setRepLoading] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState("")
  const [newSlug, setNewSlug] = useState("")
  const [creating, setCreating] = useState(false)
  const [toast, setToast]   = useState<{ msg: string; ok: boolean } | null>(null)

  const showToast = (msg: string, ok: boolean) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3500) }

  const loadOrgs = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/enterprise/organizations")
      const data = await res.json()
      if (data.organizations) {
        setOrgs(data.organizations)
        // Use functional update to avoid stale closure on activeOrg
        setActiveOrg(prev => prev ?? (data.organizations.length > 0 ? data.organizations[0] : null))
      }
    } catch { showToast("โหลด organization ไม่สำเร็จ", false) }
    finally { setLoading(false) }
  }, [])

  const loadReport = useCallback(async (orgId: string) => {
    setRepLoading(true)
    try {
      const res = await fetch(`/api/enterprise/reports?orgId=${orgId}`)
      const data = await res.json()
      if (data.summary) setReport(data.summary)
    } catch { }
    finally { setRepLoading(false) }
  }, [])

  useEffect(() => { loadOrgs() }, [])
  useEffect(() => { if (activeOrg) loadReport(activeOrg.id) }, [activeOrg])

  const handleCreate = async () => {
    if (!newName.trim()) return
    setCreating(true)
    try {
      const res = await fetch("/api/enterprise/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, slug: newSlug || newName.toLowerCase().replace(/\s+/g,"-") }),
      })
      const data = await res.json()
      if (res.ok) {
        showToast("สร้าง Organization สำเร็จ", true)
        setShowCreate(false); setNewName(""); setNewSlug("")
        await loadOrgs()
      } else showToast(data.error || "เกิดข้อผิดพลาด", false)
    } finally { setCreating(false) }
  }

  const maxGross = Math.max(...(report?.payrollHistory.map(p => p.gross) ?? [1]))

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-xl ${toast.ok ? "bg-emerald-500" : "bg-rose-500"}`}>
          {toast.msg}
        </div>
      )}

      {/* Org Switcher */}
      <div className="glass-card rounded-[28px] p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="rounded-2xl bg-amber-500/15 p-2.5"><Star size={16} className="text-amber-400" /></div>
            <div>
              <div className="text-sm font-black">Enterprise Organizations</div>
              <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--text-3)]">{orgs.length} organization{orgs.length !== 1 ? "s" : ""}</div>
            </div>
          </div>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 rounded-xl bg-amber-500/15 px-3 py-2 text-xs font-bold text-amber-400 hover:bg-amber-500/25 transition-colors">
            <Plus size={13} /> สร้างใหม่
          </button>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-[var(--text-3)]"><Loader2 size={14} className="animate-spin" /> กำลังโหลด...</div>
        ) : orgs.length === 0 ? (
          <div className="soft-panel rounded-[20px] p-6 text-center">
            <Building2 size={32} className="mx-auto mb-3 text-[var(--text-3)]" />
            <div className="font-bold">ยังไม่มี Organization</div>
            <div className="text-sm text-[var(--text-3)] mt-1">สร้าง organization เพื่อเริ่มจัดการทีมและข้อมูลองค์กร</div>
            <button onClick={() => setShowCreate(true)}
              className="mt-4 rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-white hover:bg-amber-400 transition-colors">
              สร้าง Organization แรก
            </button>
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {orgs.map(org => (
              <button key={org.id} onClick={() => setActiveOrg(org)}
                className={`soft-panel rounded-[20px] p-4 text-left transition-all ${activeOrg?.id === org.id ? "ring-2 ring-amber-500/40" : "hover:ring-1 hover:ring-[var(--border2)]"}`}>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="font-bold text-sm">{org.name}</div>
                    <div className="text-[10px] text-[var(--text-3)] font-mono">@{org.slug}</div>
                  </div>
                  <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-400 flex-shrink-0">{org.myRole}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[["👥", org.members, "members"], ["🏷️", org.teams, "teams"], ["👤", org.employees, "staff"]].map(([icon, val, label]) => (
                    <div key={String(label)} className="rounded-xl bg-[var(--surface-2)] p-2">
                      <div className="text-lg">{icon}</div>
                      <div className="text-sm font-black">{val}</div>
                      <div className="text-[9px] text-[var(--text-3)]">{label}</div>
                    </div>
                  ))}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Active Org Report */}
      {activeOrg && (
        <>
          {repLoading ? (
            <div className="flex items-center gap-2 text-sm text-[var(--text-3)] px-2"><Loader2 size={14} className="animate-spin" /> โหลดรายงาน {activeOrg.name}...</div>
          ) : report ? (
            <>
              {/* KPI Cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { icon: Users, label: "พนักงานทั้งหมด", value: report.employees.toLocaleString(), color: "#38bdf8", unit: "คน" },
                  { icon: Clock, label: "ใบลาที่รอ", value: report.pendingLeaves.toLocaleString(), color: "#f59e0b", unit: "รายการ" },
                  { icon: CheckSquare, label: "Approval รอดำเนินการ", value: report.pendingApprovals.toLocaleString(), color: "#8b5cf6", unit: "รายการ" },
                  { icon: BarChart3, label: "ทีมงาน", value: report.teams.toLocaleString(), color: "#34d399", unit: "ทีม" },
                ].map(({ icon: Icon, label, value, color, unit }) => (
                  <div key={label} className="glass-card rounded-[24px] p-5">
                    <div className="mb-3 inline-flex rounded-2xl p-2.5" style={{ background: `${color}18` }}>
                      <Icon size={16} style={{ color }} />
                    </div>
                    <div className="text-2xl font-black">{value}</div>
                    <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--text-3)] mt-0.5">{unit}</div>
                    <div className="mt-1 text-sm text-[var(--text-2)]">{label}</div>
                  </div>
                ))}
              </div>

              {/* Latest Payroll + Chart */}
              <div className="grid gap-6 lg:grid-cols-2">
                {report.latestPayroll && (
                  <div className="glass-card rounded-[28px] p-5">
                    <div className="mb-4 flex items-center gap-2">
                      <div className="rounded-2xl bg-sky-500/15 p-2.5"><TrendingUp size={16} className="text-sky-400" /></div>
                      <div>
                        <div className="font-black text-sm">Payroll ล่าสุด</div>
                        <div className="text-[10px] text-[var(--text-3)] font-mono">
                          {MONTH_TH[report.latestPayroll.month]} {report.latestPayroll.year + 543}
                        </div>
                      </div>
                      <span className={`ml-auto text-[10px] font-mono px-2 py-0.5 rounded-lg ${
                        report.latestPayroll.status === "paid" ? "bg-emerald-500/15 text-emerald-400" :
                        report.latestPayroll.status === "approved" ? "bg-sky-500/15 text-sky-400" :
                        "bg-amber-500/15 text-amber-400"}`}>
                        {report.latestPayroll.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        ["ยอดรวม (Gross)", report.latestPayroll.totalGross, "#38bdf8"],
                        ["รับสุทธิ (Net)", report.latestPayroll.totalNet, "#34d399"],
                        ["ภาษีหัก ณ ที่จ่าย", report.latestPayroll.totalWht, "#f59e0b"],
                        ["ประกันสังคม", report.latestPayroll.totalSso, "#8b5cf6"],
                      ].map(([label, val, color]) => (
                        <div key={String(label)} className="soft-panel rounded-[18px] p-3.5">
                          <div className="text-[10px] text-[var(--text-3)] mb-1">{label}</div>
                          <div className="text-lg font-black" style={{ color: color as string }}>{fmt(val as number)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Payroll Trend Chart */}
                {showCharts && report.payrollHistory.length > 0 ? (
                  <div className="glass-card rounded-[28px] p-5">
                    <div className="mb-4 flex items-center gap-2">
                      <div className="rounded-2xl bg-violet-500/15 p-2.5"><BarChart3 size={16} className="text-violet-400" /></div>
                      <div className="font-black text-sm">แนวโน้ม Payroll 6 เดือน</div>
                    </div>
                    <div className="flex items-end gap-2 h-36">
                      {[...report.payrollHistory].reverse().map((p, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div className="w-full rounded-t-lg transition-all" style={{
                            height: `${Math.max(4, (p.gross / maxGross) * 120)}px`,
                            background: "linear-gradient(to top, #38bdf8, #8b5cf6)",
                            opacity: 0.7 + (i / report.payrollHistory.length) * 0.3,
                          }} />
                          <div className="text-[9px] text-[var(--text-3)] font-mono">{p.label}</div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 text-xs text-[var(--text-3)] text-center">ยอด Gross Salary (บาท)</div>
                  </div>
                ) : <PreferenceDisabledBlock compact title="Enterprise payroll trend chart ถูกปิด" description="หน้า executive overview ยังแสดง KPI และรายชื่องานได้ตามปกติ" />}
              </div>

              {/* Teams */}
              {report.teamList.length > 0 && (
                <div className="glass-card rounded-[28px] p-5">
                  <div className="mb-4 font-black text-sm">ทีมงานใน {activeOrg.name}</div>
                  <div className="flex flex-wrap gap-2">
                    {report.teamList.map(t => (
                      <div key={t.id} className="soft-panel rounded-xl px-3 py-2 text-sm font-medium">{t.name}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Alert for pending items */}
              {(report.pendingLeaves > 0 || report.pendingApprovals > 0) && (
                <div className="glass-card rounded-[24px] p-4 border border-amber-500/20">
                  <div className="flex items-center gap-3">
                    <AlertCircle size={16} className="text-amber-400 flex-shrink-0" />
                    <div className="text-sm">
                      มีรายการรอดำเนินการ:
                      {report.pendingLeaves > 0 && <span className="font-bold text-amber-400 ml-1">ใบลา {report.pendingLeaves} ใบ</span>}
                      {report.pendingApprovals > 0 && <span className="font-bold text-violet-400 ml-1">Approval {report.pendingApprovals} รายการ</span>}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </>
      )}

      {/* Modal: Create Org */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-card rounded-[28px] p-6 w-full max-w-sm">
            <div className="font-black mb-5">สร้าง Organization ใหม่</div>
            <div className="space-y-3">
              <input className="w-full rounded-xl bg-[var(--surface-2)] border border-[var(--border)] px-3.5 py-2.5 text-sm"
                placeholder="ชื่อองค์กร *" value={newName}
                onChange={e => { setNewName(e.target.value); if (!newSlug) setNewSlug(e.target.value.toLowerCase().replace(/\s+/g,"-")) }} />
              <input className="w-full rounded-xl bg-[var(--surface-2)] border border-[var(--border)] px-3.5 py-2.5 text-sm font-mono"
                placeholder="slug (url)" value={newSlug}
                onChange={e => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,"-"))} />
              <div className="flex gap-2">
                <button onClick={() => setShowCreate(false)}
                  className="flex-1 rounded-xl border border-[var(--border)] py-2.5 text-sm font-bold text-[var(--text-2)]">ยกเลิก</button>
                <button onClick={handleCreate} disabled={!newName.trim() || creating}
                  className="flex-1 rounded-xl bg-amber-500 py-2.5 text-sm font-bold text-white disabled:opacity-40 hover:bg-amber-400 transition-colors flex items-center justify-center gap-2">
                  {creating && <Loader2 size={13} className="animate-spin" />} สร้าง
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
