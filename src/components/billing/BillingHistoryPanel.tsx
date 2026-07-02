"use client"

import { useEffect, useState } from "react"
import { readApi } from "@/lib/http"

type Payment = {
  id: string
  stripeInvoiceId: string
  amountPaid: number
  currency: string
  status: string
  plan: string
  periodStart: string
  periodEnd: string
  invoiceUrl?: string | null
  createdAt: string
}

type Subscription = {
  id: string
  product: string
  planTier: string
  status: string
  currentPeriodEnd?: string | null
  cancelAtPeriodEnd: boolean
  updatedAt: string
}

export default function BillingHistoryPanel() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    const res = await fetch("/api/billing/history", { cache: "no-store" })
    const payload = await readApi<{ payments: Payment[]; subscriptions: Subscription[] }>(res)
    if (res.ok) {
      setPayments(payload.data?.payments ?? [])
      setSubscriptions(payload.data?.subscriptions ?? [])
    } else {
      setError(payload.error ?? "โหลด billing history ไม่สำเร็จ")
    }
    setLoading(false)
  }

  useEffect(() => { void load() }, [])

  return (
    <div id="history" className="grid gap-4 xl:grid-cols-[1.1fr,0.9fr]">
      <section className="glass-card rounded-[30px] p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black">Invoice and payment history</h2>
            <p className="mt-1 text-sm text-[var(--text-3)]">ดูประวัติการชำระเงินและใบแจ้งหนี้ล่าสุดของ account นี้</p>
          </div>
          <button onClick={() => void load()} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm font-semibold">Refresh</button>
        </div>
        {error ? <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--text-2)]">{error}</div> : null}
        <div className="overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--card)]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--surface-2)] text-[var(--text-2)]">
              <tr>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td className="px-4 py-6 text-[var(--text-3)]" colSpan={5}>Loading billing history…</td></tr> : payments.length === 0 ? <tr><td className="px-4 py-6 text-[var(--text-3)]" colSpan={5}>ยังไม่มีประวัติการชำระเงิน</td></tr> : payments.map((payment) => (
                <tr key={payment.id} className="border-t border-[var(--border)]">
                  <td className="px-4 py-3 font-semibold">{payment.plan}</td>
                  <td className="px-4 py-3">{payment.amountPaid.toLocaleString()} {payment.currency.toUpperCase()}</td>
                  <td className="px-4 py-3 text-[var(--text-2)]">{payment.status}</td>
                  <td className="px-4 py-3 text-[var(--text-2)]">{new Date(payment.createdAt).toLocaleDateString("th-TH")}</td>
                  <td className="px-4 py-3">{payment.invoiceUrl ? <a href={payment.invoiceUrl} target="_blank" rel="noreferrer" className="font-semibold text-sky-400">Open</a> : <span className="text-[var(--text-3)]">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="glass-card rounded-[30px] p-6">
        <h2 className="text-xl font-black">Subscription state</h2>
        <p className="mt-1 text-sm text-[var(--text-3)]">เช็กผลิตภัณฑ์ที่ active และวันหมดอายุของแผนที่ใช้งาน</p>
        <div className="mt-4 space-y-3">
          {loading ? <div className="text-sm text-[var(--text-3)]">Loading subscriptions…</div> : subscriptions.length === 0 ? <div className="text-sm text-[var(--text-3)]">ยังไม่มี subscription record</div> : subscriptions.map((sub) => (
            <div key={sub.id} className="rounded-2xl bg-[var(--surface-2)] p-4 text-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold">{sub.product}</div>
                  <div className="text-[var(--text-3)]">{sub.planTier}</div>
                </div>
                <div className="rounded-full border border-[var(--border)] px-3 py-1 text-xs uppercase tracking-[0.16em] text-[var(--text-2)]">{sub.status}</div>
              </div>
              <div className="mt-3 text-[var(--text-2)]">Updated {new Date(sub.updatedAt).toLocaleDateString("th-TH")}</div>
              {sub.currentPeriodEnd ? <div className="text-[var(--text-2)]">Ends {new Date(sub.currentPeriodEnd).toLocaleDateString("th-TH")}</div> : null}
              {sub.cancelAtPeriodEnd ? <div className="mt-2 text-xs text-amber-300">This plan will cancel at the end of the current period.</div> : null}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
