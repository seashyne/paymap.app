"use client"

import { Keyboard, LayoutGrid, PanelRightOpen, Table2 } from "lucide-react"
import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"

const STORAGE_KEY = "paymap-density"

function applyDensity(mode: "comfortable" | "compact" | "dense") {
  if (typeof document === "undefined") return
  document.documentElement.dataset.density = mode
}

export function DenseModeToggle() {
  const [mode, setMode] = useState<"comfortable" | "compact" | "dense">("comfortable")

  useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as "comfortable" | "compact" | "dense" | null) ?? "comfortable"
    setMode(stored)
    applyDensity(stored)
  }, [])

  function toggle() {
    const next = mode === "comfortable" ? "compact" : mode === "compact" ? "dense" : "comfortable"
    setMode(next)
    localStorage.setItem(STORAGE_KEY, next)
    applyDensity(next)
  }

  const meta = mode === "comfortable"
    ? { icon: LayoutGrid, label: "Comfortable" }
    : mode === "compact"
      ? { icon: Table2, label: "Compact" }
      : { icon: PanelRightOpen, label: "Dense" }
  const Icon = meta.icon

  return (
    <button type="button" onClick={toggle} className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-xs font-semibold text-[var(--text-2)] transition hover:border-[var(--border2)] hover:text-[var(--text)]" title="Switch density mode" aria-label="Switch density mode">
      <Icon size={14} />
      <span className="hidden xl:inline">{meta.label}</span>
    </button>
  )
}

export function KeyboardNavigation() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    let awaitingG = false
    function onKeyDown(event: KeyboardEvent) {
      if (event.target instanceof HTMLElement) {
        const tag = event.target.tagName.toLowerCase()
        if (tag === "input" || tag === "textarea" || event.target.isContentEditable) {
          if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
            const form = event.target.closest("form")
            if (form) form.requestSubmit()
          }
          return
        }
      }
      if (event.metaKey || event.ctrlKey || event.altKey) return

      const key = event.key.toLowerCase()
      if (key === "escape") {
        document.dispatchEvent(new CustomEvent("paymap:escape"))
        return
      }
      if (awaitingG) {
        awaitingG = false
        const map: Record<string, string> = { d: "/dashboard", p: "/planner", b: "/billing", s: "/settings", r: "/reports", w: "/wallets" }
        if (map[key] && pathname !== map[key]) {
          event.preventDefault()
          router.push(map[key])
          return
        }
      }
      if (key === "g") {
        awaitingG = true
        window.setTimeout(() => { awaitingG = false }, 900)
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [pathname, router])

  return null
}

export function KeyboardHint() {
  return (
    <div className="hidden items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-[11px] font-semibold text-[var(--text-3)] xl:inline-flex">
      <Keyboard size={13} />
      <span>Ctrl+K actions</span>
      <span className="opacity-60">•</span>
      <span>G then D/P/B/S/W</span>
      <span className="opacity-60">•</span>
      <span>Esc closes panels</span>
    </div>
  )
}
