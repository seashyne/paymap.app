"use client"

import { useState } from "react"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { readApi, firstError } from "@/lib/http"
import { useToast } from "@/components/ui/Toast"

export default function ReconciliationWorkbench({ defaultOrgId = null }: { defaultOrgId?: string | null }) {
  const toast = useToast()
  const [csv, setCsv] = useState("date,description,amount,type,reference\n2026-03-01,PromptPay sale,2500,income,PP-001\n2026-03-02,Supplier payment,-1200,expense,SUP-77")
  const [statementId, setStatementId] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const [matching, setMatching] = useState(false)
  const [approving, setApproving] = useState(false)
  const [result, setResult] = useState<null | { summary?: { totalLines?: number; matched?: number; unmatchedLines?: number; matchRate?: number }; matches?: Array<{ id?: string; statementLineNo?: number; transactionId?: string; confidence?: number; deltaAmount?: number; deltaDays?: number }> }>(null)

  async function importStatement() {
    setImporting(true)
    try {
      const res = await fetch("/api/reconciliation/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv, source: "csv", sourceLabel: "Manual upload", organizationId: defaultOrgId }),
      })
      const payload = await readApi<{ statement: { id: string } }>(res)
      if (!res.ok) {
        toast.error(payload.error ?? "นำเข้า statement ไม่สำเร็จ", firstError(payload.details))
        return
      }
      const id = payload.data?.statement.id ?? null
      setStatementId(id)
      toast.success("นำเข้า statement แล้ว")
    } finally {
      setImporting(false)
    }
  }

  async function match() {
    if (!statementId) return
    setMatching(true)
    try {
      const res = await fetch("/api/reconciliation/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statementId, tolerance: 5 }),
      })
      const payload = await readApi<{ summary?: { totalLines?: number; matched?: number; unmatchedLines?: number; matchRate?: number }; matches?: Array<{ id?: string; statementLineNo?: number; transactionId?: string; confidence?: number; deltaAmount?: number; deltaDays?: number }> }>(res)
      if (!res.ok) {
        toast.error(payload.error ?? "จับคู่ไม่สำเร็จ", firstError(payload.details))
        return
      }
      setResult(payload.data ?? null)
      toast.success("สร้าง match proposal แล้ว")
    } finally {
      setMatching(false)
    }
  }

  async function approve() {
    const matchIds = (result?.matches ?? []).map((m) => m.id).filter((value): value is string => Boolean(value))
    if (!matchIds.length) {
      toast.info("ยังไม่มี match ที่อนุมัติได้")
      return
    }
    setApproving(true)
    try {
      const res = await fetch("/api/reconciliation/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchIds }),
      })
      const payload = await readApi(res)
      if (!res.ok) {
        toast.error(payload.error ?? "อนุมัติไม่สำเร็จ", firstError(payload.details))
        return
      }
      toast.success(payload.message ?? "อนุมัติแล้ว")
    } finally {
      setApproving(false)
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-6">
        <h2 className="text-xl font-black">Production reconciliation</h2>
        <p className="mt-1 text-sm text-[var(--text-3)]">นำเข้า statement เป็น CSV แล้วใช้ engine จับคู่กับธุรกรรมในระบบ จากนั้น export หรือ approve ได้</p>
        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_260px]">
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--text-2)]">Statement CSV</label>
            <textarea value={csv} onChange={(e) => setCsv(e.target.value)} className="min-h-[220px] w-full rounded-3xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm outline-none" />
          </div>
          <div className="space-y-3 rounded-3xl bg-[var(--surface-2)] p-4 text-sm text-[var(--text-3)]">
            <Input label="Statement ID" value={statementId ?? ""} readOnly placeholder="จะถูกสร้างหลัง import" />
            <Button className="w-full" onClick={importStatement} loading={importing}>1) Import statement</Button>
            <Button className="w-full" variant="outline" onClick={match} loading={matching} disabled={!statementId}>2) Run matching</Button>
            <Button className="w-full" variant="ghost" onClick={approve} loading={approving}>3) Approve matched</Button>
            {statementId && <a className="text-xs underline" href={`/api/reconciliation/export?statementId=${statementId}`}>Export reconciliation CSV</a>}
          </div>
        </div>
      </section>

      {result && (
        <section className="rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-6">
          <h3 className="text-lg font-black">Match summary</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-4 text-sm">
            <div className="rounded-2xl bg-[var(--surface-2)] p-4">Lines <div className="mt-1 text-2xl font-black">{result.summary?.totalLines ?? 0}</div></div>
            <div className="rounded-2xl bg-[var(--surface-2)] p-4">Matched <div className="mt-1 text-2xl font-black">{result.summary?.matched ?? 0}</div></div>
            <div className="rounded-2xl bg-[var(--surface-2)] p-4">Unmatched lines <div className="mt-1 text-2xl font-black">{result.summary?.unmatchedLines ?? 0}</div></div>
            <div className="rounded-2xl bg-[var(--surface-2)] p-4">Match rate <div className="mt-1 text-2xl font-black">{result.summary?.matchRate ?? 0}%</div></div>
          </div>
          <div className="mt-4 space-y-3">
            {(result.matches ?? []).map((match, index: number) => (
              <div key={`${match.transactionId}-${index}`} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm text-[var(--text-3)]">
                Line #{match.statementLineNo} → Tx {match.transactionId} · confidence {((match.confidence ?? 0) * 100).toFixed(1)}% · Δ amount {match.deltaAmount ?? 0} · Δ days {match.deltaDays ?? 0}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
