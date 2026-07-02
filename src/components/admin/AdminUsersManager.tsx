"use client"

import { useEffect, useMemo, useState } from "react"
import { readApi } from "@/lib/http"

type AdminUser = {
  id: string
  name: string
  email: string
  role: "user" | "admin"
  plan: "free" | "pro" | "family"
  accountMode: "personal" | "business" | "merchant"
  createdAt: string
  loginCount?: number
  _count?: { transactions: number }
}

export default function AdminUsersManager() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [message, setMessage] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/admin/users', { cache: 'no-store' })
    const payload = await readApi<AdminUser[]>(res)
    if (res.ok) setUsers(payload.data ?? [])
    setLoading(false)
  }

  useEffect(() => { void load() }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return users
    return users.filter((u) => [u.name, u.email, u.role, u.plan, u.accountMode].join(' ').toLowerCase().includes(q))
  }, [query, users])

  async function patchUser(id: string, data: Partial<Pick<AdminUser,'role'|'plan'|'accountMode'>>) {
    setSavingId(id)
    setMessage(null)
    const res = await fetch('/api/admin/users', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...data }),
    })
    const payload = await readApi<AdminUser>(res)
    if (res.ok && payload.data) {
      setUsers((current) => current.map((item) => item.id === id ? payload.data! : item))
      setMessage(payload.message ?? 'Updated user')
    } else {
      setMessage(payload.error ?? 'Update failed')
    }
    setSavingId(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ค้นหา user, email, role, mode" className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm outline-none" />
        <button onClick={() => void load()} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm font-semibold">Refresh</button>
      </div>
      {message ? <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--text-2)]">{message}</div> : null}
      <div className="overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--card)]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--surface-2)] text-[var(--text-2)]"><tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Mode</th><th className="px-4 py-3">Plan</th><th className="px-4 py-3">Usage</th><th className="px-4 py-3">Created</th></tr></thead>
          <tbody>
            {loading ? <tr><td className="px-4 py-6 text-[var(--text-3)]" colSpan={7}>Loading users…</td></tr> : filtered.length === 0 ? <tr><td className="px-4 py-6 text-[var(--text-3)]" colSpan={7}>No users found.</td></tr> : filtered.map((user) => (
              <tr key={user.id} className="border-t border-[var(--border)] align-top">
                <td className="px-4 py-3"><div className="font-semibold">{user.name}</div><div className="text-xs text-[var(--text-3)]">{user.id.slice(0, 10)}…</div></td>
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3">
                  <select value={user.role} disabled={savingId === user.id} onChange={(e) => void patchUser(user.id, { role: e.target.value as AdminUser['role'] })} className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2">
                    <option value="user">user</option><option value="admin">admin</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <select value={user.accountMode} disabled={savingId === user.id} onChange={(e) => void patchUser(user.id, { accountMode: e.target.value as AdminUser['accountMode'] })} className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2">
                    <option value="personal">personal</option><option value="business">business</option><option value="merchant">merchant</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <select value={user.plan} disabled={savingId === user.id} onChange={(e) => void patchUser(user.id, { plan: e.target.value as AdminUser['plan'] })} className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2">
                    <option value="free">free</option><option value="pro">pro</option><option value="family">family</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-[var(--text-2)]">logins {user.loginCount ?? 0}<br />transactions {user._count?.transactions ?? 0}</td>
                <td className="px-4 py-3 text-[var(--text-2)]">{new Date(user.createdAt).toLocaleString('th-TH')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
