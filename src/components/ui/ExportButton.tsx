"use client"
// v1.6: Reusable export button — downloads CSV or JSON
import { useState } from "react"
import { Download, Loader2, ChevronDown } from "lucide-react"

type ExportType = "transactions" | "employees" | "payroll" | "sales"

interface Props {
  type: ExportType
  label?: string
  orgId?: string
  from?: string
  to?: string
  className?: string
}

export default function ExportButton({ type, label, orgId, from, to, className = "" }: Props) {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const doExport = async (format: "csv" | "json") => {
    setLoading(true)
    setOpen(false)
    try {
      const params = new URLSearchParams({ type, format })
      if (orgId) params.set("orgId", orgId)
      if (from)  params.set("from", from)
      if (to)    params.set("to", to)

      const res = await fetch(`/api/export?${params}`)
      if (!res.ok) {
        const e = await res.json()
        alert(e.error ?? "Export ไม่สำเร็จ")
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      const ext = format === "csv" ? "csv" : "json"
      a.href = url
      a.download = `paymap-${type}-${new Date().toISOString().split("T")[0]}.${ext}`
      document.body.appendChild(a)
      a.click()
      URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`relative ${className}`}>
      <div className="flex">
        <button
          onClick={() => doExport("csv")}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-l-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-xs font-semibold text-[var(--text-2)] transition-colors hover:bg-[var(--surface2)] disabled:opacity-50"
        >
          {loading ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
          {label ?? "Export"}
        </button>
        <button
          onClick={() => setOpen(v => !v)}
          disabled={loading}
          className="flex items-center rounded-r-xl border border-l-0 border-[var(--border)] bg-[var(--card)] px-2 py-2 text-xs text-[var(--text-3)] transition-colors hover:bg-[var(--surface2)] disabled:opacity-50"
        >
          <ChevronDown size={11} />
        </button>
      </div>
      {open && (
        <div className="absolute right-0 top-10 z-20 min-w-[100px] rounded-xl border border-[var(--border2)] bg-[var(--card)] py-1 shadow-xl text-xs">
          <button onClick={() => doExport("csv")}  className="block w-full px-3 py-2 text-left hover:bg-[var(--surface2)] transition-colors">📄 CSV</button>
          <button onClick={() => doExport("json")} className="block w-full px-3 py-2 text-left hover:bg-[var(--surface2)] transition-colors">📦 JSON</button>
        </div>
      )}
    </div>
  )
}
