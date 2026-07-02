"use client"

import { useEffect, useMemo, useState } from "react"
import { readApi } from "@/lib/http"

type AuditRow = {
  id: string
  action: string
  createdAt: string
  metadata: Record<string, unknown> | null
  user: { id: string; email: string; name: string | null } | null
}

export default function AdminAuditCenter({ initialLogs }: { initialLogs: AuditRow[] }) {
  const [logs, setLogs] = useState<AuditRow[]>(initialLogs)
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState("")
  const [action, setAction] = useState("all")
  const [message, setMessage] = useState<string | null>(null)

  const knownActions = useMemo(() => {
    const set = new Set<string>()
    logs.forEach((log) => set.add(log.action))
    return ["all", ...Array.from(set).sort()]
  }, [logs])

  async function load() {
    setLoading(true)
    setMessage(null)
    const params = new URLSearchParams()
    if (query.trim()) params.set("q", query.trim())
    if (action !== "all") params.set("action", action)
    const res = await fetch(`/api/admin/audit?${params.toString()}`, { cache: "no-store" })
    const payload = await readApi<AuditRow[]>(res)
    if (res.ok) setLogs(payload.data ?? [])
    else setMessage(payload.error ?? "โหลด audit log ไม่สำเร็จ")
    setLoading(false)
  }

  useEffect(() => {
    if (!initialLogs.length) void load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = useMemo(() => logs.filter((log) => {
    const hay = [log.action, log.user?.name, log.user?.email, JSON.stringify(log.metadata ?? {})].join(" ").toLowerCase()
    const q = query.trim().toLowerCase()
    return (!q || hay.includes(q)) && (action === "all" || log.action === action)
  }), [logs, query, action])

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["Events", filtered.length],
          ["Users", new Set(filtered.map((log) => log.user?.id).filter(Boolean)).size],
          ["Unique actions", new Set(filtered.map((log) => log.action)).size],
          ["Latest", filtered[0] ? new Date(filtered[0].createdAt).toLocaleDateString("th-TH") : "—"],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-[24px] border border-[var(--border)] bg-[var(--card)] p-5">
            <div className="text-sm text-[var(--text-3)]">{label}</div>
            <div className="mt-2 text-3xl font-black">{loading ? "…" : String(value)}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex w-full max-w-4xl flex-col gap-3 md:flex-row">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ค้นหา action, user หรือ metadata" className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm outline-none" />
          <select value={action} onChange={(e) => setAction(e.target.value)} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm outline-none">
            {knownActions.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
        <button onClick={() => void load()} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm font-semibold">Refresh</button>
      </div>

      {message ? <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--text-2)]">{message}</div> : null}

      <div className="overflow-x-auto rounded-[24px] border border-[var(--border)] bg-[var(--card)]">
        <table className="min-w-full text-sm">
          <thead className="bg-[var(--surface-2)] text-left text-[11px] uppercase tracking-[0.16em] text-[var(--text-3)]">
            <tr>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Metadata</th>
              <th className="px-4 py-3">Time</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td className="px-4 py-6 text-[var(--text-3)]" colSpan={4}>{loading ? "Loading audit logs…" : "No audit logs found."}</td></tr>
            ) : filtered.map((log) => (
              <tr key={log.id} className="border-t border-[var(--border)] align-top">
                <td className="px-4 py-3 font-semibold">{log.action}</td>
                <td className="px-4 py-3 text-[var(--text-2)]">{log.user?.name || log.user?.email || "system"}</td>
                <td className="px-4 py-3 text-xs text-[var(--text-2)]"><pre className="max-w-[520px] overflow-x-auto whitespace-pre-wrap">{JSON.stringify(log.metadata ?? {}, null, 2)}</pre></td>
                <td className="px-4 py-3 text-[var(--text-3)]">{new Date(log.createdAt).toLocaleString("th-TH")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
