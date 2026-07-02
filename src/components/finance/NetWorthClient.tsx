"use client"
// v24.0: Net Worth Client UI
import { useEffect, useState, useCallback } from "react"
import { Plus, TrendingUp, TrendingDown, Minus, RefreshCw, X, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/Toast"
import { AreaTrendChart } from "@/components/ui/Charts"
import PreferenceDisabledBlock from "@/components/ui/PreferenceDisabledBlock"

type Asset     = { id: string; name: string; type: string; value: number; currency: string; icon: string; color: string }
type Liability = { id: string; name: string; type: string; amount: number; currency: string; icon: string; color: string }
type Snapshot  = { snapshotAt: string; netWorth: number; totalAssets: number; totalDebt: number }

const ASSET_TYPES     = ["cash","stock","crypto","property","vehicle","fund","other"]
const LIABILITY_TYPES = ["credit_card","mortgage","car_loan","personal_loan","other"]
const ASSET_LABELS: Record<string, string>     = { cash:"เงินสด",stock:"หุ้น",crypto:"Crypto",property:"บ้าน/ที่ดิน",vehicle:"รถยนต์",fund:"กองทุน",other:"อื่นๆ" }
const LIABILITY_LABELS: Record<string, string> = { credit_card:"บัตรเครดิต",mortgage:"ผ่อนบ้าน",car_loan:"ผ่อนรถ",personal_loan:"สินเชื่อส่วนบุคคล",other:"หนี้อื่นๆ" }

const FMT = (n: number) => new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", minimumFractionDigits: 0 }).format(n)

export default function NetWorthClient({ showCharts = true }: { showCharts?: boolean }) {
  const { showToast } = useToast()
  const [data, setData]   = useState<{ assets: Asset[]; liabilities: Liability[]; summary: any; history: Snapshot[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"assets"|"liabilities">("assets")
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: "", type: "cash", value: "", currency: "THB", icon: "🏠", note: "" })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await fetch("/api/networth")
      const d = await r.json()
      if (d.success) setData(d.data)
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  async function addItem() {
    if (!form.name || !form.value) return showToast("กรุณากรอกข้อมูลให้ครบ", "error")
    const isLiability = activeTab === "liabilities"
    const body = isLiability
      ? { name: form.name, type: form.type, amount: Number(form.value), currency: form.currency }
      : { name: form.name, type: form.type, value: Number(form.value), currency: form.currency, icon: form.icon }
    const r = await fetch(`/api/networth?kind=${isLiability ? "liability" : "asset"}`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    })
    const d = await r.json()
    if (d.success) { showToast(d.message, "success"); setShowAdd(false); load() }
    else showToast(d.error, "error")
  }

  async function deleteItem(id: string, kind: "asset"|"liability") {
    if (!confirm("ต้องการลบรายการนี้?")) return
    await fetch(`/api/networth?kind=${kind}&id=${id}`, { method: "DELETE" })
    load()
  }

  const historyData = (data?.history ?? []).map(s => ({
    label: new Date(s.snapshotAt).toLocaleDateString("th-TH", { month: "short", year: "2-digit" }),
    value: s.netWorth,
  }))

  if (loading) return <div className="flex justify-center py-12"><RefreshCw className="animate-spin text-green-500" size={28}/></div>

  const summary = data?.summary ?? { totalAssets: 0, totalDebt: 0, netWorth: 0 }

  return (
    <div className="space-y-6">
      {/* Net Worth Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">ทรัพย์สิน</p>
          <p className="text-lg font-bold text-green-600">{FMT(summary.totalAssets)}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">หนี้สิน</p>
          <p className="text-lg font-bold text-red-500">{FMT(summary.totalDebt)}</p>
        </div>
        <div className={`${summary.netWorth >= 0 ? "bg-blue-50 dark:bg-blue-900/20" : "bg-orange-50 dark:bg-orange-900/20"} rounded-2xl p-4 text-center`}>
          <p className="text-xs text-gray-500 mb-1">Net Worth</p>
          <p className={`text-lg font-bold ${summary.netWorth >= 0 ? "text-blue-600" : "text-orange-500"}`}>{FMT(summary.netWorth)}</p>
        </div>
      </div>

      {/* History Chart */}
      {historyData.length > 1 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
          <p className="text-sm font-semibold mb-3">แนวโน้ม Net Worth</p>
          {showCharts ? <AreaTrendChart data={historyData} color="#22c55e" height={140}/> : <PreferenceDisabledBlock compact title="Net Worth chart ถูกปิด" />}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setActiveTab("assets")}
          className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-colors ${activeTab === "assets" ? "bg-green-600 text-white" : "bg-gray-100 dark:bg-gray-800"}`}>
          ทรัพย์สิน ({data?.assets.length ?? 0})
        </button>
        <button onClick={() => setActiveTab("liabilities")}
          className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-colors ${activeTab === "liabilities" ? "bg-red-500 text-white" : "bg-gray-100 dark:bg-gray-800"}`}>
          หนี้สิน ({data?.liabilities.length ?? 0})
        </button>
      </div>

      <button onClick={() => setShowAdd(true)} className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 dark:border-gray-700 py-3 rounded-xl text-gray-500 hover:border-green-400 hover:text-green-500 transition-colors">
        <Plus size={18}/> เพิ่ม{activeTab === "assets" ? "ทรัพย์สิน" : "หนี้สิน"}
      </button>

      {/* Items List */}
      <div className="space-y-3">
        {activeTab === "assets"
          ? (data?.assets ?? []).map(a => (
            <div key={a.id} className="flex items-center gap-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4">
              <span className="text-2xl">{a.icon}</span>
              <div className="flex-1">
                <p className="font-medium">{a.name}</p>
                <p className="text-xs text-gray-400">{ASSET_LABELS[a.type] ?? a.type}</p>
              </div>
              <p className="font-semibold text-green-600">{FMT(a.value)}</p>
              <button onClick={() => deleteItem(a.id, "asset")} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 size={14}/></button>
            </div>
          ))
          : (data?.liabilities ?? []).map(l => (
            <div key={l.id} className="flex items-center gap-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4">
              <span className="text-2xl">{l.icon}</span>
              <div className="flex-1">
                <p className="font-medium">{l.name}</p>
                <p className="text-xs text-gray-400">{LIABILITY_LABELS[l.type] ?? l.type}</p>
              </div>
              <p className="font-semibold text-red-500">{FMT(l.amount)}</p>
              <button onClick={() => deleteItem(l.id, "liability")} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 size={14}/></button>
            </div>
          ))
        }
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">เพิ่ม{activeTab === "assets" ? "ทรัพย์สิน" : "หนี้สิน"}</h2>
              <button onClick={() => setShowAdd(false)}><X size={20}/></button>
            </div>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="ชื่อ" className="w-full border dark:border-gray-700 rounded-xl px-4 py-2.5 dark:bg-gray-800"/>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              className="w-full border dark:border-gray-700 rounded-xl px-4 py-2.5 dark:bg-gray-800">
              {(activeTab === "assets" ? ASSET_TYPES : LIABILITY_TYPES).map(t => (
                <option key={t} value={t}>{activeTab === "assets" ? ASSET_LABELS[t] : LIABILITY_LABELS[t]}</option>
              ))}
            </select>
            <input type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
              placeholder="มูลค่า (บาท)" className="w-full border dark:border-gray-700 rounded-xl px-4 py-2.5 dark:bg-gray-800"/>
            <button onClick={addItem} className={`w-full py-3 rounded-xl font-medium text-white ${activeTab === "assets" ? "bg-green-600 hover:bg-green-700" : "bg-red-500 hover:bg-red-600"}`}>
              บันทึก
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
