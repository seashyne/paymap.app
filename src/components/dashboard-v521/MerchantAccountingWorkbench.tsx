"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { apiJson, InlineNotice, WorkbenchSection, formatMoney } from "@/shared/components/workbench/shared"

type Account = { id: string; code: string; name: string; type: string }

type VatReport = { salesBeforeVat: number; outputVat: number; purchasesBeforeVat: number; inputVat: number; netVatPayable: number }

export default function MerchantAccountingWorkbench({ storeId, accounts }: { storeId: string | null; accounts: Account[] }) {
  const router = useRouter()
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const [vat, setVat] = useState<VatReport | null>(null)
  const now = new Date()
  const [period, setPeriod] = useState({ month: String(now.getMonth() + 1), year: String(now.getFullYear()) })
  const [coaForm, setCoaForm] = useState({ code: "4000", name: "Sales Revenue", nameTH: "รายได้จากการขาย", type: "revenue" })

  async function act(key: string, fn: () => Promise<void>) {
    setLoading(key)
    setMessage(null)
    setError(null)
    try {
      await fn()
      router.refresh()
    } catch (e: any) {
      setError(e?.message || "Action failed")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
      <WorkbenchSection title="Generate VAT report" subtitle="ดึง VAT จริงตามเดือนจาก route production แล้วบันทึกลงฐานผ่าน upsert เดิมของระบบ">
        {!storeId ? <InlineNotice tone="danger">ยังไม่พบ store</InlineNotice> : (
          <div className="space-y-4">
            <div className="grid gap-4 grid-cols-2">
              <Input label="Month" type="number" min="1" max="12" value={period.month} onChange={(e) => setPeriod({ ...period, month: e.target.value })} />
              <Input label="Year" type="number" min="2020" value={period.year} onChange={(e) => setPeriod({ ...period, year: e.target.value })} />
            </div>
            <Button type="button" loading={loading === "vat"} onClick={() => {
              void act("vat", async () => {
                const res = await apiJson<{ success: boolean; data: VatReport }>(`/api/merchant/vat?storeId=${storeId}&month=${period.month}&year=${period.year}`)
                setVat(res.data)
                setMessage("สร้าง VAT report แล้ว")
              })
            }}>Generate VAT</Button>
            {vat ? (
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm space-y-1">
                <div>Sales before VAT: {formatMoney(vat.salesBeforeVat)}</div>
                <div>Output VAT: {formatMoney(vat.outputVat)}</div>
                <div>Purchases before VAT: {formatMoney(vat.purchasesBeforeVat)}</div>
                <div>Input VAT: {formatMoney(vat.inputVat)}</div>
                <div className="font-bold">Net VAT payable: {formatMoney(vat.netVatPayable)}</div>
              </div>
            ) : null}
          </div>
        )}
      </WorkbenchSection>

      <div className="space-y-6">
        <WorkbenchSection title="Merchant chart of accounts" subtitle="owner เพิ่มบัญชีรายได้/ภาษี/ต้นทุนได้จากหน้าร้านค้าโดยตรง">
          <form className="grid gap-4" onSubmit={(e) => {
            e.preventDefault()
            void act("coa", async () => {
              await apiJson("/api/accounting/ledger", { method: "POST", body: JSON.stringify(coaForm) })
              setMessage(`สร้างบัญชี ${coaForm.code} สำเร็จ`)
            })
          }}>
            <Input label="Code" value={coaForm.code} onChange={(e) => setCoaForm({ ...coaForm, code: e.target.value })} required />
            <Input label="Name" value={coaForm.name} onChange={(e) => setCoaForm({ ...coaForm, name: e.target.value })} required />
            <Input label="Name (TH)" value={coaForm.nameTH} onChange={(e) => setCoaForm({ ...coaForm, nameTH: e.target.value })} />
            <label className="flex flex-col gap-2 text-[13px] font-semibold text-[var(--text2)]">
              Type
              <select className="modern-input" value={coaForm.type} onChange={(e) => setCoaForm({ ...coaForm, type: e.target.value })}>
                <option value="asset">Asset</option>
                <option value="liability">Liability</option>
                <option value="equity">Equity</option>
                <option value="revenue">Revenue</option>
                <option value="expense">Expense</option>
              </select>
            </label>
            <Button type="submit" loading={loading === "coa"}>เพิ่มบัญชีร้านค้า</Button>
          </form>
        </WorkbenchSection>

        <WorkbenchSection title="Available accounts" subtitle="ใช้ต่อกับ journal / reports ของ merchant mode">
          <div className="space-y-2">
            {accounts.length ? accounts.slice(0, 8).map((account) => (
              <div key={account.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-3 text-sm">
                <div className="font-bold">{account.code} · {account.name}</div>
                <div className="text-[var(--text-3)]">{account.type}</div>
              </div>
            )) : <div className="text-sm text-[var(--text-3)]">ยังไม่มีบัญชี</div>}
          </div>
        </WorkbenchSection>

        {message ? <InlineNotice tone="success">{message}</InlineNotice> : null}
        {error ? <InlineNotice tone="danger">{error}</InlineNotice> : null}
      </div>
    </div>
  )
}
