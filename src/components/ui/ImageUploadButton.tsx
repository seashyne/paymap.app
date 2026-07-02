"use client"

import { useRef, useState } from "react"

type UploadCategory =
  | "avatars"
  | "storeLogos"
  | "storeBanners"
  | "productImages"
  | "payProfileImages"
  | "payProfileCovers"
  | "userBackgrounds"

export default function ImageUploadButton({
  category,
  linkedId,
  linkedType,
  label = "อัปโหลดรูป",
  className = "",
  onUploaded,
}: {
  category: UploadCategory
  linkedId?: string
  linkedType?: string
  label?: string
  className?: string
  onUploaded: (payload: { key: string; url: string }) => void
}) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File) {
    setLoading(true)
    setError(null)
    try {
      const form = new FormData()
      form.append("file", file)
      form.append("category", category)
      if (linkedId) form.append("linkedId", linkedId)
      if (linkedType) form.append("linkedType", linkedType)

      const res = await fetch("/api/upload", { method: "POST", body: form })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "อัปโหลดไม่สำเร็จ")
      onUploaded({ key: json.key, url: json.url })
    } catch (e: any) {
      setError(e.message ?? "อัปโหลดไม่สำเร็จ")
    } finally {
      setLoading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className={className || "rounded-xl border border-[var(--border)] px-3 py-2 text-sm font-semibold"}
      >
        {loading ? "กำลังอัปโหลด..." : label}
      </button>
      {error ? <div className="text-xs text-rose-400">{error}</div> : null}
    </div>
  )
}
