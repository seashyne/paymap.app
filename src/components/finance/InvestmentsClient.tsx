"use client"
// v24.0: Investment Tracker UI (build-safe version)

import { useEffect, useState, useCallback } from "react"
import { Plus, TrendingUp, TrendingDown, RefreshCw, X } from "lucide-react"
import { useToast } from "@/components/ui/Toast"

type Investment = {
  id: string
  name: string
  ticker?: string
  type: string
  units: number
  avgCost: number
  currentPrice: number
  currency: string
  icon: string
  color: string
  costBasis: number
  marketValue: number
  unrealizedPL: number
  returnPct: number
}

const FMT = (n: number, c = "THB") =>
  new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: c,
    minimumFractionDigits: 0,
  }).format(n)

const PCT = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`

const TYPE_LABELS: Record<string, string> = {
  stock: "หุ้น",
  fund: "กองทุน",
  crypto: "Crypto",
  etf: "ETF",
  bond: "พันธบัตร",
  other: "อื่นๆ",
}

const TYPE_ICONS: Record<string, string> = {
  stock: "📊",
  fund: "🏦",
  crypto: "₿",
  etf: "📈",
  bond: "📜",
  other: "💼",
}

export default function InvestmentsClient() {
  const toastApi = useToast() as any

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "info"
  ) => {
    if (typeof toastApi?.showToast === "function") {
      toastApi.showToast(message, type)
      return
    }

    if (typeof toastApi?.toast === "function") {
      toastApi.toast({
        title: message,
        variant: type,
      })
      return
    }

    if (typeof toastApi?.success === "function" && type === "success") {
      toastApi.success(message)
      return
    }

    if (typeof toastApi?.error === "function" && type === "error") {
      toastApi.error(message)
      return
    }

    console[type === "error" ? "error" : "log"](message)
  }

  const [data, setData] = useState<{
    portfolio: Investment[]
    summary: any
  } | null>(null)

  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [txModal, setTxModal] = useState<Investment | null>(null)

  const [form, setForm] = useState({
    name: "",
    ticker: "",
    type: "stock",
    units: "0",
    avgCost: "0",
    currentPrice: "0",
    currency: "THB",
    icon: "📊",
  })

  const [tx, setTx] = useState({
    txType: "buy" as "buy" | "sell" | "dividend",
    units: "",
    price: "",
    fee: "0",
    happenedAt: new Date().toISOString().split("T")[0],
  })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await fetch("/api/investments")
      const d = await r.json()
      if (d.success) setData(d.data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function addInvestment() {
    if (!form.name) {
      return showToast("กรุณากรอกชื่อ", "error")
    }

    const r = await fetch("/api/investments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        units: Number(form.units),
        avgCost: Number(form.avgCost),
        currentPrice: Number(form.currentPrice),
        icon: TYPE_ICONS[form.type] ?? "📊",
      }),
    })

    const d = await r.json()

    if (d.success) {
      showToast("เพิ่มการลงทุนแล้ว", "success")
      setShowAdd(false)
      load()
    } else {
      showToast(d.error ?? "เกิดข้อผิดพลาด", "error")
    }
  }

  async function addTx() {
    if (!txModal || !tx.units || !tx.price) {
      return showToast("กรุณากรอกข้อมูล", "error")
    }

    const r = await fetch(`/api/investments/${txModal.id}/tx`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...tx,
        units: Number(tx.units),
        price: Number(tx.price),
        fee: Number(tx.fee),
      }),
    })

    const d = await r.json()

    if (d.success) {
      showToast(d.message ?? "บันทึกธุรกรรมแล้ว", "success")
      setTxModal(null)
      load()
    } else {
      showToast(d.error ?? "เกิดข้อผิดพลาด", "error")
    }
  }

  const summary = data?.summary ?? {}

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-2xl p-5 text-white">
        <p className="text-sm opacity-80">มูลค่า Portfolio</p>
        <p className="text-3xl font-bold mt-1">{FMT(summary.totalMarket ?? 0)}</p>
        <div className="flex items-center gap-2 mt-2">
          {(summary.totalPL ?? 0) >= 0 ? (
            <TrendingUp size={16} />
          ) : (
            <TrendingDown size={16} />
          )}
          <span className="text-sm">
            {FMT(summary.totalPL ?? 0)} ({PCT(summary.totalReturn ?? 0)})
          </span>
        </div>
      </div>

      <button
        onClick={() => setShowAdd(true)}
        className="w-full flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-white py-3 rounded-xl font-medium"
      >
        <Plus size={18} />
        เพิ่มการลงทุน
      </button>

      {loading ? (
        <div className="flex justify-center py-12">
          <RefreshCw className="animate-spin text-teal-500" size={28} />
        </div>
      ) : !data?.portfolio.length ? (
        <div className="text-center py-12 text-gray-400">
          <TrendingUp size={48} className="mx-auto mb-3 opacity-30" />
          <p>ยังไม่มีการลงทุน</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.portfolio.map((inv) => (
            <div
              key={inv.id}
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{inv.icon}</span>
                  <div>
                    <p className="font-semibold">
                      {inv.name}
                      {inv.ticker ? (
                        <span className="text-xs text-gray-400 ml-1">
                          {inv.ticker}
                        </span>
                      ) : null}
                    </p>
                    <p className="text-xs text-gray-400">
                      {TYPE_LABELS[inv.type]} · {inv.units} หน่วย
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-bold">{FMT(inv.marketValue, inv.currency)}</p>
                  <p
                    className={`text-sm font-medium ${
                      inv.unrealizedPL >= 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {PCT(inv.returnPct)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg py-1.5">
                  <p className="text-gray-400">ต้นทุน</p>
                  <p className="font-medium">{FMT(inv.costBasis, inv.currency)}</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg py-1.5">
                  <p className="text-gray-400">ราคาปัจจุบัน</p>
                  <p className="font-medium">{inv.currentPrice.toLocaleString()}</p>
                </div>

                <div
                  className={`rounded-lg py-1.5 ${
                    inv.unrealizedPL >= 0
                      ? "bg-green-50 dark:bg-green-900/20"
                      : "bg-red-50 dark:bg-red-900/20"
                  }`}
                >
                  <p className="text-gray-400">กำไร/ขาดทุน</p>
                  <p
                    className={`font-medium ${
                      inv.unrealizedPL >= 0 ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {FMT(inv.unrealizedPL, inv.currency)}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setTxModal(inv)}
                className="mt-3 w-full text-sm bg-gray-100 dark:bg-gray-800 hover:bg-teal-50 dark:hover:bg-teal-900/20 py-2 rounded-xl transition-colors"
              >
                + บันทึกธุรกรรม
              </button>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
          onClick={() => setShowAdd(false)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">เพิ่มการลงทุน</h2>
              <button onClick={() => setShowAdd(false)}>
                <X size={20} />
              </button>
            </div>

            <select
              value={form.type}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  type: e.target.value,
                }))
              }
              className="w-full border dark:border-gray-700 rounded-xl px-4 py-2.5 dark:bg-gray-800"
            >
              {Object.entries(TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>

            <input
              value={form.name}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  name: e.target.value,
                }))
              }
              placeholder="ชื่อ"
              className="w-full border dark:border-gray-700 rounded-xl px-4 py-2.5 dark:bg-gray-800"
            />

            <input
              value={form.ticker}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  ticker: e.target.value,
                }))
              }
              placeholder="Ticker (ADVANC, BTC...)"
              className="w-full border dark:border-gray-700 rounded-xl px-4 py-2.5 dark:bg-gray-800"
            />

            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                value={form.units}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    units: e.target.value,
                  }))
                }
                placeholder="จำนวน"
                className="border dark:border-gray-700 rounded-xl px-3 py-2.5 dark:bg-gray-800"
              />

              <input
                type="number"
                value={form.avgCost}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    avgCost: e.target.value,
                  }))
                }
                placeholder="ต้นทุนเฉลี่ย"
                className="border dark:border-gray-700 rounded-xl px-3 py-2.5 dark:bg-gray-800"
              />

              <input
                type="number"
                value={form.currentPrice}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    currentPrice: e.target.value,
                  }))
                }
                placeholder="ราคาตลาด"
                className="border dark:border-gray-700 rounded-xl px-3 py-2.5 dark:bg-gray-800"
              />
            </div>

            <button
              onClick={addInvestment}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white py-3 rounded-xl font-medium"
            >
              บันทึก
            </button>
          </div>
        </div>
      )}

      {txModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
          onClick={() => setTxModal(null)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-sm space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold">
              บันทึกธุรกรรม: {txModal.name}
            </h2>

            <div className="flex gap-2">
              {(["buy", "sell", "dividend"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() =>
                    setTx((x) => ({
                      ...x,
                      txType: t,
                    }))
                  }
                  className={`flex-1 py-2 rounded-xl text-sm font-medium border-2 ${
                    tx.txType === t
                      ? "border-teal-500 bg-teal-50 text-teal-600"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  {t === "buy" ? "ซื้อ" : t === "sell" ? "ขาย" : "ปันผล"}
                </button>
              ))}
            </div>

            <input
              type="number"
              value={tx.units}
              onChange={(e) =>
                setTx((x) => ({
                  ...x,
                  units: e.target.value,
                }))
              }
              placeholder="จำนวนหน่วย"
              className="w-full border dark:border-gray-700 rounded-xl px-4 py-2.5 dark:bg-gray-800"
            />

            <input
              type="number"
              value={tx.price}
              onChange={(e) =>
                setTx((x) => ({
                  ...x,
                  price: e.target.value,
                }))
              }
              placeholder="ราคา/หน่วย"
              className="w-full border dark:border-gray-700 rounded-xl px-4 py-2.5 dark:bg-gray-800"
            />

            <input
              type="number"
              value={tx.fee}
              onChange={(e) =>
                setTx((x) => ({
                  ...x,
                  fee: e.target.value,
                }))
              }
              placeholder="ค่าธรรมเนียม"
              className="w-full border dark:border-gray-700 rounded-xl px-4 py-2.5 dark:bg-gray-800"
            />

            <input
              type="date"
              value={tx.happenedAt}
              onChange={(e) =>
                setTx((x) => ({
                  ...x,
                  happenedAt: e.target.value,
                }))
              }
              className="w-full border dark:border-gray-700 rounded-xl px-4 py-2.5 dark:bg-gray-800"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setTxModal(null)}
                className="flex-1 py-2.5 border dark:border-gray-700 rounded-xl"
              >
                ยกเลิก
              </button>
              <button
                onClick={addTx}
                className="flex-1 bg-teal-500 text-white py-2.5 rounded-xl font-medium"
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}