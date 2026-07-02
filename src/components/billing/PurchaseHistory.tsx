"use client"

import { useEffect, useMemo, useState } from "react"
import { ExternalLink, Receipt, RefreshCw, CreditCard } from "lucide-react"
import { readApi, firstError } from "@/lib/http"
import { useToast } from "@/components/ui/Toast"

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

type Sub = {
  id: string
  product: string
  planTier: string
  status: string
  currentPeriodEnd?: string | null
  cancelAtPeriodEnd: boolean
  updatedAt: string
}

export default function PurchaseHistory() {
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [payments, setPayments] = useState<Payment[]>([])
  const [subscriptions, setSubscriptions] = useState<Sub[]>([])

  async function load() {
    setLoading(true)
    try {
      const res = await fetch("/api/billing/history", { cache: "no-store" })
      const payload = await readApi<{ payments: Payment[]; subscriptions: Sub[] }>(res)
      if (!res.ok) {
        toast.error(payload.error ?? "โหลดประวัติการซื้อไม่สำเร็จ", firstError(payload.details))
        return
      }
      setPayments(payload.data?.payments ?? [])
      setSubscriptions(payload.data?.subscriptions ?? [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load().catch(() => {})
  }, [])

  const paidCount = payments.filter((item) => item.status === "paid").length
  const totalPaid = useMemo(
    () => payments.filter((item) => item.status === "paid").reduce((sum, item) => sum + item.amountPaid, 0),
    [payments]
  )

  return (
    <section id="history" className="glass-card rounded-[30px] p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black">ประวัติการซื้อและใบแจ้งหนี้</h2>
          <p className="mt-1 text-sm text-[var(--text-3)]">ดูแผนปัจจุบัน ใบแจ้งหนี้ และรายการชำระที่ Stripe ซิงก์กลับเข้าระบบ</p>
        </div>
        <button
          onClick={() => load()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--text-2)]"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> รีเฟรช
        </button>
      </div>

      <div className="mb-5 grid gap-3 md:grid-cols-3">
        <MiniStat title="รายการชำระสำเร็จ" value={paidCount.toLocaleString()} />
        <MiniStat title="ยอดที่บันทึกแล้ว" value={`฿${totalPaid.toLocaleString("th-TH")}`} />
        <MiniStat title="Subscription ทั้งหมด" value={subscriptions.length.toLocaleString()} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div className="min-w-0 rounded-[24px] border border-[var(--border)] bg-[var(--surface-2)] p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold"><CreditCard size={15} /> สถานะ subscription</div>
          <div className="space-y-3">
            {loading ? (
              <div className="text-sm text-[var(--text-3)]">กำลังโหลด…</div>
            ) : subscriptions.length === 0 ? (
              <div className="text-sm text-[var(--text-3)]">ยังไม่มีประวัติ subscription</div>
            ) : subscriptions.map((sub) => (
              <div key={sub.id} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-bold capitalize">{sub.product} · {sub.planTier}</div>
                  <span className="rounded-full border border-[var(--border)] px-2.5 py-0.5 text-[11px] font-semibold uppercase text-[var(--text-3)]">{sub.status}</span>
                </div>
                <div className="mt-2 text-xs text-[var(--text-3)]">
                  {sub.currentPeriodEnd ? `รอบบิลสิ้นสุด ${new Date(sub.currentPeriodEnd).toLocaleDateString("th-TH")}` : "ยังไม่มีวันสิ้นสุดรอบบิล"}
                  {sub.cancelAtPeriodEnd ? " · จะยกเลิกเมื่อครบงวด" : ""}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="min-w-0 rounded-[24px] border border-[var(--border)] bg-[var(--surface-2)] p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold"><Receipt size={15} /> รายการชำระเงิน</div>
          <div className="space-y-3">
            {loading ? (
              <div className="text-sm text-[var(--text-3)]">กำลังโหลด…</div>
            ) : payments.length === 0 ? (
              <div className="text-sm text-[var(--text-3)]">ยังไม่มีประวัติการชำระเงินในระบบ — ทดสอบ checkout และ webhook ก่อน</div>
            ) : payments.map((payment) => (
              <div key={payment.id} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-bold">{payment.plan.toUpperCase()} · {payment.status}</div>
                    <div className="mt-1 text-xs text-[var(--text-3)] break-all">Invoice {payment.stripeInvoiceId}</div>
                    <div className="mt-2 text-xs text-[var(--text-3)]">
                      {new Date(payment.periodStart).toLocaleDateString("th-TH")} - {new Date(payment.periodEnd).toLocaleDateString("th-TH")}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-lg font-black">฿{payment.amountPaid.toLocaleString("th-TH")}</div>
                    <div className="text-xs uppercase text-[var(--text-3)]">{payment.currency}</div>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-3)]">
                  <span>บันทึกเมื่อ {new Date(payment.createdAt).toLocaleString("th-TH")}</span>
                  {payment.invoiceUrl ? (
                    <a href={payment.invoiceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] px-3 py-1.5 font-semibold text-[var(--text-2)]">
                      <ExternalLink size={12} /> เปิดใบแจ้งหนี้
                    </a>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function MiniStat({ title, value }: { title: string; value: string }) {
  return (
    <div className="soft-panel min-w-0 rounded-[22px] p-4">
      <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--text-3)]">{title}</div>
      <div className="mt-2 break-words text-lg font-black">{value}</div>
    </div>
  )
}
