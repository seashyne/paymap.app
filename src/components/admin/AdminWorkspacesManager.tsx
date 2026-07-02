"use client"

import { useEffect, useMemo, useState } from "react"
import { readApi } from "@/lib/http"

type WorkspaceRow = {
  id: string
  slug: string
  name: string
  type: "personal" | "business" | "merchant"
  status: "active" | "archived"
  createdAt: string
  owner: { id: string; email: string; name: string | null }
  _count: { members: number; subscriptions: number }
}

export default function AdminWorkspacesManager() {
  const [items, setItems] = useState<WorkspaceRow[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | WorkspaceRow["status"]>("all")
  const [message, setMessage] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const params = new URLSearchParams()
    if (query.trim()) params.set("q", query.trim())
    if (statusFilter !== "all") params.set("status", statusFilter)
    const res = await fetch(`/api/admin/workspaces?${params.toString()}`, { cache: "no-store" })
    const payload = await readApi<WorkspaceRow[]>(res)
    if (res.ok) setItems(payload.data ?? [])
    else setMessage(payload.error ?? "โหลด workspace ไม่สำเร็จ")
    setLoading(false)
  }

  useEffect(() => { void load() }, [])

  const summary = useMemo(() => items.reduce((acc, item) => {
    acc.total += 1
    acc.members += item._count.members
    acc.subscriptions += item._count.subscriptions
    if (item.status === "active") acc.active += 1
        if (item.status === "archived") acc.archived += 1
    return acc
  }, { total: 0, members: 0, subscriptions: 0, active: 0, archived: 0 }), [items])

  async function patchStatus(id: string, status: WorkspaceRow["status"]) {
    setSavingId(id)
    setMessage(null)
    const res = await fetch("/api/admin/workspaces", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    })
    const payload = await readApi<WorkspaceRow>(res)
    if (res.ok && payload.data) {
      setItems((current) => current.map((item) => item.id === id ? payload.data! : item))
      setMessage(payload.message ?? "อัปเดต workspace แล้ว")
    } else {
      setMessage(payload.error ?? "อัปเดตไม่สำเร็จ")
    }
    setSavingId(null)
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-5">
        {[
          ["Workspaces", summary.total],
          ["Active", summary.active],
                    ["Members", summary.members],
          ["Subscriptions", summary.subscriptions],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-[24px] border border-[var(--border)] bg-[var(--card)] p-5">
            <div className="text-sm text-[var(--text-3)]">{label}</div>
            <div className="mt-2 text-3xl font-black">{loading ? "…" : value}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex w-full max-w-3xl flex-col gap-3 md:flex-row">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหา workspace, owner, slug หรือ type"
            className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm outline-none"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm outline-none"
          >
            <option value="all">ทุกสถานะ</option>
            <option value="active">active</option>
                        <option value="archived">archived</option>
          </select>
        </div>
        <div className="flex gap-3">
          <button onClick={() => void load()} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm font-semibold">Refresh</button>
        </div>
      </div>

      {message ? <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--text-2)]">{message}</div> : null}

      <div className="overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--card)]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--surface-2)] text-[var(--text-2)]">
            <tr>
              <th className="px-4 py-3">Workspace</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Members</th>
              <th className="px-4 py-3">Subscriptions</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-4 py-6 text-[var(--text-3)]" colSpan={7}>Loading workspaces…</td></tr>
            ) : items.length === 0 ? (
              <tr><td className="px-4 py-6 text-[var(--text-3)]" colSpan={7}>No workspaces found.</td></tr>
            ) : items.map((item) => (
              <tr key={item.id} className="border-t border-[var(--border)] align-top">
                <td className="px-4 py-3">
                  <div className="font-semibold">{item.name}</div>
                  <div className="text-xs text-[var(--text-3)]">/{item.slug}</div>
                </td>
                <td className="px-4 py-3">
                  <div>{item.owner.name || item.owner.email}</div>
                  <div className="text-xs text-[var(--text-3)]">{item.owner.email}</div>
                </td>
                <td className="px-4 py-3 uppercase text-[var(--text-2)]">{item.type}</td>
                <td className="px-4 py-3 text-[var(--text-2)]">{item._count.members}</td>
                <td className="px-4 py-3 text-[var(--text-2)]">{item._count.subscriptions}</td>
                <td className="px-4 py-3">
                  <select value={item.status} disabled={savingId === item.id} onChange={(e) => void patchStatus(item.id, e.target.value as WorkspaceRow['status'])} className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2">
                    <option value="active">active</option>
                                        <option value="archived">archived</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-[var(--text-2)]">{new Date(item.createdAt).toLocaleString("th-TH")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
