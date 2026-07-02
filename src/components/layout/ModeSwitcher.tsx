"use client"
// ModeSwitcher — dropdown สลับ active mode
// ใช้ใน AppFrame header และหน้า Settings
// เรียกใช้: <ModeSwitcher currentMode="personal" availableModes={["personal","business"]} />

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CreditCard, Building2, Store, ChevronDown, Check, Plus, Loader2 } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { workspacePath } from "@/lib/workspace"
import type { SiteLang } from "@/lib/i18n/site"
import { getAppMessages } from "@/lib/i18n/app"

export type AccountMode = "personal" | "business" | "merchant"

const MODE_META = (lang: SiteLang) => {
  const t = getAppMessages(lang)
  return {
    personal: {
      icon: CreditCard, label: "Personal", desc: t.settings.modeDescriptions.personal,
      color: "#7c3aed", bg: "rgba(124,58,237,0.12)", border: "rgba(124,58,237,0.3)",
    },
    business: {
      icon: Building2, label: "Business", desc: t.settings.modeDescriptions.business,
      color: "#0ea5e9", bg: "rgba(14,165,233,0.12)", border: "rgba(14,165,233,0.3)",
    },
    merchant: {
      icon: Store, label: "Merchant", desc: t.settings.modeDescriptions.merchant,
      color: "#e11d48", bg: "rgba(225,29,72,0.12)", border: "rgba(225,29,72,0.3)",
    },
  } satisfies Record<AccountMode, {
    icon: LucideIcon; label: string; desc: string
    color: string; bg: string; border: string
  }>
}

interface Props {
  lang?: SiteLang
  currentMode: AccountMode
  // โหมดที่พร้อมใช้งานอยู่แล้ว (มี user row ใน DB)
  availableModes: AccountMode[]
  // compact = แสดงแค่ icon+label (สำหรับ header)
  compact?: boolean
  onSwitch?: (mode: AccountMode) => void
}

export default function ModeSwitcher({ currentMode, availableModes, compact = false, onSwitch, lang = "en" }: Props) {
  const router = useRouter()
  const t = getAppMessages(lang)
  const [open, setOpen] = useState(false)
  const [switching, setSwitching] = useState<AccountMode | null>(null)

  const metaMap = MODE_META(lang)
  const current = metaMap[currentMode]
  const CurrentIcon = current.icon

  const ALL_MODES: AccountMode[] = ["personal", "business", "merchant"]
  const otherModes = ALL_MODES.filter(m => m !== currentMode)

  const switchMode = async (mode: AccountMode) => {
    if (mode === currentMode || switching) return
    setOpen(false)
    setSwitching(mode)
    try {
      const res = await fetch("/api/workspaces/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
      })
      const data = await res.json()

      if (!res.ok) {
        if (data.needsRegister) {
          // v4.1: ส่ง next param เพื่อหลังสร้างแล้ว redirect กลับมาโหมดที่ถูก
          const registerUrl = data.registerUrl ?? `/register?mode=${mode}`
          const returnTo = encodeURIComponent(workspacePath(mode))
          router.push(`${registerUrl}&next=${returnTo}`)
        } else {
          console.error("[switch-mode]", data.error)
        }
        return
      }

      onSwitch?.(mode)
      router.push(data.redirectTo)
      router.refresh()
    } catch (err) {
      console.error("[switch-mode] network error", err)
    } finally {
      setSwitching(null)
    }
  }

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-bold transition-all hover:opacity-80"
        style={{ background: current.bg, color: current.color, border: `1px solid ${current.border}` }}
      >
        {switching ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <CurrentIcon size={14} />
        )}
        {!compact && <span>{current.label}</span>}
        <ChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          <div
            className="absolute right-0 top-full z-50 mt-2 w-64 rounded-[20px] p-2 shadow-2xl"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            {/* Header */}
            <div className="px-3 py-2 mb-1">
              <div className="text-[10px] font-bold uppercase tracking-[0.15em]"
                style={{ color: "var(--text-3)" }}>
                {t.common.switchWorkspace}
              </div>
            </div>

            {/* All modes */}
            {ALL_MODES.map(mode => {
              const meta = metaMap[mode]
              const Icon = meta.icon
              const isActive = mode === currentMode
              const hasAccount = availableModes.includes(mode)
              const isLoading = switching === mode

              return (
                <button
                  key={mode}
                  onClick={() => switchMode(mode)}
                  disabled={isActive || isLoading}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all hover:opacity-80 disabled:cursor-default"
                  style={{
                    background: isActive ? meta.bg : "transparent",
                    border: isActive ? `1px solid ${meta.border}` : "1px solid transparent",
                    marginBottom: "2px",
                  }}
                >
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: meta.bg, border: `1px solid ${meta.border}` }}
                  >
                    {isLoading
                      ? <Loader2 size={14} style={{ color: meta.color }} className="animate-spin" />
                      : <Icon size={14} style={{ color: meta.color }} />
                    }
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold" style={{ color: isActive ? meta.color : "var(--text)" }}>
                      {meta.label}
                    </div>
                    <div className="text-xs" style={{ color: "var(--text-3)" }}>{meta.desc}</div>
                  </div>

                  <div className="shrink-0">
                    {isActive ? (
                      <Check size={14} style={{ color: meta.color }} />
                    ) : hasAccount ? (
                      <div className="text-[10px] rounded-full px-2 py-0.5 font-semibold"
                        style={{ background: `${meta.color}15`, color: meta.color }}>
                        {t.common.available}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-[10px] rounded-full px-2 py-0.5 font-semibold"
                        style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-3)" }}>
                        <Plus size={9} /> {t.common.create}
                      </div>
                    )}
                  </div>
                </button>
              )
            })}

            {/* Footer — link to register ถ้ายังไม่พร้อมใช้งานบางโหมด */}
            {ALL_MODES.some(m => !availableModes.includes(m)) && (
              <div className="mt-2 pt-2" style={{ borderTop: "1px solid var(--border)" }}>
                <p className="px-3 text-[11px]" style={{ color: "var(--text-3)" }}>
                  {t.common.unavailableHint}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
