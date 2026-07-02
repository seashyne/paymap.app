"use client"

import { useEffect, useMemo, useState } from "react"
import { firstError, readApi } from "@/lib/http"
import { useToast } from "@/components/ui/Toast"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"

type InvoiceItem = { id: string; description: string; quantity: number; unitPrice: number; taxRate: number; lineTotal: number }
type InvoicePayment = { id: string; amount: number; method: string; paidAt: string }
type Invoice = {
  id: string
  number: string
  customerName: string
  customerEmail?: string | null
  status: string
  subtotal: number
  taxAmount: number
  totalAmount: number
  balanceDue: number
  paidAmount: number
  currency: string
  dueDate?: string | null
  issuedAt?: string | null
  items: InvoiceItem[]
  payments: InvoicePayment[]
}

export default function InvoiceWorkbench() {
  const toast = useToast()
  const [items, setItems] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [payingId, setPayingId] = useState<string | null>(null)
  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [description, setรายการ] = useState("บริการที่ปรึกษา")
  const [quantity, setQuantity] = useState("1")
  const [unitPrice, setUnitPrice] = useState("1000")
  const [taxRate, setTaxRate] = useState("7")

  async function load() {
    setLoading(true)
    try {
      const res = await fetch("/api/business/invoices")
      const payload = await readApi<{ items: Invoice[] }>(res)
      if (!res.ok) {
        toast.error(payload.error ?? "โหลด invoice ไม่สำเร็จ", firstError(payload.details))
        return
      }
      setItems(payload.data?.items ?? [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const preview = useMemo(() => {
    const qty = Number(quantity || 0)
    const price = Number(unitPrice || 0)
    const rate = Number(taxRate || 0)
    const subtotal = qty * price
    const tax = subtotal * (rate / 100)
    return { subtotal, tax, total: subtotal + tax }
  }, [quantity, unitPrice, taxRate])

  async function createInvoice() {
    setCreating(true)
    try {
      const res = await fetch("/api/business/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerEmail: customerEmail || null,
          items: [{ description, quantity: Number(quantity), unitPrice: Number(unitPrice), taxRate: Number(taxRate) }],
        }),
      })
      const payload = await readApi<{ invoice: Invoice }>(res)
      if (!res.ok) {
        toast.error(payload.error ?? "สร้าง invoice ไม่สำเร็จ", firstError(payload.details))
        return
      }
      toast.success(payload.message ?? "สร้าง invoice แล้ว")
      setCustomerName("")
      setCustomerEmail("")
      await load()
    } finally {
      setCreating(false)
    }
  }

  async function sendInvoice(id: string) {
    const res = await fetch(`/api/business/invoices/${id}/send`, { method: "POST" })
    const payload = await readApi(res)
    if (!res.ok) {
      toast.error(payload.error ?? "ส่ง invoice ไม่สำเร็จ", firstError(payload.details))
      return
    }
    toast.success(payload.message ?? "เปลี่ยนสถานะแล้ว")
    await load()
  }

  async function markPaid(id: string, balanceDue: number) {
    setPayingId(id)
    try {
      const res = await fetch(`/api/business/invoices/${id}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: balanceDue, method: "bank_transfer" }),
      })
      const payload = await readApi(res)
      if (!res.ok) {
        toast.error(payload.error ?? "บันทึกรับชำระไม่สำเร็จ", firstError(payload.details))
        return
      }
      toast.success(payload.message ?? "รับชำระแล้ว")
      await load()
    } finally {
      setPayingId(null)
    }
  }

  return (
    <div className="space-y-6 min-w-0">
      <section className="min-w-0 overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black">Invoice workspace</h2>
            <p className="mt-1 text-sm text-[var(--text-3)]">สร้าง invoice, ติดตามสถานะ และบันทึกรับชำระจากหน้าเดียว</p>
          </div>
          <div className="rounded-2xl bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--text-3)]">{items.length} invoices</div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Input label="ชื่อลูกค้า" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Acme Co., Ltd." />
          <Input label="อีเมลลูกค้า" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="finance@acme.com" />
          <Input label="รายการ" value={description} onChange={(e) => setรายการ(e.target.value)} placeholder="บริการรายเดือน" />
          <div className="grid grid-cols-3 gap-3">
            <Input label="Qty" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            <Input label="ราคาต่อหน่วย" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} />
            <Input label="ภาษี %" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--text-3)]">
          <div>ยอดก่อนภาษี {preview.subtotal.toLocaleString()} · ภาษี {preview.tax.toLocaleString()} · รวม {preview.total.toLocaleString()}</div>
          <Button onClick={createInvoice} loading={creating} disabled={!customerName}>สร้าง invoice</Button>
        </div>
      </section>

      <section className="min-w-0 overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-6">
        <h3 className="text-lg font-black">รายการ invoice</h3>
        <div className="mt-4 space-y-3">
          {loading ? <div className="text-sm text-[var(--text-3)]">กำลังโหลดรายการ…</div> : items.length === 0 ? <div className="text-sm text-[var(--text-3)]">ยังไม่มี invoice ในระบบ</div> : items.map((invoice) => (
            <div key={invoice.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-black">{invoice.number} · {invoice.customerName}</div>
                  <div className="mt-1 text-sm text-[var(--text-3)]">{invoice.status.toUpperCase()} · รวม {invoice.totalAmount.toLocaleString()} · Paid {invoice.paidAmount.toLocaleString()} · Balance {invoice.balanceDue.toLocaleString()}</div>
                </div>
                <div className="flex gap-2">
                  {invoice.status === "draft" && <Button variant="outline" size="sm" onClick={() => sendInvoice(invoice.id)}>Issue</Button>}
                  {invoice.balanceDue > 0 && invoice.status !== "cancelled" && invoice.status !== "refunded" && (
                    <Button size="sm" onClick={() => markPaid(invoice.id, invoice.balanceDue)} loading={payingId === invoice.id}>Mark paid</Button>
                  )}
                </div>
              </div>
              <div className="mt-3 grid gap-2 text-sm text-[var(--text-3)]">
                {invoice.items.map((item) => (
                  <div key={item.id} className="flex justify-between gap-4 rounded-xl bg-[var(--bg)] px-3 py-2">
                    <span>{item.description} · {item.quantity} × {item.unitPrice.toLocaleString()}</span>
                    <span>{item.lineTotal.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
