"use client"
// v24.0: Financial Simulation Client
import { useState } from "react"
import { Calculator, TrendingUp, Loader2 } from "lucide-react"
import { AreaTrendChart } from "@/components/ui/Charts"
import PreferenceDisabledBlock from "@/components/ui/PreferenceDisabledBlock"

const FMT = (n: number) => new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n)

export default function SimulationClient({ showCharts = true }: { showCharts?: boolean }) {
  const [params, setParams] = useState({ monthlySaving: 5000, years: 10, annualReturn: 5, initialAmount: 0, inflation: 3 })
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  async function simulate() {
    setLoading(true)
    try {
      const r = await fetch("/api/simulation", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(params),
      })
      const d = await r.json()
      if (d.success) setResult(d.data)
    } finally { setLoading(false) }
  }

  const chartData = (result?.timeline ?? []).map((t: any) => ({ label: `ปีที่ ${t.year}`, value: t.balance }))

  return (
    <div className="space-y-6">
      {/* Params */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 space-y-4">
        <h2 className="font-semibold flex items-center gap-2"><Calculator size={18} className="text-indigo-500"/> ตั้งค่าการจำลอง</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-500 mb-1 block">ออมเดือนละ (บาท)</label>
            <input type="number" value={params.monthlySaving}
              onChange={e => setParams(p => ({ ...p, monthlySaving: Number(e.target.value) }))}
              className="w-full border dark:border-gray-700 rounded-xl px-4 py-2.5 dark:bg-gray-800"/>
          </div>
          <div>
            <label className="text-sm text-gray-500 mb-1 block">ระยะเวลา (ปี)</label>
            <input type="number" min={1} max={50} value={params.years}
              onChange={e => setParams(p => ({ ...p, years: Number(e.target.value) }))}
              className="w-full border dark:border-gray-700 rounded-xl px-4 py-2.5 dark:bg-gray-800"/>
          </div>
          <div>
            <label className="text-sm text-gray-500 mb-1 block">เงินต้นเริ่มต้น (บาท)</label>
            <input type="number" value={params.initialAmount}
              onChange={e => setParams(p => ({ ...p, initialAmount: Number(e.target.value) }))}
              className="w-full border dark:border-gray-700 rounded-xl px-4 py-2.5 dark:bg-gray-800"/>
          </div>
          <div>
            <label className="text-sm text-gray-500 mb-1 block">ผลตอบแทนต่อปี (%)</label>
            <input type="number" step={0.1} min={0} max={30} value={params.annualReturn}
              onChange={e => setParams(p => ({ ...p, annualReturn: Number(e.target.value) }))}
              className="w-full border dark:border-gray-700 rounded-xl px-4 py-2.5 dark:bg-gray-800"/>
          </div>
          <div>
            <label className="text-sm text-gray-500 mb-1 block">อัตราเงินเฟ้อ (%)</label>
            <input type="number" step={0.1} min={0} max={20} value={params.inflation}
              onChange={e => setParams(p => ({ ...p, inflation: Number(e.target.value) }))}
              className="w-full border dark:border-gray-700 rounded-xl px-4 py-2.5 dark:bg-gray-800"/>
          </div>
        </div>

        <button onClick={simulate} disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors">
          {loading ? <><Loader2 size={18} className="animate-spin"/> กำลังคำนวณ...</> : <><Calculator size={18}/> จำลองเลย</>}
        </button>
      </div>

      {/* Results */}
      {result && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "เงินสุดท้าย",      value: FMT(result.summary.finalBalance), color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
              { label: "เงินที่ออม",        value: FMT(result.summary.totalSaved),   color: "text-blue-600",   bg: "bg-blue-50 dark:bg-blue-900/20" },
              { label: "ดอกผล",            value: FMT(result.summary.totalReturn),  color: "text-green-600",  bg: "bg-green-50 dark:bg-green-900/20" },
              { label: "มูลค่าจริง (ลดเงินเฟ้อ)", value: FMT(result.summary.realValue), color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-900/20" },
            ].map(c => (
              <div key={c.label} className={`${c.bg} rounded-2xl p-4 text-center`}>
                <p className="text-xs text-gray-500 mb-1">{c.label}</p>
                <p className={`font-bold text-sm ${c.color}`}>{c.value}</p>
              </div>
            ))}
          </div>

          {/* Milestones */}
          {result.milestones.length > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-4">
              <p className="font-semibold text-yellow-700 dark:text-yellow-400 mb-2">🏁 Milestones</p>
              <ul className="space-y-1">
                {result.milestones.map((m: string, i: number) => (
                  <li key={i} className="text-sm text-yellow-700 dark:text-yellow-300">{m}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Chart */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4">
            <p className="text-sm font-semibold mb-3 flex items-center gap-2"><TrendingUp size={16} className="text-indigo-500"/> แนวโน้มการเติบโต</p>
            {showCharts ? <AreaTrendChart data={chartData} color="#6366f1" height={180}/> : <PreferenceDisabledBlock compact title="Simulation chart ถูกปิด" />}
          </div>

          {/* Year Table */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="text-left px-4 py-3">ปีที่</th>
                    <th className="text-right px-4 py-3">ยอดสะสม</th>
                    <th className="text-right px-4 py-3">ดอกผล</th>
                    <th className="text-right px-4 py-3">มูลค่าจริง</th>
                  </tr>
                </thead>
                <tbody>
                  {result.timeline.map((t: any, i: number) => (
                    <tr key={i} className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3 font-medium">ปีที่ {t.year}</td>
                      <td className="px-4 py-3 text-right text-indigo-600 font-semibold">{FMT(t.balance)}</td>
                      <td className="px-4 py-3 text-right text-green-600">{FMT(t.totalReturn)}</td>
                      <td className="px-4 py-3 text-right text-orange-500">{FMT(t.realValue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
