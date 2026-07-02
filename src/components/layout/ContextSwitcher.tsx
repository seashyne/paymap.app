"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Briefcase, LayoutGrid, Store, ChevronDown } from "lucide-react"

export type WorkspaceContext = "personal" | "business" | "merchant"

const CONTEXT_META: Record<WorkspaceContext, { label: string; href: string; icon: any; accent: string; description: string }> = {
  personal: { label: "Personal", href: "/dashboard", icon: LayoutGrid, accent: "#8b5cf6", description: "เงินส่วนตัว กระเป๋า และเป้าหมาย" },
  business: { label: "Business", href: "/business", icon: Briefcase, accent: "#0ea5e9", description: "รายรับรายจ่าย ทีม ใบแจ้งหนี้" },
  merchant: { label: "Merchant", href: "/merchant", icon: Store, accent: "#fb7185", description: "POS คำสั่งซื้อ สต็อก หน้าร้าน" },
}

export default function ContextSwitcher({ currentContext, availableContexts, compact = false }: { currentContext: WorkspaceContext; availableContexts: WorkspaceContext[]; compact?: boolean }) {
  const router = useRouter()
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function onPointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false)
    }
    window.addEventListener("mousedown", onPointer)
    window.addEventListener("keydown", onKey)
    return () => {
      window.removeEventListener("mousedown", onPointer)
      window.removeEventListener("keydown", onKey)
    }
  }, [])
  const contexts = useMemo(() => {
    const base = availableContexts.length ? availableContexts : [currentContext]
    const unique = Array.from(new Set(base)) as WorkspaceContext[]
    if (!unique.includes(currentContext)) unique.unshift(currentContext)
    return unique
  }, [availableContexts, currentContext])

  const current = CONTEXT_META[currentContext]
  const CurrentIcon = current.icon

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className="flex items-center gap-2 rounded-[18px] border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-left transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)]"
        style={{ boxShadow: "0 10px 30px rgba(15,23,42,.10)" }}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-2xl" style={{ background: `${current.accent}18`, color: current.accent }}>
          <CurrentIcon size={16} />
        </span>
        <span className={compact ? "hidden xl:block" : "block"}>
          <span className="block text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--text-3)]">Context</span>
          <span className="block text-sm font-bold text-[var(--text)]">{current.label}</span>
        </span>
        <ChevronDown size={14} className="text-[var(--text-3)]" />
      </button>

      <div className={`${open ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"} absolute right-0 top-[calc(100%+10px)] z-50 w-[320px] rounded-[24px] border border-[var(--border)] bg-[var(--card)] p-3 shadow-2xl transition duration-150`}>
        <div className="px-2 pb-2 text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--text-3)]">Workspace contexts</div>
        <div className="grid gap-2">
          {contexts.map((context) => {
            const meta = CONTEXT_META[context]
            const Icon = meta.icon
            const active = context === currentContext
            return (
              <button
                key={context}
                type="button"
                onClick={() => { setOpen(false); router.push(meta.href) }}
                className="flex w-full items-start gap-3 rounded-[20px] border px-3 py-3 text-left transition hover:bg-[var(--surface-2)]"
                style={active ? { borderColor: `${meta.accent}44`, background: `${meta.accent}10` } : { borderColor: "var(--border)" }}
              >
                <span className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-[18px]" style={{ background: `${meta.accent}18`, color: meta.accent }}>
                  <Icon size={18} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[var(--text)]">{meta.label}</span>
                    {active ? <span className="rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.16em]" style={{ background: `${meta.accent}18`, color: meta.accent }}>Active</span> : null}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-[var(--text-2)]">{meta.description}</span>
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
