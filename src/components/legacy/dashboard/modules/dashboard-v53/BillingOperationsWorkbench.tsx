"use client"

import { useEffect, useState } from "react"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { readApi, firstError } from "@/lib/http"
import { useToast } from "@/components/ui/Toast"

type Sub = {
  id: string
  name: string
  amount: number
  currency: string
  billingCycle: string
  nextBillingAt: string
  status: string
  cancelAtPeriodEnd: boolean
  endedAt?: string | null
}

export default function BillingOperationsWorkbench() {
  const toast = useToast()
  const [items, setItems] = useState<Sub[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState("PayMap Cloud")
  const [amount, setAmount] = useState("299")
  const [billingCycle, setBillingCycle] = useState("monthly")
  const [nextBillingAt, setNextBillingAt] = useState(() => new Date(Date.now() + 86400000 * 30).toISOString().slice(0, 10))

  async function load() {
    setLoading(true)
    try {
      const res = await fetch("/api/subscriptions")
      const payload = await readApi<{ subscriptions: Sub[] }>(res)
      if (!res.ok) {
        toast.error(payload.error ?? "โหลด subscriptions ไม่สำเร็จ", firstError(payload.details))
        return
      }
      setItems(payload.data?.subscriptions ?? [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function createSubscription() {
    setSaving(true)
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, amount: Number(amount), billingCycle, nextBillingAt }),
      })
      const payload = await readApi(res)
      if (!res.ok) {
        toast.error(payload.error ?? "สร้าง subscription ไม่สำเร็จ", firstError(payload.details))
        return
      }
      toast.success(payload.message ?? "สร้าง subscription แล้ว")
      await load()
    } finally {
      setSaving(false)
    }
  }

  async function act(id: string, action: "pause" | "resume" | "cancel") {
    const res = await fetch(`/api/subscriptions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    })
    const payload = await readApi(res)
    if (!res.ok) {
      toast.error(payload.error ?? "อัปเดต subscription ไม่สำเร็จ", firstError(payload.details))
      return
    }
    toast.success(payload.message ?? `ดำเนินการ ${action} แล้ว`)
    await load()
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black">Subscription lifecycle hardening</h2>
            <p className="mt-1 text-sm text-[var(--text-3)]">สร้าง recurring charge ภายในระบบและทดสอบ pause/resume/cancel แบบไม่ต้องลบ record</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <div>
            <label className="mb-2 block text-[13px] font-semibold text-[var(--text2)]">Cycle</label>
            <select className="modern-input" value={billingCycle} onChange={(e) => setBillingCycle(e.target.value)}>
              <option value="monthly">monthly</option>
              <option value="yearly">yearly</option>
              <option value="quarterly">quarterly</option>
            </select>
          </div>
          <Input label="Next billing" type="date" value={nextBillingAt} onChange={(e) => setNextBillingAt(e.target.value)} />
        </div>
        <div className="mt-4"><Button onClick={createSubscription} loading={saving}>Create recurring subscription</Button></div>
      </section>

      <section className="rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-6">
        <h3 className="text-lg font-black">Subscription registry</h3>
        <div className="mt-4 space-y-3">
          {loading ? <div className="text-sm text-[var(--text-3)]">กำลังโหลด…</div> : items.length === 0 ? <div className="text-sm text-[var(--text-3)]">ยังไม่มี recurring subscription</div> : items.map((sub) => (
            <div key={sub.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
              <div>
                <div className="font-black">{sub.name}</div>
                <div className="mt-1 text-sm text-[var(--text-3)]">{sub.amount.toLocaleString()} {sub.currency} / {sub.billingCycle} · next {new Date(sub.nextBillingAt).toLocaleDateString("th-TH")} · {sub.status}</div>
              </div>
              <div className="flex flex-wrap gap-2">
                {sub.status === "active" && <Button size="sm" variant="ghost" onClick={() => act(sub.id, "pause")}>Pause</Button>}
                {sub.status !== "active" && sub.status !== "expired" && <Button size="sm" variant="outline" onClick={() => act(sub.id, "resume")}>Resume</Button>}
                {sub.status !== "cancelled" && sub.status !== "expired" && <Button size="sm" variant="danger" onClick={() => act(sub.id, "cancel")}>Cancel</Button>}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
