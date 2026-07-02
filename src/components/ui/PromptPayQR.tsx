"use client"
// v1.8: PromptPay QR Generator UI
import { useState } from "react"
import { QrCode, Copy, Download, Check, Loader2, Phone } from "lucide-react"

type QRResult = {
  payload: string
  type: "phone" | "taxid" | "ewallet"
  target: string
  amount: number | null
  qrUrl: string
}

const TYPE_LABEL: Record<string, string> = {
  phone: "เบอร์โทรศัพท์",
  taxid: "เลขบัตรประชาชน / นิติบุคคล",
  ewallet: "e-Wallet ID",
}

export default function PromptPayQR() {
  const [target, setTarget]   = useState("")
  const [amount, setAmount]   = useState("")
  const [result, setResult]   = useState<QRResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [copied, setCopied]   = useState(false)

  async function generate() {
    if (!target.trim()) return setError("กรุณาระบุเบอร์โทร หรือเลขบัตรประชาชน")
    setLoading(true); setError(null); setResult(null)
    try {
      const params = new URLSearchParams({ id: target.trim() })
      if (amount) params.set("amount", amount)
      const res = await fetch(`/api/promptpay?${params}`, { method: "GET" })
      const data = await res.json()
      if (!res.ok) return setError(data.error)
      setResult(data)
    } finally { setLoading(false) }
  }

  async function copyPayload() {
    if (!result) return
    await navigator.clipboard.writeText(result.payload)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function downloadQR() {
    if (!result) return
    const a = document.createElement("a")
    a.href = result.qrUrl
    a.download = `promptpay-${result.target}-${Date.now()}.png`
    a.click()
  }

  return (
    <div className="glass-card rounded-[28px] p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500/15">
          <QrCode size={18} className="text-sky-400" />
        </div>
        <div>
          <div className="text-sm font-black">PromptPay QR</div>
          <div className="text-xs text-[var(--text-3)]">สร้าง QR รับเงิน — มาตรฐาน EMVCo</div>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-[var(--text-2)]">
            เบอร์โทร / เลขบัตร / เลขนิติบุคคล
          </label>
          <input
            value={target}
            onChange={e => setTarget(e.target.value)}
            onKeyDown={e => e.key === "Enter" && generate()}
            placeholder="0812345678 หรือ 1234567890123"
            className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface2)] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400/40"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-[var(--text-2)]">
            จำนวนเงิน (บาท) — ไม่บังคับ
          </label>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            onKeyDown={e => e.key === "Enter" && generate()}
            placeholder="เว้นว่างเพื่อให้ผู้โอนกรอกเอง"
            min="0" max="9999999" step="0.01"
            className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface2)] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400/40"
          />
        </div>

        {error && <p className="text-xs text-rose-400">{error}</p>}

        <button
          onClick={generate}
          disabled={loading || !target.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-500 py-2.5 text-sm font-black text-white disabled:opacity-50 transition-opacity"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <QrCode size={14} />}
          {loading ? "กำลังสร้าง..." : "สร้าง QR"}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="mt-5 border-t border-[var(--border)] pt-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-[var(--text-2)]">
                {TYPE_LABEL[result.type] ?? result.type}
              </div>
              <div className="text-sm font-black">{result.target}</div>
              {result.amount && (
                <div className="mt-0.5 text-xs text-sky-400 font-semibold">
                  ฿{result.amount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={copyPayload}
                className="flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface2)] px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-[var(--border)]"
              >
                {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                {copied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={downloadQR}
                className="flex items-center gap-1.5 rounded-xl bg-sky-500/15 px-3 py-1.5 text-xs font-semibold text-sky-400 transition-colors hover:bg-sky-500/25"
              >
                <Download size={11} />
                PNG
              </button>
            </div>
          </div>

          {/* QR Code Image */}
          <div className="flex justify-center">
            <div className="rounded-2xl border-2 border-[var(--border)] bg-white p-3 shadow-inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={result.qrUrl}
                alt="PromptPay QR Code"
                width={220}
                height={220}
                className="block"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none"
                }}
              />
            </div>
          </div>

          <p className="mt-3 text-center text-[10px] text-[var(--text-3)]">
            สแกนด้วยแอปธนาคารใดก็ได้ · มาตรฐาน EMVCo PromptPay
          </p>
        </div>
      )}
    </div>
  )
}
