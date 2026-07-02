"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { apiJson, InlineNotice, WorkbenchSection, formatMoney } from "@/shared/components/workbench/shared"

type Account = { id: string; code: string; name: string; type: string }
type TrialItem = { accountId?: string; code: string; name: string; debit: number; credit: number }

export default function BusinessAccountingWorkbench({ accounts }: { accounts: Account[] }) {
  const router = useRouter()
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const [trial, setTrial] = useState<{ accounts: TrialItem[]; totalDebit: number; totalCredit: number; balanced: boolean } | null>(null)

  const [coaForm, setCoaForm] = useState({ code: "1000", name: "Cash", nameTH: "เงินสด", type: "asset" })
  const [journalForm, setJournalForm] = useState({
    description: "Manual adjustment",
    sourceType: "manual",
    debitAccountId: accounts[0]?.id ?? "",
    creditAccountId: accounts[1]?.id ?? accounts[0]?.id ?? "",
    amount: "1000",
  })

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
    <div className="grid gap-6 xl:grid-cols-[1.05fr_.95fr]">
      <div className="space-y-6">
        <WorkbenchSection title="Create chart of account" subtitle="เปิดทางให้ owner เพิ่มบัญชีเองโดยไม่ต้องยิง API ผ่าน Postman แล้ว">
          <form className="grid gap-4 md:grid-cols-2" onSubmit={(e) => {
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
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" loading={loading === "coa"}>เพิ่มบัญชี</Button>
            </div>
          </form>
        </WorkbenchSection>

        <WorkbenchSection title="Post manual journal" subtitle="ทดลอง posting จริงเข้าระบบบัญชีด้วยเดบิต/เครดิต 2 บรรทัดแบบพื้นฐาน">
          {accounts.length < 2 ? (
            <InlineNotice tone="neutral">ต้องมีอย่างน้อย 2 บัญชีก่อน จึงจะ post journal แบบ manual ได้</InlineNotice>
          ) : (
            <form className="grid gap-4" onSubmit={(e) => {
              e.preventDefault()
              void act("journal", async () => {
                await apiJson("/api/accounting/journal", {
                  method: "POST",
                  body: JSON.stringify({
                    description: journalForm.description,
                    sourceType: journalForm.sourceType,
                    lines: [
                      { accountId: journalForm.debitAccountId, side: "debit", amount: Number(journalForm.amount) },
                      { accountId: journalForm.creditAccountId, side: "credit", amount: Number(journalForm.amount) },
                    ],
                  }),
                })
                setMessage("โพสต์ journal สำเร็จ")
              })
            }}>
              <Input label="Description" value={journalForm.description} onChange={(e) => setJournalForm({ ...journalForm, description: e.target.value })} required />
              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-2 text-[13px] font-semibold text-[var(--text2)]">
                  Debit account
                  <select className="modern-input" value={journalForm.debitAccountId} onChange={(e) => setJournalForm({ ...journalForm, debitAccountId: e.target.value })}>
                    {accounts.map((account) => <option key={account.id} value={account.id}>{account.code} · {account.name}</option>)}
                  </select>
                </label>
                <label className="flex flex-col gap-2 text-[13px] font-semibold text-[var(--text2)]">
                  Credit account
                  <select className="modern-input" value={journalForm.creditAccountId} onChange={(e) => setJournalForm({ ...journalForm, creditAccountId: e.target.value })}>
                    {accounts.map((account) => <option key={account.id} value={account.id}>{account.code} · {account.name}</option>)}
                  </select>
                </label>
              </div>
              <Input label="Amount" type="number" min="0.01" step="0.01" value={journalForm.amount} onChange={(e) => setJournalForm({ ...journalForm, amount: e.target.value })} required />
              <Button type="submit" loading={loading === "journal"}>Post journal</Button>
            </form>
          )}
        </WorkbenchSection>
      </div>

      <div className="space-y-6">
        <WorkbenchSection title="Trial balance" subtitle="กดดึงยอด trial balance จริงจาก ledger engine แล้วตรวจความสมดุลได้จากหน้าเดียว">
          <div className="flex justify-between gap-3">
            <Button type="button" variant="outline" loading={loading === "trial"} onClick={() => {
              void act("trial", async () => {
                const res = await apiJson<{ success: boolean; data: { accounts: TrialItem[]; totalDebit: number; totalCredit: number; balanced: boolean } }>("/api/accounting/ledger?trial=1")
                setTrial(res.data)
                setMessage("อัปเดต trial balance แล้ว")
              })
            }}>Load trial balance</Button>
          </div>

          {trial ? (
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm">
                <div>Total debit: {formatMoney(trial.totalDebit)}</div>
                <div>Total credit: {formatMoney(trial.totalCredit)}</div>
                <div className={trial.balanced ? "text-emerald-300" : "text-rose-300"}>{trial.balanced ? "Balanced" : "Unbalanced"}</div>
              </div>
              <div className="space-y-2">
                {trial.accounts.slice(0, 8).map((item) => (
                  <div key={`${item.code}-${item.name}`} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-3 text-sm">
                    <div className="font-bold">{item.code} · {item.name}</div>
                    <div className="text-[var(--text-3)]">Debit {formatMoney(item.debit)} · Credit {formatMoney(item.credit)}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : <div className="mt-4 text-sm text-[var(--text-3)]">ยังไม่ได้โหลด trial balance</div>}
        </WorkbenchSection>

        <WorkbenchSection title="Account list" subtitle="บัญชีที่มีอยู่จริงในระบบและพร้อมใช้สำหรับ journal, ledger, reports">
          <div className="space-y-2">
            {accounts.length ? accounts.map((account) => (
              <div key={account.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-3 text-sm">
                <div className="font-bold">{account.code} · {account.name}</div>
                <div className="text-[var(--text-3)]">{account.type}</div>
              </div>
            )) : <div className="text-sm text-[var(--text-3)]">ยังไม่มี chart of accounts</div>}
          </div>
        </WorkbenchSection>

        {message ? <InlineNotice tone="success">{message}</InlineNotice> : null}
        {error ? <InlineNotice tone="danger">{error}</InlineNotice> : null}
      </div>
    </div>
  )
}
