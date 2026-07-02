"use client"

import { useMemo, useState } from "react"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { COUNTRIES } from "@/lib/i18n/countries"

type TaxResponse = {
  country: string
  currency: string
  totalIncome: number
  totalDeductions: number
  taxableIncome: number
  tax: number
  effectiveRate: number
  brackets: { bracket: string; amount: number; rate: number; tax: number }[]
  deductionSummary: Record<string, number>
  suggestions: string[]
  note?: string
}

const DETAILED = ["TH","SG","MY","JP","US","GB","AU","DE"] as const

export default function TaxWorkbench() {
  const [form, setForm] = useState({
    year: String(new Date().getFullYear()),
    country: "TH",
    salaryIncome: "720000",
    otherIncome: "0",
    personalAllowance: "60000",
    spouseAllowance: "0",
    childAllowance: "0",
    parentAllowance: "0",
    ssf: "0",
    rmf: "0",
    lifeInsurance: "0",
    healthInsurance: "0",
    socialSecurity: "9000",
    donation: "0",
    homeLoanInterest: "0",
  })
  const [result, setResult] = useState<TaxResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const countryEntries = useMemo(() => Object.values(COUNTRIES).sort((a, b) => a.name.localeCompare(b.name)), [])

  async function calculate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/tax', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: Number(form.year),
          country: form.country,
          salaryIncome: Number(form.salaryIncome),
          otherIncome: Number(form.otherIncome),
          personalAllowance: Number(form.personalAllowance),
          spouseAllowance: Number(form.spouseAllowance),
          childAllowance: Number(form.childAllowance),
          parentAllowance: Number(form.parentAllowance),
          ssf: Number(form.ssf),
          rmf: Number(form.rmf),
          lifeInsurance: Number(form.lifeInsurance),
          healthInsurance: Number(form.healthInsurance),
          socialSecurity: Number(form.socialSecurity),
          donation: Number(form.donation),
          homeLoanInterest: Number(form.homeLoanInterest),
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Tax calculation failed')
      setResult(json.data)
    } catch (e: any) {
      setError(e?.message || 'Tax calculation failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_.95fr]">
      <section className="rounded-[24px] border border-[var(--border)] bg-[var(--card)] p-6">
        <div className="mb-4 text-lg font-black">Tax inputs</div>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={calculate}>
          <label className="flex flex-col gap-2 text-[13px] font-semibold text-[var(--text2)]">
            Country
            <select className="modern-input" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}>
              {countryEntries.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.name} ({c.code})</option>)}
            </select>
          </label>
          <Input label="Tax year" type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} required />
          <Input label="Salary income" type="number" value={form.salaryIncome} onChange={(e) => setForm({ ...form, salaryIncome: e.target.value })} required />
          <Input label="Other income" type="number" value={form.otherIncome} onChange={(e) => setForm({ ...form, otherIncome: e.target.value })} />
          <Input label="Personal allowance / standard deduction" type="number" value={form.personalAllowance} onChange={(e) => setForm({ ...form, personalAllowance: e.target.value })} />
          <Input label="Spouse allowance" type="number" value={form.spouseAllowance} onChange={(e) => setForm({ ...form, spouseAllowance: e.target.value })} />
          <Input label="Child allowance" type="number" value={form.childAllowance} onChange={(e) => setForm({ ...form, childAllowance: e.target.value })} />
          <Input label="Parent allowance" type="number" value={form.parentAllowance} onChange={(e) => setForm({ ...form, parentAllowance: e.target.value })} />
          <Input label="SSF / retirement fund" type="number" value={form.ssf} onChange={(e) => setForm({ ...form, ssf: e.target.value })} />
          <Input label="RMF / other retirement" type="number" value={form.rmf} onChange={(e) => setForm({ ...form, rmf: e.target.value })} />
          <Input label="Life insurance" type="number" value={form.lifeInsurance} onChange={(e) => setForm({ ...form, lifeInsurance: e.target.value })} />
          <Input label="Health insurance" type="number" value={form.healthInsurance} onChange={(e) => setForm({ ...form, healthInsurance: e.target.value })} />
          <Input label="Social security" type="number" value={form.socialSecurity} onChange={(e) => setForm({ ...form, socialSecurity: e.target.value })} />
          <Input label="Donation" type="number" value={form.donation} onChange={(e) => setForm({ ...form, donation: e.target.value })} />
          <Input label="Home loan interest" type="number" value={form.homeLoanInterest} onChange={(e) => setForm({ ...form, homeLoanInterest: e.target.value })} />
          <div className="md:col-span-2 flex items-center justify-between gap-3 pt-2">
            <div className="text-xs text-[var(--text-3)]">Detailed engines: {DETAILED.join(', ')} · Countries outside this list use estimate mode</div>
            <Button type="submit" loading={loading}>Calculate tax</Button>
          </div>
        </form>
        {error ? <div className="mt-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</div> : null}
      </section>

      <section className="rounded-[24px] border border-[var(--border)] bg-[var(--card)] p-6">
        <div className="mb-4 text-lg font-black">Result</div>
        {result ? (
          <div className="space-y-4 text-sm">
            <div className="grid gap-3 md:grid-cols-2">
              <Stat label="Country" value={`${result.country} · ${result.currency}`} />
              <Stat label="Effective rate" value={`${result.effectiveRate.toLocaleString('en-US')}%`} />
              <Stat label="Total income" value={money(result.totalIncome)} />
              <Stat label="Tax payable" value={money(result.tax)} strong />
              <Stat label="Deductions" value={money(result.totalDeductions)} />
              <Stat label="Taxable income" value={money(result.taxableIncome)} />
            </div>
            <div>
              <div className="mb-2 font-bold">Brackets</div>
              <div className="space-y-2">
                {result.brackets.map((b) => (
                  <div key={`${b.bracket}-${b.rate}`} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
                    <div className="font-semibold">{b.bracket}</div>
                    <div className="text-[var(--text-3)]">Amount {money(b.amount)} · Rate {b.rate}% · Tax {money(b.tax)}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-2 font-bold">Deduction summary</div>
              <div className="grid gap-2 md:grid-cols-2">
                {Object.entries(result.deductionSummary).map(([k,v]) => <div key={k} className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2">{k}: {money(v)}</div>)}
              </div>
            </div>
            <div>
              <div className="mb-2 font-bold">Guidance</div>
              <ul className="space-y-2 text-[var(--text-2)]">
                {result.suggestions.map((s) => <li key={s} className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2">{s}</li>)}
              </ul>
              {result.note ? <div className="mt-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-amber-200">{result.note}</div> : null}
            </div>
          </div>
        ) : <div className="text-sm text-[var(--text-3)]">ยังไม่มีผลคำนวณ</div>}
      </section>
    </div>
  )
}

function Stat({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4"><div className="text-[var(--text-3)]">{label}</div><div className={`mt-1 ${strong ? 'text-xl font-black' : 'text-lg font-bold'}`}>{value}</div></div>
}

function money(v: number) {
  return Number(v || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })
}
