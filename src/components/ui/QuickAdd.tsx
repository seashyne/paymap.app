"use client"
// v1.6: Floating Quick-Add button — accessible from every page
// Loads categories lazily on first open
import { useState, useEffect, useRef } from "react"
import { Plus, X, TrendingUp, TrendingDown, Loader2, Check } from "lucide-react"

type Category = { id: string; name: string; type: string; icon?: string | null; color?: string | null }

export default function QuickAdd() {
  const [open, setOpen]         = useState(false)
  const [cats, setCats]         = useState<Category[]>([])
  const [type, setType]         = useState<"expense" | "income">("expense")
  const [amount, setAmount]     = useState("")
  const [note, setNote]         = useState("")
  const [catId, setCatId]       = useState("")
  const [date, setDate]         = useState(() => new Date().toISOString().split("T")[0])
  const [saving, setSaving]     = useState(false)
  const [done, setDone]         = useState(false)
  const [error, setError]       = useState<string|null>(null)
  const amountRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open && cats.length === 0) {
      fetch("/api/categories").then(r => r.json()).then(d => {
        setCats(Array.isArray(d) ? d : (d.data ?? d.categories ?? []))
      }).catch(() => {})
    }
    if (open) setTimeout(() => amountRef.current?.focus(), 80)
  }, [open])

  const filteredCats = cats.filter(c => c.type === type)

  const handleSubmit = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("กรอกจำนวนเงินที่ถูกต้อง")
      return
    }
    setSaving(true)
    setError(null)
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type, amount: Number(amount),
          categoryId: catId || undefined,
          note: note || undefined,
          happenedAt: new Date(date).toISOString(),
          currency: "THB",
        }),
      })
      if (!res.ok) {
        const e = await res.json()
        setError(e.error ?? "บันทึกไม่สำเร็จ")
        return
      }
      setDone(true)
      setTimeout(() => {
        setOpen(false)
        setAmount(""); setNote(""); setCatId(""); setDone(false)
        setDate(new Date().toISOString().split("T")[0])
        // Soft refresh to update dashboard totals
        window.dispatchEvent(new CustomEvent("paymap:tx-added"))
      }, 900)
    } finally {
      setSaving(false)
    }
  }

  // Keyboard shortcut: N key to open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "n" && !e.ctrlKey && !e.metaKey && !(document.activeElement instanceof HTMLInputElement) && !(document.activeElement instanceof HTMLTextAreaElement)) {
        setOpen(v => !v)
      }
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [])

  useEffect(() => {
    const openQuickAdd = () => setOpen(true)
    window.addEventListener("paymap:quick-add-open", openQuickAdd)
    return () => window.removeEventListener("paymap:quick-add-open", openQuickAdd)
  }, [])

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(v => !v)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition-all duration-200"
        style={{
          background: open
            ? "var(--surface2)"
            : "linear-gradient(135deg, #8b5cf6, #38bdf8)",
          transform: open ? "rotate(45deg)" : "scale(1)",
        }}
        title="เพิ่มรายการ"
      >
        {open ? <X size={20} className="text-[var(--text)]" /> : <Plus size={22} className="text-white" />}
      </button>

      {/* Drawer */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative z-10 w-full max-w-sm rounded-[28px] border border-[var(--border2)] bg-[var(--card)] p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="font-black">เพิ่มรายการ</div>
              <button onClick={() => setOpen(false)} className="rounded-xl p-1.5 text-[var(--text-3)] hover:bg-[var(--surface2)] transition-colors">
                <X size={15} />
              </button>
            </div>

            {/* Type toggle */}
            <div className="mb-4 flex rounded-2xl border border-[var(--border)] bg-[var(--surface2)] p-1 gap-1">
              {([
                { id: "expense" as const, label: "รายจ่าย", Icon: TrendingDown, color: "#f87171" },
                { id: "income"  as const, label: "รายรับ",  Icon: TrendingUp,   color: "#34d399" },
              ] as const).map(({ id, label, Icon, color }) => (
                <button key={id} onClick={() => { setType(id); setCatId("") }}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-bold transition-colors ${
                    type === id ? "bg-[var(--card)] text-[var(--text)]" : "text-[var(--text-3)]"
                  }`}
                  style={type === id ? { color } : {}}
                >
                  <Icon size={13} />
                  {label}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {/* Amount */}
              <div>
                <label className="mb-1 block text-xs text-[var(--text-3)]">จำนวนเงิน (บาท) *</label>
                <input
                  ref={amountRef}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface2)] px-3.5 py-2.5 text-lg font-black focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/40"
                />
              </div>

              {/* Category */}
              {filteredCats.length > 0 && (
                <div>
                  <label className="mb-1.5 block text-xs text-[var(--text-3)]">หมวดหมู่</label>
                  <div className="flex flex-wrap gap-1.5">
                    {filteredCats.slice(0, 8).map(c => (
                      <button key={c.id} onClick={() => setCatId(catId === c.id ? "" : c.id)}
                        className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-semibold border transition-colors ${
                          catId === c.id
                            ? "border-transparent text-white"
                            : "border-[var(--border)] bg-[var(--surface2)] text-[var(--text-2)]"
                        }`}
                        style={catId === c.id ? { background: c.color ?? "#8b5cf6" } : {}}
                      >
                        {c.icon && <span>{c.icon}</span>}
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Note */}
              <div>
                <label className="mb-1 block text-xs text-[var(--text-3)]">หมายเหตุ</label>
                <input
                  type="text"
                  placeholder="ซื้อของ, ค่ากาแฟ..."
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface2)] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/40"
                />
              </div>

              {/* Date */}
              <div>
                <label className="mb-1 block text-xs text-[var(--text-3)]">วันที่</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface2)] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/40"
                />
              </div>
            </div>

            {error && <div className="mt-3 rounded-xl bg-rose-500/10 border border-rose-500/20 px-3 py-2 text-xs text-rose-400">{error}</div>}

            <button
              onClick={handleSubmit}
              disabled={saving || done || !amount}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-black text-white transition-all disabled:opacity-50"
              style={{ background: done ? "#22c55e" : "linear-gradient(135deg, #8b5cf6, #38bdf8)" }}
            >
              {done ? <><Check size={15} /> บันทึกแล้ว!</> : saving ? <><Loader2 size={14} className="animate-spin" /> กำลังบันทึก...</> : "บันทึกรายการ"}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
