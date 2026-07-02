"use client"

import { useEffect, useMemo, useState } from "react"
import { firstError, readApi } from "@/lib/http"
import { useToast } from "@/components/ui/Toast"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"

type Customer = {
  id: string
  customerCode?: string | null
  name: string
  contactName?: string | null
  email?: string | null
  phone?: string | null
  taxId?: string | null
  branchName?: string | null
  branchCode?: string | null
  address?: string | null
  paymentTerms?: number | null
  currency: string
  note?: string | null
  isActive: boolean
  invoiceCount: number
  quotationCount: number
  updatedAt: string
}

type CustomerSummary = {
  count: number
  active: number
  contactable: number
}

const emptyForm = {
  customerCode: "",
  name: "",
  contactName: "",
  email: "",
  phone: "",
  taxId: "",
  branchName: "",
  branchCode: "",
  address: "",
  paymentTerms: "30",
  currency: "THB",
  note: "",
}

export default function CustomerWorkbench() {
  const toast = useToast()
  const [items, setItems] = useState<Customer[]>([])
  const [summary, setSummary] = useState<CustomerSummary>({ count: 0, active: 0, contactable: 0 })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [archivingId, setArchivingId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)

  const selected = useMemo(
    () => items.find((customer) => customer.id === selectedId) ?? null,
    [items, selectedId],
  )

  async function load() {
    setLoading(true)
    try {
      const res = await fetch("/api/business/customers")
      const payload = await readApi<{ items: Customer[]; summary: CustomerSummary }>(res)
      if (!res.ok) {
        toast.error(payload.error ?? "โหลด customer master ไม่สำเร็จ", firstError(payload.details))
        return
      }
      setItems(payload.data?.items ?? [])
      setSummary(payload.data?.summary ?? { count: 0, active: 0, contactable: 0 })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  useEffect(() => {
    if (!selected) {
      setForm(emptyForm)
      return
    }
    setForm({
      customerCode: selected.customerCode ?? "",
      name: selected.name ?? "",
      contactName: selected.contactName ?? "",
      email: selected.email ?? "",
      phone: selected.phone ?? "",
      taxId: selected.taxId ?? "",
      branchName: selected.branchName ?? "",
      branchCode: selected.branchCode ?? "",
      address: selected.address ?? "",
      paymentTerms: String(selected.paymentTerms ?? 30),
      currency: selected.currency ?? "THB",
      note: selected.note ?? "",
    })
  }, [selected])

  function updateField<K extends keyof typeof emptyForm>(key: K, value: string) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function saveCustomer() {
    setSaving(true)
    try {
      const body = {
        customerCode: form.customerCode || null,
        name: form.name,
        contactName: form.contactName || null,
        email: form.email || null,
        phone: form.phone || null,
        taxId: form.taxId || null,
        branchName: form.branchName || null,
        branchCode: form.branchCode || null,
        address: form.address || null,
        paymentTerms: Number(form.paymentTerms || 30),
        currency: form.currency || "THB",
        note: form.note || null,
      }

      const endpoint = selected ? `/api/business/customers/${selected.id}` : "/api/business/customers"
      const method = selected ? "PATCH" : "POST"
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const payload = await readApi<{ customer: Customer }>(res)
      if (!res.ok) {
        toast.error(payload.error ?? "บันทึกข้อมูลลูกค้าไม่สำเร็จ", firstError(payload.details))
        return
      }
      toast.success(payload.message ?? "บันทึกข้อมูลลูกค้าสำเร็จ")
      setSelectedId(null)
      setForm(emptyForm)
      await load()
    } finally {
      setSaving(false)
    }
  }

  async function archiveCustomer(customer: Customer) {
    setArchivingId(customer.id)
    try {
      const res = await fetch(`/api/business/customers/${customer.id}`, { method: "DELETE" })
      const payload = await readApi(res)
      if (!res.ok) {
        toast.error(payload.error ?? "เก็บถาวรลูกค้าไม่สำเร็จ", firstError(payload.details))
        return
      }
      toast.success(payload.message ?? "เก็บถาวรลูกค้าแล้ว")
      if (selectedId === customer.id) {
        setSelectedId(null)
        setForm(emptyForm)
      }
      await load()
    } finally {
      setArchivingId(null)
    }
  }

  return (
    <div className="space-y-6 min-w-0">
      <section className="min-w-0 overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-6">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-black">Customer master</h2>
            <p className="mt-1 text-sm text-[var(--text-3)]">รวม registry ลูกค้า ข้อมูลติดต่อ เงื่อนไขการชำระ และฐานข้อมูลสำหรับ invoice ไว้ในจุดเดียว</p>
          </div>
          <div className="grid min-w-[220px] grid-cols-3 gap-2 text-center text-sm">
            <div className="rounded-2xl bg-[var(--surface-2)] px-3 py-3"><div className="font-black">{summary.count}</div><div className="text-[var(--text-3)]">ทั้งหมด</div></div>
            <div className="rounded-2xl bg-[var(--surface-2)] px-3 py-3"><div className="font-black">{summary.active}</div><div className="text-[var(--text-3)]">Active</div></div>
            <div className="rounded-2xl bg-[var(--surface-2)] px-3 py-3"><div className="font-black">{summary.contactable}</div><div className="text-[var(--text-3)]">Contactable</div></div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Input label="รหัสลูกค้า" value={form.customerCode} onChange={(e) => updateField("customerCode", e.target.value)} placeholder="CUST-0001" />
          <Input label="ชื่อลูกค้า / บริษัท" value={form.name} onChange={(e) => updateField("name", e.target.value)} placeholder="Acme Co., Ltd." />
          <Input label="ผู้ติดต่อ" value={form.contactName} onChange={(e) => updateField("contactName", e.target.value)} placeholder="คุณเมย์" />
          <Input label="อีเมล" type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} placeholder="finance@acme.com" />
          <Input label="เบอร์โทร" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder="081-234-5678" />
          <Input label="เลขผู้เสียภาษี" value={form.taxId} onChange={(e) => updateField("taxId", e.target.value)} placeholder="010555..." />
          <Input label="สาขา" value={form.branchName} onChange={(e) => updateField("branchName", e.target.value)} placeholder="สำนักงานใหญ่" />
          <Input label="รหัสสาขา" value={form.branchCode} onChange={(e) => updateField("branchCode", e.target.value)} placeholder="00000" />
          <Input label="เครดิตเทอม (วัน)" type="number" value={form.paymentTerms} onChange={(e) => updateField("paymentTerms", e.target.value)} />
          <Input label="สกุลเงิน" value={form.currency} onChange={(e) => updateField("currency", e.target.value.toUpperCase())} />
        </div>

        <div className="mt-4 grid gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-[13px] font-semibold text-[var(--text2)]">ที่อยู่</span>
            <textarea
              className="modern-input min-h-[92px] resize-y"
              value={form.address}
              onChange={(e) => updateField("address", e.target.value)}
              placeholder="ที่อยู่สำหรับออกใบแจ้งหนี้ / เอกสารภาษี"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[13px] font-semibold text-[var(--text2)]">หมายเหตุ</span>
            <textarea
              className="modern-input min-h-[72px] resize-y"
              value={form.note}
              onChange={(e) => updateField("note", e.target.value)}
              placeholder="เช่น ลูกค้าต้องการ PO ก่อนวางบิล หรือใช้ credit term 45 วัน"
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--text-3)]">
          <div>{selected ? `กำลังแก้ไข ${selected.name}` : "เพิ่มลูกค้าใหม่เพื่อให้ invoice และ AR ใช้ข้อมูลชุดเดียวกัน"}</div>
          <div className="flex flex-wrap gap-2">
            {selected ? <Button variant="ghost" onClick={() => { setSelectedId(null); setForm(emptyForm) }}>สร้างรายการใหม่</Button> : null}
            <Button onClick={saveCustomer} loading={saving} disabled={!form.name.trim()}>{selected ? "อัปเดตลูกค้า" : "เพิ่มลูกค้า"}</Button>
          </div>
        </div>
      </section>

      <section className="min-w-0 overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-lg font-black">ทะเบียนลูกค้า</h3>
          <div className="text-sm text-[var(--text-3)]">พร้อมเชื่อมต่อกับ invoice registry</div>
        </div>
        <div className="space-y-3">
          {loading ? <div className="text-sm text-[var(--text-3)]">กำลังโหลด customer master…</div> : items.length === 0 ? <div className="text-sm text-[var(--text-3)]">ยังไม่มีลูกค้าในระบบ</div> : items.map((customer) => (
            <div key={customer.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="font-black">{customer.name}</div>
                    {customer.customerCode ? <span className="rounded-full bg-[var(--bg)] px-2 py-1 text-xs text-[var(--text-3)]">{customer.customerCode}</span> : null}
                    {!customer.isActive ? <span className="rounded-full bg-rose-500/10 px-2 py-1 text-xs text-rose-300">Archived</span> : null}
                  </div>
                  <div className="mt-1 text-sm text-[var(--text-3)]">
                    {[customer.contactName, customer.email, customer.phone].filter(Boolean).join(" · ") || "ยังไม่มีข้อมูลติดต่อครบ"}
                  </div>
                  <div className="mt-2 text-xs text-[var(--text-3)]">
                    Invoice {customer.invoiceCount} · Quotation {customer.quotationCount} · Terms {customer.paymentTerms ?? 30} วัน
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => setSelectedId(customer.id)}>แก้ไข</Button>
                  <Button variant="danger" size="sm" onClick={() => archiveCustomer(customer)} loading={archivingId === customer.id} disabled={!customer.isActive}>เก็บถาวร</Button>
                </div>
              </div>
              {customer.address ? <div className="mt-3 rounded-xl bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text-3)]">{customer.address}</div> : null}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
