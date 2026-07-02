"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { readApi } from "@/lib/http"

type Org = { id: string; name: string; slug: string; myRole: string; currency: string; members: number; teams: number; employees: number; createdAt: string }

export default function EnterpriseOverviewClient() {
  const [items, setItems] = useState<Org[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  async function load() {
    setLoading(true)
    const res = await fetch('/api/enterprise/organizations', { cache: 'no-store' })
    const payload = await readApi<{ organizations: Org[] }>(res)
    if (res.ok) setItems(payload.data?.organizations ?? [])
    setLoading(false)
  }

  useEffect(() => { void load() }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((item) => [item.name, item.slug, item.myRole].join(' ').toLowerCase().includes(q))
  }, [items, query])

  const totals = useMemo(() => filtered.reduce((acc, item) => ({ orgs: acc.orgs + 1, members: acc.members + item.members, teams: acc.teams + item.teams, employees: acc.employees + item.employees }), { orgs: 0, members: 0, teams: 0, employees: 0 }), [filtered])

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {[["Organizations", totals.orgs],["Members", totals.members],["Teams", totals.teams],["Employees", totals.employees]].map(([label, value]) => (
          <div key={String(label)} className="rounded-[24px] border border-[var(--border)] bg-[var(--card)] p-5"><div className="text-sm text-[var(--text-3)]">{label}</div><div className="mt-2 text-3xl font-black">{loading ? '…' : value}</div></div>
        ))}
      </div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ค้นหา organization หรือ slug" className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm outline-none" />
        <div className="flex gap-3"><button onClick={() => void load()} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm font-semibold">Refresh</button><Link href="/enterprise/reports" className="rounded-2xl bg-[#f59e0b] px-4 py-3 text-sm font-semibold text-white">Open reports</Link></div>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {loading ? <div className="rounded-[24px] border border-[var(--border)] bg-[var(--card)] p-6 text-sm text-[var(--text-3)]">Loading organizations…</div> : filtered.length === 0 ? <div className="rounded-[24px] border border-[var(--border)] bg-[var(--card)] p-6 text-sm text-[var(--text-3)]">ยังไม่มี organization</div> : filtered.map((org) => (
          <div key={org.id} className="rounded-[24px] border border-[var(--border)] bg-[var(--card)] p-6">
            <div className="flex items-start justify-between gap-4"><div><div className="text-xl font-black">{org.name}</div><div className="mt-1 text-sm text-[var(--text-3)]">/{org.slug} · {org.myRole} · {org.currency}</div></div><Link href={`/w/${org.slug}/dashboard`} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm font-semibold">Open</Link></div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-[var(--surface-2)] p-3">Members<br />{org.members}</div><div className="rounded-2xl bg-[var(--surface-2)] p-3">Teams<br />{org.teams}</div><div className="rounded-2xl bg-[var(--surface-2)] p-3">Employees<br />{org.employees}</div></div>
            <div className="mt-4 text-sm text-[var(--text-3)]">Created {new Date(org.createdAt).toLocaleDateString('th-TH')}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
