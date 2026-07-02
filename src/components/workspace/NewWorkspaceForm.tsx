"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, ArrowRight } from "lucide-react"

export default function NewWorkspaceForm({
  type,
  color,
  copy,
}: {
  type: "business" | "merchant"
  color: string
  copy: {
    label: string
    placeholder: string
    emptyError: string
    failedError: string
    creating: string
    createButton: string
    helper: string
  }
}) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    if (!name.trim()) { setError(copy.emptyError); return }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, name: name.trim() }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || copy.failedError)
      router.push(json.workspace?.href ?? "/workspace/select")
      router.refresh()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold mb-2" style={{ color: "var(--text-2)" }}>
          {copy.label}
        </label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          placeholder={copy.placeholder}
          className="w-full px-4 py-3 rounded-xl text-sm outline-none"
          style={{
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            color: "var(--text)",
          }}
        />
      </div>

      {error && (
        <div className="text-xs px-3 py-2 rounded-xl" style={{ background: "rgba(248,113,113,0.1)", color: "#f87171" }}>
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading || !name.trim()}
        className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-opacity disabled:opacity-50"
        style={{ background: color, color: "#fff" }}>
        {loading ? <Loader2 size={15} className="animate-spin" /> : null}
        {!loading ? <ArrowRight size={15} /> : null}
        {loading ? copy.creating : copy.createButton}
      </button>

      <p className="text-center text-xs" style={{ color: "var(--text-3)" }}>
        {copy.helper}
      </p>
    </div>
  )
}
