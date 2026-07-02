"use client"

import { useEffect, useMemo, useState } from "react"
import { readApi } from "@/lib/http"

type OrgOption = { id: string; name: string; slug: string }
type Summary = {
  employees: number
  pendingLeaves: number
  pendingApprovals: number
  teams: number
  organizations?: number
  teamList: OrgOption[] | Array<{ id: string; name: string }>
  latestPayroll: null | { month: number; year: number; totalGross: number; totalNet: number; totalWht?: number; totalSso?: number; status: string }
  payrollHistory: Array<{ label: string; gross: number; net: number; headcount: number; status: string }>
}

export default function EnterpriseReportsClient({ organizations }: { organizations: OrgOption[] }) {
  const [selectedOrgId, setSelectedOrgId] = useState<string>(organizations[0]?.id ?? "")
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load(orgId?: string) {
    setLoading(true)
    setError(null)
    const params = new URLSearchParams()
    if (orgId) params.set("orgId", orgId)
    const url = `/api/enterprise/reports${params.toString() ? `?${params.toString()}` : ""}`
    const res = await fetch(url, { cache: "no-store" })
    const payload = await readApi<{ summary: Summary | null }>(res)
    if (res.ok) setSummary(payload.data?.summary ?? null)
    else setError(payload.error ?? "โหลดรายงานไม่สำเร็จ")
    setLoading(false)
  }

  useEffect(() => { void load() }, [])

  const stats = useMemo(() => {
    return [
      ["Employees", summary?.employees ?? 0],
      ["Pending leave", summary?.pendingLeaves ?? 0],
      ["Pending approvals", summary?.pendingApprovals ?? 0],
      ["Teams", summary?.teams ?? 0],
    ]
  }, [summary])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="text-sm text-[var(--text-3)]">Enterprise report scope</div>
          <div className="mt-1 text-xl font-black">{selectedOrgId ? "Organization drill-down" : "All organizations"}</div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <select value={selectedOrgId} onChange={(e) => setSelectedOrgId(e.target.value)} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm outline-none">
            <option value="">All organizations</option>
            {organizations.map((org) => <option key={org.id} value={org.id}>{org.name} · /{org.slug}</option>)}
          </select>
          <button onClick={() => void load(selectedOrgId || undefined)} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm font-semibold">Refresh</button>
        </div>
      </div>

      {error ? <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--text-2)]">{error}</div> : null}

      <div className="grid gap-4 md:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={String(label)} className="rounded-[24px] border border-[var(--border)] bg-[var(--card)] p-5">
            <div className="text-sm text-[var(--text-3)]">{label}</div>
            <div className="mt-2 text-3xl font-black">{loading ? "…" : Number(value).toLocaleString()}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.5fr,1fr]">
        <section className="rounded-[24px] border border-[var(--border)] bg-[var(--card)] p-5">
          <div className="text-lg font-black">Payroll trend</div>
          <div className="mt-1 text-sm text-[var(--text-3)]">6 latest payroll runs that are available to this enterprise view.</div>
          <div className="mt-4 space-y-3">
            {loading ? <div className="text-sm text-[var(--text-3)]">Loading payroll trend…</div> : summary?.payrollHistory?.length ? summary.payrollHistory.map((item) => (
              <div key={item.label} className="rounded-2xl bg-[var(--surface-2)] p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-semibold">{item.label}</div>
                    <div className="text-xs text-[var(--text-3)]">Headcount {item.headcount} · {item.status}</div>
                  </div>
                  <div className="text-right text-sm">
                    <div>Gross {item.gross.toLocaleString()}</div>
                    <div className="text-[var(--text-3)]">Net {item.net.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            )) : <div className="text-sm text-[var(--text-3)]">No payroll runs found.</div>}
          </div>
        </section>

        <section className="rounded-[24px] border border-[var(--border)] bg-[var(--card)] p-5">
          <div className="text-lg font-black">Latest payroll snapshot</div>
          <div className="mt-1 text-sm text-[var(--text-3)]">Most recent finalized or draft payroll visible to this account.</div>
          {summary?.latestPayroll ? (
            <div className="mt-4 rounded-2xl bg-[var(--surface-2)] p-4 text-sm">
              <div className="text-2xl font-black">{summary.latestPayroll.month}/{summary.latestPayroll.year}</div>
              <div className="mt-2 text-[var(--text-2)]">Gross {summary.latestPayroll.totalGross.toLocaleString()}</div>
              <div className="text-[var(--text-2)]">Net {summary.latestPayroll.totalNet.toLocaleString()}</div>
              {typeof summary.latestPayroll.totalWht === "number" ? <div className="text-[var(--text-2)]">WHT {summary.latestPayroll.totalWht.toLocaleString()}</div> : null}
              {typeof summary.latestPayroll.totalSso === "number" ? <div className="text-[var(--text-2)]">SSO {summary.latestPayroll.totalSso.toLocaleString()}</div> : null}
              <div className="mt-2 text-xs uppercase tracking-[0.16em] text-[var(--text-3)]">{summary.latestPayroll.status}</div>
            </div>
          ) : <div className="mt-4 text-sm text-[var(--text-3)]">No payroll snapshot available.</div>}

          <div className="mt-6 text-lg font-black">Teams</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {Array.isArray(summary?.teamList) && summary.teamList.length ? summary.teamList.map((team: any) => (
              <span key={team.id} className="rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1 text-xs">{team.name}</span>
            )) : <span className="text-sm text-[var(--text-3)]">No teams found.</span>}
          </div>
        </section>
      </div>
    </div>
  )
}
