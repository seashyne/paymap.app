"use client"
// FileUploader — อัพโหลดรูปภาพ/เอกสารไปยัง Cloudflare R2
import { useState, useRef, useCallback } from "react"
import { Upload, X, Check, Loader2, ImageIcon, FileText, AlertCircle, Eye } from "lucide-react"

type UploadCategory = "receipts" | "invoices" | "avatars" | "documents"

interface FileUploaderProps {
  category: UploadCategory
  linkedId?: string
  linkedType?: string
  accept?: string
  maxSizeMB?: number
  label?: string
  hint?: string
  onSuccess?: (url: string, key: string) => void
  onError?: (msg: string) => void
  className?: string
}

const CATEGORY_INFO: Record<UploadCategory, { label: string; icon: any; color: string; maxMB: number; accept: string }> = {
  receipts:  { label: "ใบเสร็จ",   icon: FileText,  color: "#10b981", maxMB: 5,  accept: "image/*,application/pdf" },
  invoices:  { label: "Invoice",   icon: FileText,  color: "#3b82f6", maxMB: 10, accept: "image/*,application/pdf" },
  avatars:   { label: "รูปโปรไฟล์", icon: ImageIcon, color: "#8b5cf6", maxMB: 2,  accept: "image/*" },
  documents: { label: "เอกสาร",    icon: FileText,  color: "#f59e0b", maxMB: 20, accept: "image/*,application/pdf,.doc,.docx" },
}

export default function FileUploader({
  category,
  linkedId,
  linkedType,
  accept,
  maxSizeMB,
  label,
  hint,
  onSuccess,
  onError,
  className = "",
}: FileUploaderProps) {
  const [status, setStatus]       = useState<"idle" | "uploading" | "success" | "error">("idle")
  const [progress, setProgress]  = useState(0)
  const [preview, setPreview]    = useState<string | null>(null)
  const [fileName, setFileName]  = useState<string | null>(null)
  const [fileSize, setFileSize]  = useState<number>(0)
  const [errorMsg, setErrorMsg]  = useState<string | null>(null)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [dragging, setDragging]  = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const info = CATEGORY_INFO[category]
  const effectiveAccept = accept?.trim() || info.accept
  const effectiveMaxSizeMB = maxSizeMB ?? info.maxMB

  const reset = () => {
    setStatus("idle")
    setProgress(0)
    setPreview(null)
    setFileName(null)
    setFileSize(0)
    setErrorMsg(null)
    setResultUrl(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  const doUpload = useCallback(async (file: File) => {
    // Validate size
    if (file.size > effectiveMaxSizeMB * 1024 * 1024) {
      const msg = `ไฟล์ใหญ่เกิน ${effectiveMaxSizeMB}MB`
      setErrorMsg(msg)
      setStatus("error")
      onError?.(msg)
      return
    }

    const acceptList = effectiveAccept
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
    const isAccepted = acceptList.length === 0 || acceptList.some((rule) => {
      if (rule === "*/*") return true
      if (rule.endsWith("/*")) return file.type.startsWith(`${rule.slice(0, -1)}`)
      if (rule.startsWith(".")) return file.name.toLowerCase().endsWith(rule.toLowerCase())
      return file.type === rule
    })
    if (!isAccepted) {
      const msg = `ประเภทไฟล์ไม่รองรับ (${effectiveAccept})`
      setErrorMsg(msg)
      setStatus("error")
      onError?.(msg)
      return
    }

    // Preview
    if (file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = e => setPreview(e.target?.result as string)
      reader.readAsDataURL(file)
    }
    setFileName(file.name)
    setFileSize(file.size)
    setStatus("uploading")
    setProgress(10)

    try {
      const form = new FormData()
      form.append("file", file)
      form.append("category", category)
      if (linkedId) form.append("linkedId", linkedId)
      if (linkedType) form.append("linkedType", linkedType)

      // Fake progress while uploading
      const fakeProgress = setInterval(() => {
        setProgress(p => Math.min(p + 15, 85))
      }, 300)

      const res = await fetch("/api/upload", { method: "POST", body: form })
      clearInterval(fakeProgress)

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "อัพโหลดไม่สำเร็จ")

      setProgress(100)
      setStatus("success")
      setResultUrl(data.url)
      onSuccess?.(data.url, data.key)
    } catch (e: any) {
      const msg = e.message || "อัพโหลดไม่สำเร็จ"
      setErrorMsg(msg)
      setStatus("error")
      onError?.(msg)
    }
  }, [category, linkedId, linkedType, effectiveAccept, effectiveMaxSizeMB, onSuccess, onError])

  const handleFile = (file: File | null) => {
    if (!file) return
    reset()
    setTimeout(() => doUpload(file), 50)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0] ?? null)
  }

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="text-sm font-bold" style={{ color: "var(--text)" }}>
          {label}
        </div>
      )}

      {/* Drop zone */}
      {status === "idle" && (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className="relative rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all"
          style={{
            borderColor: dragging ? info.color : "rgba(255,255,255,0.12)",
            background: dragging ? `${info.color}08` : "rgba(255,255,255,0.02)",
          }}>
          <input
            ref={inputRef} type="file" className="hidden"
            accept={effectiveAccept}
            onChange={e => handleFile(e.target.files?.[0] ?? null)}
          />
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl"
              style={{ background: `${info.color}12` }}>
              <Upload size={20} style={{ color: info.color }} />
            </div>
            <div>
              <div className="text-sm font-bold" style={{ color: "var(--text)" }}>
                คลิกเพื่อเลือกไฟล์ หรือลากมาวาง
              </div>
              <div className="text-xs mt-1" style={{ color: "var(--text-3)" }}>
                {hint || `${info.label} · สูงสุด ${effectiveMaxSizeMB}MB`}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Uploading */}
      {status === "uploading" && (
        <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex items-center gap-3 mb-4">
            {preview
              ? <img src={preview} alt="" className="h-12 w-12 rounded-xl object-cover" />
              : <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: `${info.color}15` }}>
                  <info.icon size={20} style={{ color: info.color }} />
                </div>
            }
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold truncate">{fileName}</div>
              <div className="text-xs" style={{ color: "var(--text-3)" }}>{formatBytes(fileSize)}</div>
            </div>
            <Loader2 size={18} className="animate-spin" style={{ color: info.color }} />
          </div>
          {/* Progress bar */}
          <div className="h-1.5 w-full rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div className="h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${info.color}, ${info.color}99)` }} />
          </div>
          <div className="text-right text-[11px] mt-1" style={{ color: "var(--text-3)" }}>{progress}%</div>
        </div>
      )}

      {/* Success */}
      {status === "success" && (
        <div className="rounded-2xl p-5" style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)" }}>
          <div className="flex items-center gap-3">
            {preview
              ? <img src={preview} alt="" className="h-12 w-12 rounded-xl object-cover cursor-pointer"
                  onClick={() => resultUrl && window.open(resultUrl, "_blank")} />
              : <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: "rgba(16,185,129,0.12)" }}>
                  <Check size={20} style={{ color: "#10b981" }} />
                </div>
            }
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold truncate" style={{ color: "#10b981" }}>อัพโหลดสำเร็จ ✓</div>
              <div className="text-xs truncate" style={{ color: "rgba(255,255,255,0.4)" }}>{fileName}</div>
            </div>
            <div className="flex items-center gap-1">
              {resultUrl && (
                <button onClick={() => window.open(resultUrl, "_blank")}
                  className="rounded-xl p-2 transition-all hover:bg-white/10"
                  title="ดูไฟล์" style={{ color: "rgba(255,255,255,0.5)" }}>
                  <Eye size={15} />
                </button>
              )}
              <button onClick={reset}
                className="rounded-xl p-2 transition-all hover:bg-white/10"
                title="อัพโหลดใหม่" style={{ color: "rgba(255,255,255,0.5)" }}>
                <X size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {status === "error" && (
        <div className="rounded-2xl p-5" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: "rgba(239,68,68,0.1)" }}>
              <AlertCircle size={20} style={{ color: "#ef4444" }} />
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold" style={{ color: "#ef4444" }}>อัพโหลดไม่สำเร็จ</div>
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{errorMsg}</div>
            </div>
            <button onClick={reset}
              className="rounded-xl px-3 py-1.5 text-xs font-bold"
              style={{ background: "rgba(239,68,68,0.12)", color: "#ef4444" }}>
              ลองอีกครั้ง
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
