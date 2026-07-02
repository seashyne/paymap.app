"use client"
// v24.0: Installments Client UI (build-safe version)

import { useEffect, useState, useCallback } from "react"
import {
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  X,
} from "lucide-react"
import { useToast } from "@/components/ui/Toast"

type Installment = {
  id: string
  name: string
  totalAmount: number
  downPayment: number
  monthlyAmount: number
  totalMonths: number
  paidMonths: number
  interestRate: number
  currency: string
  startDate: string
  nextDueDate: string
  icon: string
  color: string
  status: string
  remainingAmount: number
  progressPercent: number
}

const FMT = (n: number, cur = "THB") =>
  new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: cur,
    minimumFractionDigits: 0,
  }).format(n)

const DATE = (d: string) =>
  new Date(d).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "2-digit",
  })

const ICONS = ["📱", "🚗", "🏠", "💻", "📺", "🎮", "👜", "✈️", "💍", "🛵"]

export default function InstallmentsClient() {
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

  const [items, setItems] = useState<Installment[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [payingId, setPayingId] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: "",
    totalAmount: "",
    downPayment: "0",
    monthlyAmount: "",
    totalMonths: "12",
    interestRate: "0",
    currency: "THB",
    startDate: new Date().toISOString().split("T")[0],
    icon: "📱",
  })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await fetch("/api/installments?status=active")
      const d = await r.json()
      if (d.success) setItems(d.data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const totalMonthly = items
    .filter((i) => i.status === "active")
    .reduce((s, i) => s + i.monthlyAmount, 0)

  async function addInstallment() {
    const required = ["name", "totalAmount", "monthlyAmount", "totalMonths"]

    if (required.some((k) => !(form as any)[k])) {
      return showToast("กรุณากรอกข้อมูลให้ครบ", "error")
    }

    const r = await fetch("/api/installments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        totalAmount: Number(form.totalAmount),
        downPayment: Number(form.downPayment),
        monthlyAmount: Number(form.monthlyAmount),
        totalMonths: Number(form.totalMonths),
        interestRate: Number(form.interestRate),
      }),
    })

    const d = await r.json()

    if (d.success) {
      showToast("เพิ่มรายการผ่อนแล้ว", "success")
      setShowAdd(false)
      load()
    } else {
      showToast(d.error, "error")
    }
  }

  async function payInstallment(id: string) {
    setPayingId(id)

    const item = items.find((i) => i.id === id)
    if (!item) return

    const r = await fetch(`/api/installments/${id}/pay`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: item.monthlyAmount,
        paidAt: new Date().toISOString().split("T")[0],
      }),
    })

    const d = await r.json()

    showToast(d.message ?? d.error, d.success ? "success" : "error")

    setPayingId(null)

    if (d.success) load()
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-5 text-white">
        <p className="text-sm opacity-80">ยอดผ่อนรวมต่อเดือน</p>
        <p className="text-3xl font-bold mt-1">{FMT(totalMonthly)}</p>
        <p className="text-sm opacity-80 mt-1">
          {items.length} รายการที่ active
        </p>
      </div>

      <button
        onClick={() => setShowAdd(true)}
        className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-medium"
      >
        <Plus size={18} /> เพิ่มรายการผ่อน
      </button>

      {loading ? (
        <div className="flex justify-center py-12">
          <RefreshCw className="animate-spin text-amber-500" size={28} />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <CheckCircle size={48} className="mx-auto mb-3 opacity-30" />
          <p>ไม่มีรายการผ่อนชำระ</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((i) => {
            const isOverdue =
              new Date(i.nextDueDate) < new Date() && i.status === "active"

            return (
              <div
                key={i.id}
                className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{i.icon}</span>

                    <div>
                      <p className="font-semibold">{i.name}</p>

                      <p className="text-xs text-gray-400">
                        งวดที่ {i.paidMonths}/{i.totalMonths} ·{" "}
                        {FMT(i.monthlyAmount)}/เดือน
                      </p>
                    </div>
                  </div>

                  {isOverdue && (
                    <AlertCircle
                      size={18}
                      className="text-red-500 mt-0.5 flex-shrink-0"
                    />
                  )}
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>ผ่อนไปแล้ว {i.progressPercent}%</span>
                    <span>เหลือ {FMT(i.remainingAmount)}</span>
                  </div>

                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber-500 transition-all"
                      style={{ width: `${i.progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock size={12} />
                    <span>ครบกำหนด {DATE(i.nextDueDate)}</span>
                  </div>

                  {i.status === "active" && (
                    <button
                      onClick={() => payInstallment(i.id)}
                      disabled={payingId === i.id}
                      className="text-sm bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white px-4 py-1.5 rounded-lg transition-colors"
                    >
                      {payingId === i.id ? "กำลังบันทึก..." : "จ่ายงวดนี้"}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showAdd && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
          onClick={() => setShowAdd(false)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">เพิ่มรายการผ่อน</h2>
              <button onClick={() => setShowAdd(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="flex gap-2 flex-wrap">
              {ICONS.map((ic) => (
                <button
                  key={ic}
                  onClick={() => setForm((f) => ({ ...f, icon: ic }))}
                  className={`text-2xl p-2 rounded-xl border-2 transition-colors ${
                    form.icon === ic
                      ? "border-amber-500 bg-amber-50"
                      : "border-transparent"
                  }`}
                >
                  {ic}
                </button>
              ))}
            </div>

            <input
              value={form.name}
              onChange={(e) =>
                setForm((f) => ({ ...f, name: e.target.value }))
              }
              placeholder="ชื่อ เช่น iPhone 15"
              className="w-full border rounded-xl px-4 py-2.5"
            />

            <button
              onClick={addInstallment}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-medium"
            >
              บันทึก
            </button>
          </div>
        </div>
      )}
    </div>
  )
}