"use client"
// v24.0: Loans Client UI (build-safe version)

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Plus,
  RefreshCw,
  X,
  Landmark,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react"
import { useToast } from "@/components/ui/Toast"

type Loan = {
  id: string
  name: string
  lender?: string | null
  type: string
  principalAmount: number
  outstandingBalance: number
  monthlyPayment: number
  interestRate: number
  currency: string
  startDate: string
  nextDueDate?: string | null
  endDate?: string | null
  status: string
  icon?: string | null
  color?: string | null
  progressPercent?: number
}

const FMT = (n: number, cur = "THB") =>
  new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: cur,
    minimumFractionDigits: 0,
  }).format(n)

const DATE = (d?: string | null) =>
  d
    ? new Date(d).toLocaleDateString("th-TH", {
        day: "numeric",
        month: "short",
        year: "2-digit",
      })
    : "-"

const LOAN_TYPES: Record<string, string> = {
  personal: "สินเชื่อบุคคล",
  home: "สินเชื่อบ้าน",
  car: "สินเชื่อรถ",
  business: "สินเชื่อธุรกิจ",
  education: "สินเชื่อการศึกษา",
  credit: "หนี้บัตรเครดิต",
  other: "อื่นๆ",
}

export default function LoansClient() {
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

  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [payingId, setPayingId] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: "",
    lender: "",
    type: "personal",
    principalAmount: "",
    outstandingBalance: "",
    monthlyPayment: "",
    interestRate: "0",
    currency: "THB",
    startDate: new Date().toISOString().split("T")[0],
    nextDueDate: new Date().toISOString().split("T")[0],
  })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await fetch("/api/loans")
      const d = await r.json()
      if (d.success) {
        setLoans(Array.isArray(d.data) ? d.data : d.data?.loans ?? [])
      }
    } catch {
      showToast("โหลดข้อมูลสินเชื่อไม่สำเร็จ", "error")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const totalOutstanding = useMemo(
    () => loans.reduce((sum, loan) => sum + (loan.outstandingBalance || 0), 0),
    [loans]
  )

  const totalMonthly = useMemo(
    () =>
      loans
        .filter((loan) => loan.status === "active")
        .reduce((sum, loan) => sum + (loan.monthlyPayment || 0), 0),
    [loans]
  )

  async function addLoan() {
    if (
      !form.name ||
      !form.principalAmount ||
      !form.outstandingBalance ||
      !form.monthlyPayment
    ) {
      return showToast("กรุณากรอกข้อมูลให้ครบ", "error")
    }

    try {
      const r = await fetch("/api/loans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          principalAmount: Number(form.principalAmount),
          outstandingBalance: Number(form.outstandingBalance),
          monthlyPayment: Number(form.monthlyPayment),
          interestRate: Number(form.interestRate),
        }),
      })

      const d = await r.json()

      if (d.success) {
        showToast("เพิ่มรายการสินเชื่อแล้ว", "success")
        setShowAdd(false)
        setForm({
          name: "",
          lender: "",
          type: "personal",
          principalAmount: "",
          outstandingBalance: "",
          monthlyPayment: "",
          interestRate: "0",
          currency: "THB",
          startDate: new Date().toISOString().split("T")[0],
          nextDueDate: new Date().toISOString().split("T")[0],
        })
        load()
      } else {
        showToast(d.error ?? "เกิดข้อผิดพลาด", "error")
      }
    } catch {
      showToast("บันทึกรายการสินเชื่อไม่สำเร็จ", "error")
    }
  }

  async function payLoan(id: string) {
    const loan = loans.find((x) => x.id === id)
    if (!loan) return

    setPayingId(id)

    try {
      const r = await fetch(`/api/loans/${id}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: loan.monthlyPayment,
          paidAt: new Date().toISOString().split("T")[0],
        }),
      })

      const d = await r.json()
      showToast(d.message ?? d.error ?? "บันทึกการชำระแล้ว", d.success ? "success" : "error")

      if (d.success) {
        load()
      }
    } catch {
      showToast("บันทึกการชำระไม่สำเร็จ", "error")
    } finally {
      setPayingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-rose-500 to-pink-600 rounded-2xl p-5 text-white">
        <p className="text-sm opacity-80">ยอดหนี้คงเหลือทั้งหมด</p>
        <p className="text-3xl font-bold mt-1">{FMT(totalOutstanding)}</p>
        <p className="text-sm opacity-80 mt-2">
          ค่างวดรวมต่อเดือน {FMT(totalMonthly)}
        </p>
      </div>

      <button
        onClick={() => setShowAdd(true)}
        className="w-full flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-xl font-medium"
      >
        <Plus size={18} />
        เพิ่มรายการสินเชื่อ
      </button>

      {loading ? (
        <div className="flex justify-center py-12">
          <RefreshCw className="animate-spin text-rose-500" size={28} />
        </div>
      ) : loans.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Landmark size={48} className="mx-auto mb-3 opacity-30" />
          <p>ยังไม่มีรายการสินเชื่อ</p>
        </div>
      ) : (
        <div className="space-y-4">
          {loans.map((loan) => {
            const isOverdue =
              !!loan.nextDueDate &&
              new Date(loan.nextDueDate) < new Date() &&
              loan.status === "active"

            const progress =
              loan.progressPercent ??
              (loan.principalAmount > 0
                ? Math.max(
                    0,
                    Math.min(
                      100,
                      ((loan.principalAmount - loan.outstandingBalance) /
                        loan.principalAmount) *
                        100
                    )
                  )
                : 0)

            return (
              <div
                key={loan.id}
                className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-2xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center">
                      <Landmark size={20} className="text-rose-500" />
                    </div>

                    <div>
                      <p className="font-semibold">{loan.name}</p>
                      <p className="text-xs text-gray-400">
                        {LOAN_TYPES[loan.type] ?? loan.type}
                        {loan.lender ? ` · ${loan.lender}` : ""}
                      </p>
                    </div>
                  </div>

                  {isOverdue ? (
                    <AlertTriangle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
                  ) : (
                    <CheckCircle2 size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-xs mb-4">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg py-2">
                    <p className="text-gray-400">ยอดกู้</p>
                    <p className="font-medium">
                      {FMT(loan.principalAmount, loan.currency)}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg py-2">
                    <p className="text-gray-400">คงเหลือ</p>
                    <p className="font-medium">
                      {FMT(loan.outstandingBalance, loan.currency)}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg py-2">
                    <p className="text-gray-400">ค่างวด</p>
                    <p className="font-medium">
                      {FMT(loan.monthlyPayment, loan.currency)}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg py-2">
                    <p className="text-gray-400">ดอกเบี้ย</p>
                    <p className="font-medium">{loan.interestRate}%</p>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>ปิดหนี้แล้ว {progress.toFixed(0)}%</span>
                    <span>ครบกำหนด {DATE(loan.nextDueDate)}</span>
                  </div>

                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-rose-500 transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {loan.status === "active" && (
                  <button
                    onClick={() => payLoan(loan.id)}
                    disabled={payingId === loan.id}
                    className="w-full text-sm bg-rose-500 hover:bg-rose-600 disabled:opacity-60 text-white px-4 py-2.5 rounded-xl transition-colors"
                  >
                    {payingId === loan.id ? "กำลังบันทึก..." : "ชำระงวดนี้"}
                  </button>
                )}
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
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md space-y-3 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">เพิ่มรายการสินเชื่อ</h2>
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
              {Object.entries(LOAN_TYPES).map(([k, v]) => (
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
              placeholder="ชื่อสินเชื่อ"
              className="w-full border dark:border-gray-700 rounded-xl px-4 py-2.5 dark:bg-gray-800"
            />

            <input
              value={form.lender}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  lender: e.target.value,
                }))
              }
              placeholder="ผู้ให้กู้ / ธนาคาร"
              className="w-full border dark:border-gray-700 rounded-xl px-4 py-2.5 dark:bg-gray-800"
            />

            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={form.principalAmount}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    principalAmount: e.target.value,
                  }))
                }
                placeholder="ยอดกู้"
                className="border dark:border-gray-700 rounded-xl px-4 py-2.5 dark:bg-gray-800"
              />

              <input
                type="number"
                value={form.outstandingBalance}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    outstandingBalance: e.target.value,
                  }))
                }
                placeholder="ยอดคงเหลือ"
                className="border dark:border-gray-700 rounded-xl px-4 py-2.5 dark:bg-gray-800"
              />

              <input
                type="number"
                value={form.monthlyPayment}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    monthlyPayment: e.target.value,
                  }))
                }
                placeholder="ค่างวดต่อเดือน"
                className="border dark:border-gray-700 rounded-xl px-4 py-2.5 dark:bg-gray-800"
              />

              <input
                type="number"
                value={form.interestRate}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    interestRate: e.target.value,
                  }))
                }
                placeholder="ดอกเบี้ย %"
                className="border dark:border-gray-700 rounded-xl px-4 py-2.5 dark:bg-gray-800"
              />

              <input
                type="date"
                value={form.startDate}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    startDate: e.target.value,
                  }))
                }
                className="border dark:border-gray-700 rounded-xl px-4 py-2.5 dark:bg-gray-800"
              />

              <input
                type="date"
                value={form.nextDueDate}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    nextDueDate: e.target.value,
                  }))
                }
                className="border dark:border-gray-700 rounded-xl px-4 py-2.5 dark:bg-gray-800"
              />
            </div>

            <button
              onClick={addLoan}
              className="w-full bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-xl font-medium"
            >
              บันทึก
            </button>
          </div>
        </div>
      )}
    </div>
  )
}